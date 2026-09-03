# P5 — Give the dashboard tabs, and a server of its own

**What it builds:** a small web service beside n8n that serves the dashboard and knows
how to turn a document into Markdown, plus a dashboard split into three tabs.

**Before you run it:** the Class 3 pack works, and `SELECT * FROM kb_sources;` returns
your documents.

---

## Why the dashboard needs a server at all

Until now `dashboard.html` was a file you double-clicked. That works for one page. It
stops working the moment you want tabs, because Chrome refuses to let a file opened from
disk load another file from disk. Nothing is broken and no error appears on the page —
the tab is just empty.

The other reason is MarkItDown. It is Python. n8n is Node. The converter was never going
to live inside the n8n container, so it needs somewhere to be, and once you have a small
Python service running anyway, serving four HTML files is free.

---

## The prompt

```text
I have n8n and Postgres running in Docker from a docker-compose.yml in this folder.
I want to add one more container next to them.

Build me:

1. A folder `brain-web/` containing a Dockerfile and app.py.

   The Dockerfile: python:3.12-slim, and pip install markitdown[all], fastapi,
   uvicorn and python-multipart. PIN every version - I want the same behaviour in
   six months, not the latest release.

   app.py is a FastAPI app with exactly three things:
     - GET /health   -> {ok, markitdown version}
     - POST /convert -> takes an uploaded file, returns JSON with the Markdown
     - everything else served as static files from /app/static

   Rules for /convert, and I want each one in the code with a comment saying why:
     - refuse a file over 20 MB before reading it
     - if the extracted text is under 50 characters, do NOT return it as a success.
       A scanned PDF is a picture of a page and has no text in it. Return
       {ok: false, reason: "empty"} with a 200, because nothing is broken - the file
       genuinely has nothing to read. Between 50 and 200 characters, return it but
       flag it as thin.
     - write the endpoint as `def`, not `async def`, and tell me why that matters
       for a synchronous CPU-bound library.

   No database, no chunking, no embedding, no API keys in this service. It takes
   bytes and returns Markdown. Nothing else.

2. A `docker-compose.override.yml` that adds this as a service called `brain-web`,
   builds from ./brain-web, mounts ./dashboard at /app/static read-only, and
   publishes port 8088.

   Use an override file. Do NOT edit my existing docker-compose.yml.

3. Split my dashboard into `dashboard/`:
     index.html   - the shell: header, a three-tab bar, and the shared CSS
     config.js    - one line holding my n8n address, and nothing else
     ask.html     - the ask box I already have
     inbox.html   - empty for now
     documents.html - empty for now

   The shell loads each tab's HTML the first time I open that tab. Note that
   innerHTML does not run script tags - handle that, and leave a comment saying so,
   because it fails silently and looks like the tab just does nothing.

   Keep the existing colours and the existing rule that a refusal looks calm and a
   real failure looks red.

Then start it, show me /health answering, and open the page.
```

---

## What you should see

```bash
curl http://localhost:8088/health
{"ok":true,"markitdown":"0.1.7","max_bytes":20971520}
```

And a page at `http://localhost:8088` with three tabs, the Ask tab working exactly as it
did before.

## If it goes wrong

| What you see | What it means |
|---|---|
| `port is already allocated` | Something else has 8088. Change it in the override file. |
| Page loads, tabs do nothing | The script-tag problem above. The console will show nothing at all, which is the tell. |
| Ask tab worked before, now says CORS | The page is served from a different port than n8n, so it is cross-origin. The Respond node needs `Access-Control-Allow-Origin: *`. |
| `/health` fine, page 404 | The `dashboard/` mount is missing or the path in the override is wrong. |

## The fallback

`brain-web/` and `dashboard/` are in this addendum, already written. Use them if you would
rather read working code than generate it — but read them either way.
