# P3 — Ask your brain

**What it builds:** a webhook you can ask a question. It embeds the question, retrieves
the chunks that actually relate to it, and has a model answer **from those chunks only** —
or say it doesn't know.

**Before you run it:** P1 and P2 are done, and `kb_sources` shows chunks.

**Video:** *Ask your brain* (~4 min) — the one that carries the class.

> **The refusal is the feature.** Any of this is easy to build if you don't care whether
> the answer is true. What separates a memory from a chatbot is that it says *"I don't
> have that in your documents"* instead of inventing a plausible number. Test the refusal
> before you trust the answers.

---

## The prompt

```text
I have n8n on port 5678 and a Postgres database `brain` containing a table `kb` and a
function:

  kb_search(question_embedding float8[], question_text text, want int DEFAULT 5,
            narrow int DEFAULT 200)
  RETURNS TABLE (id bigint, source text, content text, score float8)

score is cosine similarity: 1.0 is identical, 0 is unrelated.

Build an n8n workflow called `06 — KB ask`. Shape:

  Webhook -> HTTP Request (embed question) -> Postgres (kb_search)
          -> Code (decide) -> HTTP Request (answer) -> Code (parse) -> Respond to Webhook

1. Webhook node:
   - Method POST, path `ask`, respond using a Respond to Webhook node.
   - Input body: { "question": "..." }

2. Embed the question with the SAME model used to embed the documents:
   - POST https://openrouter.ai/api/v1/embeddings
   - model: openai/text-embedding-3-small
   - Authentication: Generic -> Header Auth -> existing credential `OpenRouter`.
     Never put the key in a node parameter.
   A question embedded with a different model than the documents returns nonsense
   rankings without erroring. Same model, both sides.

3. Postgres node, Execute Query:
   SELECT source, content, score FROM kb_search($1::float8[], $2, 5);
   with the question embedding and the raw question text as parameters.

4. Code node called `Decide`. This is the important one.
   - If there are no rows, OR the highest score is below 0.28, do NOT call the
     answering model at all. Return:
       { answered: false,
         answer: "I don't have that in your documents.",
         sources: [] }
     Use that sentence word for word. The model downstream is told to say the same
     thing, so a refusal reads identically no matter which half produced it.
   - Otherwise build a context block from the returned chunks, each prefixed with
     its source, and pass it on.
   Explain to me why refusing here is better than letting the model refuse. I want
   the reasoning in the workflow notes, not just in the chat.

5. Answer with an HTTP Request node:
   - POST https://openrouter.ai/api/v1/chat/completions
   - model: anthropic/claude-haiku-4.5
   - temperature: 0
   - Same Header Auth credential.
   - System message, in substance: You answer questions about the user's own
     documents. Use ONLY the numbered context. Do not use outside knowledge. If the
     context does not contain the answer, set answer to exactly "I don't have that in
     your documents." When you do answer, quote the figure or term. Two sentences or
     fewer. Reply with a JSON object only:
     {"answer": "...", "used_sources": ["..."]}.
   - User message: the context block, then the question.

6. Code node `Parse`:
   - Strip markdown code fences before parsing. The model returns them even when the
     system prompt forbids it — assume the fence is there.
   - If JSON.parse still fails, return the raw text as the answer rather than
     throwing. A failed parse must not take the whole request down.
   - The model can refuse even when retrieval let it through - the chunks cleared the
     score bar but did not actually contain the answer. Detect that refusal sentence
     and report it as answered: false with no sources, or the dashboard will render
     "I don't have that in your documents" as a confident answer with citations
     attached to it.
   - Otherwise return { answered: true, answer, sources } where sources are the
     distinct source filenames from the retrieved chunks.

7. Respond to Webhook:
   - Respond With: JSON
   - Response header `Access-Control-Allow-Origin: *`. The dashboard is opened from
     disk, so its origin is "null" and the fetch is blocked without this.

Activate the workflow when it's built — the dashboard calls the production URL and
an inactive workflow returns 404.

Then test it for me with these two, and show me both raw responses:
  1. A question the documents answer.
  2. "What is my dog's name?" — which they do not.
```

---

## The two tests, and what correct looks like

**A question that is in there:**

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How much is the security deposit on the warehouse?"}'
```

```json
{
  "answered": true,
  "answer": "The security deposit is $7,700, equal to two months of base rent.",
  "sources": ["warehouse-lease.md"]
}
```

**A question that is not:**

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is my dog'\''s name?"}'
```

```json
{
  "answered": false,
  "answer": "I don't have that in your documents.",
  "sources": []
}
```

If the second one comes back with a name in it, stop. Something is wrong with your
threshold or your system message, and everything else it tells you is now suspect.

## Why the threshold refuses before the model does

Two reasons, and the second is the real one.

**It's cheaper.** No API call for a question you already know you can't answer.

**It's more honest.** A model handed five irrelevant chunks and asked a question will
often find *something* in them to build an answer out of — that's what it's good at. The
similarity score already knows there's nothing there before the model gets a chance to be
helpful about it. Refusing at retrieval means the refusal doesn't depend on the model
being in the mood to refuse.

### Where 0.28 comes from

It is not a guess. Measured on this document pack, and shown on camera in *Why it is
fast*:

| | Score range |
|---|---|
| A question the documents answer | **0.35 – 0.59** |
| A question they do not | **0.12 – 0.26** |

There is an empty band between 0.26 and 0.35 and the threshold sits in the middle of it.
That gap is the thing that makes this work — it is wide, and nothing lands in it.

It is still specific to these documents. Watch what your own questions score and move it:
too high and it refuses things it does know, too low and it starts guessing. Every
response carries `top_score` so you can see where yours land.

## If it goes wrong

| What you see | What it means |
|---|---|
| `404` on the production URL | The workflow is saved but not **Active**. |
| Answers are confidently wrong | Questions and documents were embedded with different models. Re-check both nodes name the same one. |
| `JSON.parse` error in the Parse node | The fence stripper isn't running. The model sent ` ```json ` — it does this even when told not to. |
| It answers "I don't know" to everything | Threshold too high, or `kb` is empty. Run `SELECT * FROM kb_sources;`. |
| CORS error in the browser, fine in curl | The `Access-Control-Allow-Origin` header is missing from the Respond node. |

## The fallback

`assets/demo/06-kb-ask.json` — import, set both credentials, activate.
