# P2 — Feed it a document

**What it builds:** an n8n workflow that takes a document, cuts it into overlapping
chunks, turns each chunk into numbers, and stores them in `kb`.

**Before you run it:** P1 is done — `kb` exists.

**Safe to run twice.** Re-ingesting the same document updates its chunks instead of
duplicating them, because of the UNIQUE constraint P1 created.

**Video:** *Feed it a document* (~4 min)

---

## Set the credential up first, by hand

The prompt will not do this, on purpose — a key typed into a node parameter ends up in
every export you ever share.

In n8n: **Credentials → New → Header Auth**

| Field | Value |
|---|---|
| Name | `OpenRouter` |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_OPENROUTER_KEY` |

Your key is at `https://openrouter.ai/keys`. It needs a balance — a key with no
credit fails with an error that does **not** say "you're out of money" in plain
language. Embedding this whole document pack costs a fraction of a cent.

The Postgres credential from Class 2 already exists. Check it points at database
**`brain`**, not `n8n`.

---

## The prompt

```text
I have n8n running in Docker on port 5678, with a Postgres container beside it. In
the `brain` database there is a table `kb` with columns: id, source, chunk_index,
content, embedding (float8[], exactly 1536 dimensions), created_at, and a generated
tsvector column. There is a UNIQUE constraint on (source, chunk_index).

Build me an n8n workflow called `05 — KB ingest` that reads a document from disk,
splits it into chunks, embeds each chunk, and stores them.

The shape:

  Manual Trigger -> Read File -> Code (chunk) -> HTTP Request (embed) -> Postgres (upsert)

Details that matter:

1. Read the file from a path I can edit in one place at the top of the workflow.
   The n8n container can only see paths inside itself — tell me exactly where to put
   my documents so the container can read them, and how to check that it can.

2. Chunking, in a Code node set to "Run Once for All Items":
   - Windows of 180 WORDS with 30 words of overlap. Words, not characters.
   - Emit one item per chunk with: source (the filename, not the full path),
     chunk_index (0-based), content.
   - Explain to me in one sentence why the overlap is there, and one sentence on
     why words rather than characters. If you cannot explain them, do not write it.
   - Do not emit a trailing chunk whose words are already contained in the chunk
     before it. A document shorter than 180 words must produce exactly one chunk.
   - Then PROVE the overlap is real, do not just tell me it is: feed the chunker a
     document long enough to produce at least two chunks, print the last 30 words of
     chunk 0 and the first 30 words of chunk 1, and show me they are the same words.
     A chunker with no overlap produces the same number of rows and the same clean
     run, so this is the only way either of us finds out.

3. Embedding, one HTTP Request node:
   - POST https://openrouter.ai/api/v1/embeddings
   - Authentication: Generic Credential Type -> Header Auth -> the existing
     credential named `OpenRouter`. Do NOT put my key in a node parameter and do NOT
     ask me to paste it into the workflow.
   - Body: { "model": "openai/text-embedding-3-small", "input": <the chunk text> }
   - Set the node to run once per item, and make sure a failure on one chunk does
     not silently produce a row with a broken embedding.

4. Extract the vector from the response and confirm it has 1536 numbers before
   inserting. If it doesn't, stop and tell me — do not insert a wrong-sized vector,
   because the CHECK constraint will reject it anyway and the error will point at
   Postgres instead of at the model.

5. Postgres node, Execute Query, parameterised:
   INSERT INTO kb (source, chunk_index, content, embedding)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (source, chunk_index) DO UPDATE
     SET content = EXCLUDED.content,
         embedding = EXCLUDED.embedding,
         created_at = now();

Do not activate the workflow. This one runs manually.

When it is built, run it once against a file I give you, then show me:
  SELECT * FROM kb_sources;
and tell me how many chunks landed and how long it took.
```

---

## Your documents are not Markdown, and that's fine

This workflow reads text. Real paperwork is PDF, DOCX, XLSX, PPTX.

**`MARKITDOWN.md` in this pack is the doorway** — Microsoft's converter, one command,
almost any document to clean Markdown with its headings and tables intact:

```bash
markitdown insurance-policy.pdf -o insurance-policy.md
head -40 insurance-policy.md      # look at it before you ingest it
```

Nothing in this prompt changes. MarkItDown sits in front of the pipeline, not inside it.

## Where to put your documents

The n8n container cannot see your desktop. The compose file from Class 2 mounts a
volume for n8n's own data — the simplest thing that works is to copy documents into the
container's own filesystem:

```bash
docker compose cp ./docs-pack n8n:/home/node/docs-pack
docker compose exec n8n ls -la /home/node/docs-pack
```

Then the path in the workflow is `/home/node/docs-pack/warehouse-lease.md`.

If the second command lists your files, n8n can read them. If it doesn't, nothing
downstream will work and the error you get will be about something else.

## What you should see

```
        source         | chunks |         last_ingested
-----------------------+--------+-------------------------------
 warehouse-lease.md    |      1 | 2026-08-26 10:14:22.881+00
 invoice-supplyco.md   |      1 | 2026-08-26 10:14:21.402+00
 insurance-policy.md   |      1 | 2026-08-26 10:14:19.955+00
 equipment-warranty.md |      1 | 2026-08-26 10:14:18.203+00
```

**Four documents, four chunks.** Every practice document is shorter than 180 words, so
each one fits in a single chunk. If you get more than four, your chunker is emitting a
trailing scrap that is already inside the chunk before it — see below.

## Why the overlap, and why words

You cut a document at 180 words. There is no reason that cut lands anywhere useful — it
lands in the middle of the paragraph containing the number you're about to ask about. The
30-word overlap means that passage also appears whole at the start of the next chunk, so
retrieval can still find it.

Skip the overlap and the system works fine right up until the one question whose answer
straddles a boundary, and then it fails in a way that looks like the model being stupid.

**Words rather than characters** because a character cut does not respect a word. Cut at
800 characters and `$7,700` can become `$7,` at the end of one chunk and `700` at the
start of the next — and neither half matches a question about the deposit. A word window
cannot split a figure down the middle.

## Why every document here is exactly one chunk

Every practice document is **shorter than 180 words**, so each one fits in a single chunk
and no overlap is involved. That is expected, and it is why the count is four.

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT source, chunk_index, length(content) AS chars FROM kb ORDER BY source, chunk_index;"
```

The overlap only shows up once a document is longer than 180 words — which every real PDF
you own will be.

**And it is the part that fails silently.** A chunker that steps a full 180 words with no
overlap at all produces the same number of rows, ingests without an error, and answers
most questions correctly. You find out it was wrong on the one question whose answer
straddled a boundary, and by then it looks like the model being stupid rather than a bug
you introduced weeks earlier.

That is why the prompt asks for the seam to be **proved rather than promised**: the last
30 words of a chunk must be the first 30 words of the next one, and looking is the only
way either of us finds out.

## If it goes wrong

| What you see | What it means |
|---|---|
| `ENOENT: no such file or directory` | The container can't see the path. Run the `docker compose cp` above. |
| `new row for relation "kb" violates check constraint "kb_embedding_dims"` | The embedding came back the wrong size. You changed the model, or the response shape isn't what the node expects. |
| `401` from OpenRouter | The Header Auth credential is missing the `Bearer ` prefix, or the key has no balance. |
| Runs fine, `kb_sources` is empty | The Postgres node is pointed at the `n8n` database instead of `brain`. |

## The fallback

`assets/demo/05-kb-ingest.json` — import it, then set the two credentials by hand.
Read the note in the pack README about importing JSON across n8n versions first.
