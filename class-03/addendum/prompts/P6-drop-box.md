# P6 — Drop a document on the page

**What it builds:** two workflows. One takes a file from the browser, converts it,
chunks it, embeds it and stores it. The other lists what is in the memory and removes
something from it.

**Before you run it:** P5 is done and `curl http://localhost:8088/health` answers.

---

## What changes, and what does not

Nothing about the pipeline changes. Same chunker, same 180 words with 30 of overlap, same
embedding model, same `kb` table, same upsert. MarkItDown sits in front of it, and the
browser sits in front of that.

One thing is genuinely new, and it only becomes a problem now.

**Re-ingesting used to be rare. With a drop box it is the normal thing you do.** You fix
a clause in a contract and drop it again. And if the new version is shorter than the old
one, the upsert updates the chunks that still exist and leaves the extra ones behind —
old chunk 5 and 6, still in the table, still carrying their embeddings, still retrievable,
still cited, describing a paragraph you deleted. Nothing errors. Nothing tells you.

So the workflow ends by deleting any chunk of that document with an index higher than the
last one it just wrote.

---

## The prompt

```text
I have n8n in Docker with a Postgres beside it, a `kb` table in the `brain` database
with columns id, source, chunk_index, content, embedding (float8[], 1536 dims) and a
UNIQUE constraint on (source, chunk_index). There is a container called brain-web on
the same compose network that exposes POST http://brain-web:8000/convert - send it a
file as multipart form-data and it returns {ok, filename, chars, warn, markdown}.

Build me two workflows.

WORKFLOW 1: `07 - KB upload`

  Webhook (POST, path kb-upload, respond using a Respond node)
    -> find the uploaded file
    -> POST it to http://brain-web:8000/convert
    -> if the converter says ok:false, respond with that and STOP. Do not ingest it.
    -> otherwise: chunk, embed, verify 1536 dimensions, upsert
    -> then delete the stale tail
    -> respond with the source name and how many chunks landed

  Details that matter:

  1. The Webhook node names the uploaded binary differently across n8n versions.
     Do not hard-code the property name - take whatever binary property is there,
     and if there is none, throw an error that lists what WAS present.

  2. Reuse the chunker from `05 - KB ingest` exactly. Do not rewrite it. 180 words,
     30 of overlap, and no trailing chunk that is already contained in the one
     before it.

  3. The tail delete must run ONCE, not once per chunk, and it needs the highest
     chunk_index actually written:
        DELETE FROM kb WHERE source = $1 AND chunk_index > $2
     Run it AFTER the inserts, not before. Clearing first means a failure halfway
     through leaves me with no document at all; sweeping last means the worst case
     is a stale tail that the next good run removes.

  4. Careful where you read the chunk list from for that count. The Postgres node's
     output is a query result, not my chunks - it has no source and no chunk_index
     on it. Take the count from the node that produced the chunks.

  5. Every Respond node needs Access-Control-Allow-Origin: * or the browser blocks
     it and blames CORS while the data was fine.

WORKFLOW 2: `08 - KB library`

  Two webhooks in one workflow:
    GET  kb-sources -> SELECT * FROM kb_sources, returned as {"sources": [...]}
    POST kb-forget  -> DELETE FROM kb WHERE source = $1, parameterised

  Same CORS header on both.

Then build me the Documents tab in dashboard/documents.html: a drop zone, a list of
what uploaded this session, and a table of what is in the memory with a forget button.

Upload the files ONE AT A TIME, not in parallel - twelve files dropped at once fires
twelve executions and hits the embedding rate limit.

Show me three different looks in that list, because they mean three different things:
  - stored: green
  - converter refused it, nothing to read: grey and calm. This is NOT an error.
  - webhook unreachable or returned an error status: red. THIS is the broken one.

When it is built, prove the tail delete works: ingest a long document, then ingest a
much shorter one with the same filename, and show me the chunk count going down and
the old chunks gone.
```

---

## What you should see

Drop a PDF. A row appears, goes from "converting" to a chunk count in a few seconds, and
the table below gains a line.

Then the test that matters:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT source, chunk_index FROM kb WHERE source = 'your-file.pdf' ORDER BY chunk_index;"
```

Ingest a shorter version of the same file and run it again. The high-numbered chunks must
be gone. If they are still there, the sweep is not running, and the most likely reason is
point 4 above — it is counting the wrong node's output, which makes the delete
`WHERE source = NULL`. That matches nothing, raises nothing, and reports success.

## If it goes wrong

| What you see | What it means |
|---|---|
| `No file on this request` | The browser sent JSON instead of multipart form-data. |
| Upload succeeds, content is gibberish | The converter was skipped and you stored base64. Check `/convert` is actually being called. |
| Everything one row called `document` | The filename never reached the chunker, so every document shares a source and the UNIQUE constraint merged them. |
| 404 on the webhook | Saved is not Active. |
