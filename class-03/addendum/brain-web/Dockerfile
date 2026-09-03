# The dashboard's own small server. Two jobs: serve the pages, and turn a document
# into Markdown so the ingest workflow can read it.
#
# MarkItDown is Python and n8n is Node, so the converter was never going to live
# inside the n8n container. This is the smallest thing that bridges that.
FROM python:3.12-slim

# Pinned on purpose. A member installing this in six months must get the behaviour
# that is on camera today, not whatever the latest release does to table extraction.
RUN pip install --no-cache-dir \
      "markitdown[all]==0.1.7" \
      "fastapi==0.115.6" \
      "uvicorn==0.34.0" \
      "python-multipart==0.0.20"

WORKDIR /app
COPY app.py .

# The dashboard files are MOUNTED, not copied - edit dashboard/ask.html, hit refresh,
# see the change. Copying them in would mean rebuilding the image to move a button.
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
