# Keep it all in the house — local embeddings

**The problem this solves:** by default your chunk text goes to OpenRouter to be turned
into numbers, and the retrieved chunks go again on every question. A third party reads
those documents.

For business paperwork most people accept that. For a medical record, a divorce filing or
a tax return, you shouldn't have to.

This is the same pipeline with nothing leaving your machine. It is slower and it is free.

---

## What changes

Exactly two things: where the embedding comes from, and how big it is.

| | Default | Local |
|---|---|---|
| Embedding model | `openai/text-embedding-3-small` via OpenRouter | `nomic-embed-text` via Ollama |
| Dimensions | **1536** | **768** |
| Cost | fractions of a cent | nothing |
| Speed | ~480 ms per call | slower, depends on your machine |
| Who sees the text | you and OpenRouter | you |

**The dimension change is not optional and not cosmetic.** An embedding from a different
model lives in a different vector space. Mixing the two in one table does not throw an
error — it silently returns nonsense rankings, which is far worse than a crash. That's
exactly what the CHECK constraint is there to stop.

---

## 1. Install the model

```bash
ollama pull nomic-embed-text
ollama list
```

Confirm it answers, and confirm the size while you're there:

```bash
curl -s http://localhost:11434/api/embeddings \
  -d '{"model":"nomic-embed-text","prompt":"hello"}' \
  | python -c "import json,sys; print(len(json.load(sys.stdin)['embedding']), 'dimensions')"
```

Expect `768`. If you get something else, use that number below instead of 768 — don't
assume mine.

## 2. Change the constraint and start clean

The `kb` table currently refuses anything that isn't 1536 long.

```sql
ALTER TABLE kb DROP CONSTRAINT IF EXISTS kb_embedding_dims;
DELETE FROM kb;
ALTER TABLE kb ADD CONSTRAINT kb_embedding_dims
  CHECK (array_length(embedding, 1) = 768);
```

```bash
bash brain-sql.sh < that-file.sql
```

**`DELETE FROM kb` is not optional.** Every existing row was embedded by the other model.
Left in place they don't error — they just quietly compete with your new rows and win
sometimes, and you will spend an evening wondering why the answers got worse.

## 3. Point both workflows at Ollama

Same two HTTP Request nodes, different URL and body. In **`05 — KB ingest`** and
**`06 — KB ask`**:

| | Change to |
|---|---|
| URL | `http://host.docker.internal:11434/api/embeddings` |
| Authentication | **None** — remove the Header Auth credential |
| Body | `{ "model": "nomic-embed-text", "prompt": "<the text>" }` |
| Response path | `$json.embedding` — not `$json.data[0].embedding` |

Three things there catch people:

**The URL is not `localhost`.** Inside the n8n container, `localhost` means the container.
`host.docker.internal` is how it reaches Ollama running on your machine. On Linux you may
need to add this to the n8n service in `docker-compose.yml`:

```yaml
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

**Ollama's field is `prompt`, not `input`.** OpenAI-shaped APIs use `input`. Ollama's
native embeddings endpoint does not, and sending `input` gets you an empty response
rather than an error.

**The response shape is flatter.** OpenRouter returns `{ data: [{ embedding: [...] }] }`;
Ollama returns `{ embedding: [...] }`. The `Check 1536` node reads the OpenRouter shape,
so update it — and rename it while you're there, because a node called `Check 1536` that
checks for 768 is a trap for whoever reads this next. That includes you, in March.

## 4. Answer locally too, if you want

Steps 1–3 stop your documents leaving. But the retrieved chunks still go out to
`anthropic/claude-haiku-4.5` to be turned into a sentence.

To close that as well, point the answering node at a local model:

```bash
ollama pull llama3.1:8b
```

| | Change to |
|---|---|
| URL | `http://host.docker.internal:11434/v1/chat/completions` |
| Model | `llama3.1:8b` |
| Authentication | None |

That endpoint is OpenAI-shaped, so the body and the response parsing stay as they are.

**Be honest with yourself about the trade.** A small local model is worse at following
"reply with JSON only" and worse at refusing. The fence-stripper in the Parse node earns
its keep here, and you should re-run the refusal tests from `VERIFY.md` before trusting
it — the whole value of this build is that it says "I don't have that in your documents"
when it doesn't, and that is exactly the behavior a weaker model degrades first.

---

## Verify you actually cut the cord

Don't take the config's word for it.

```bash
# Watch Ollama's log while you ask a question - you should see the request arrive
ollama serve   # if it is not already running as a service

# Then, in the dashboard or with curl, ask something. If nothing appears in
# Ollama's log, you are still calling OpenRouter and you have changed nothing.
```

Then confirm the dimension actually took:

```bash
docker compose exec -T postgres psql -U brain -d brain -tAc \
  'SELECT DISTINCT array_length(embedding,1) FROM kb;'
```

- [ ] one row, `768`

If you get two rows, you have both models' vectors in the table and your rankings are
already unreliable. `DELETE FROM kb` and re-ingest.
