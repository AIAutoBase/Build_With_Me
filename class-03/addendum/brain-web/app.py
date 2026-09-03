"""The dashboard's server, and the door documents come through.

Two responsibilities and no more:

  GET  /            the dashboard pages, mounted from ./dashboard on the host
  GET  /health      is the converter alive, and which version
  POST /convert     a file in, Markdown out

Deliberately dumb. No database, no chunking, no embedding, no API key. Everything
that makes a decision lives in the n8n workflow, where it can be read, changed, and
rebuilt from a prompt. If this file ever grows a Postgres import, something has gone
wrong with the design.
"""
import io
import os

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from markitdown import MarkItDown

# A scanned page is an image. There is no text to extract, MarkItDown returns almost
# nothing, and without a floor the pipeline stores silence and the brain later says
# "I don't have that in your documents" about a file you watched upload successfully.
EMPTY_BELOW = 50       # characters: below this it did not convert, it failed
THIN_BELOW = 200       # characters: converted, but worth a second look
MAX_BYTES = 20 * 1024 * 1024

STATIC_DIR = os.environ.get("BRAIN_STATIC", "/app/static")

app = FastAPI(title="brain-web", docs_url=None, redoc_url=None)
_md = MarkItDown()


@app.get("/health")
def health():
    try:
        import markitdown
        version = getattr(markitdown, "__version__", "unknown")
    except Exception:                                    # pragma: no cover
        version = "unavailable"
    return {"ok": True, "markitdown": version, "max_bytes": MAX_BYTES}


# `def`, not `async def`, and that is not an oversight.
#
# MarkItDown is synchronous and CPU-bound. FastAPI runs a plain `def` endpoint in a
# threadpool, so one fat PDF occupies a worker thread. Declared `async def`, the same
# call would block the event loop and every other request - including the dashboard's
# own page loads - would sit and wait behind it.
@app.post("/convert")
def convert(file: UploadFile = File(...)):
    name = os.path.basename(file.filename or "document")

    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        return JSONResponse(status_code=413, content={
            "ok": False, "filename": name, "reason": "too_big",
            "message": "That file is over %d MB." % (MAX_BYTES // (1024 * 1024)),
        })

    try:
        result = _md.convert_stream(io.BytesIO(data), file_extension=os.path.splitext(name)[1])
        markdown = (result.text_content or "").strip()
    except Exception as exc:
        # Report the failure rather than returning empty Markdown, which the caller
        # cannot tell apart from a blank document.
        return JSONResponse(status_code=422, content={
            "ok": False, "filename": name, "reason": "convert_failed",
            "message": "%s: %s" % (type(exc).__name__, str(exc)[:300]),
        })

    chars = len(markdown)

    if chars < EMPTY_BELOW:
        # 200, not an error status. Nothing broke - the file genuinely has no text in
        # it. Same shape as the ask box refusing: a correct answer of "no".
        return JSONResponse(status_code=200, content={
            "ok": False, "filename": name, "chars": chars, "reason": "empty",
            "message": "Nothing to read in that file. If it is a scan, it is a "
                       "picture of a page and needs OCR first.",
        })

    return {
        "ok": True,
        "filename": name,
        "chars": chars,
        "warn": "thin" if chars < THIN_BELOW else None,
        "markdown": markdown,
    }


# Mounted last: it claims "/", so anything above it must be declared first.
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
