# Verify before you publish

**Status: run end to end against the live stack on box 94, 2026-08-24.** Both workflows
were imported, executed and inspected at the data level. It found two bugs that every
static check had passed:

| Found | Effect |
|---|---|
| `To text` used operation `binaryToPropery` — n8n's *"Move File to Base64 String"* | The chunker received base64. No spaces in base64, so each document became one giant "word", embedded and stored as gibberish. Every node green. |
| `extractFromFile` dropped the binary, losing the filename | Every document got the same fallback source, and `UNIQUE (source, chunk_index)` silently merged **four documents into one row**. |

Both are fixed (`operation: "text"`, `options.keepSource: "both"`, and the chunker now
throws rather than inventing a source name). Verified afterwards: four sources, four
chunks, readable text, 1536 dimensions, correct citations.

> The lesson worth keeping: n8n reported `"status": "success"` for a run that stored
> base64 under the wrong name. **A green execution is not evidence.** Look at the rows.

Your own rule, from `OUTLINE.md`:

> If the four prompts are not tested working end to end by Sunday, move the class. An
> untested prompt in a pinned post generates more support load than the class generates
> value.

Budget 40 minutes. Each step proves the one before it, so stop at the first failure
rather than pressing on.

---

## Already verified, and how

These were checked by executing the actual shipped code, not by reading it.

| Claim | Method | Result |
|---|---|---|
| Both workflow JSONs are well-formed; every connection resolves to a real node | parsed, cross-referenced | pass |
| Node `typeVersion`s match the Class 2 demos (webhook 2, postgres 2.4, respond 1.1, code 2) | compared | pass |
| No credential value appears in either JSON | string scan for `sk-or-`, `Bearer `, `password`, `apiKey` | pass |
| The chunker produces **four documents, four chunks** | `test-chunker.py`, real Code-node body against the real `docs-pack/` | pass |
| No chunk is wholly contained in the one before it | `test-chunker.py` | pass — **failed on 3 of 4 documents until 2026-08-24** |
| The shipped JavaScript and the rehearsal Python agree word for word | `test-chunker.py` runs both under node and diffs them | **identical** |
| The 30-word overlap actually overlaps | each chunk's tail vs the next chunk's head, on the only text in the pack long enough to split | exact on all 4 boundaries |
| `chunk_index` is 0-based and gapless per source | ran it | pass |
| The fence-stripper survives every shape the model produces | 6 inputs: bare JSON, ` ```json `, bare ` ``` `, fence + whitespace, prose, empty | all 6 return a usable answer, none throw |
| The refusal threshold behaves at the boundary | 0.71 / 0.11 / no rows / exactly 0.28 / 0.2799 | correct on all five |
| A refusal cites no sources | ran it | pass |
| A **model-side** refusal is reported as a refusal, not as an answer with citations | fed the refusal sentence through `Parse` | `answered:false`, sources emptied |
| `dashboard.html` JavaScript parses | `node --check` | pass |
| Refusal wording is identical in `Decide`, the system prompt, the dashboard and the post | grep across the pack | one string everywhere |

**What that does not cover:** anything requiring Postgres, n8n, or the OpenRouter API.
Which is most of what can actually go wrong.

---

## The run

### 1. The stack

```bash
cd ~/brain
bash brain-up.sh
```

Expect `healthz 200 · webhook 200 · N rows in brain.messages`.

### 2. The schema (P1)

```bash
bash brain-sql.sh < assets/schema-kb.sql
docker compose exec -T postgres psql -U brain -d brain -c '\d kb'
docker compose exec -T postgres psql -U brain -d brain -c '\df cosine_sim kb_search'
```

- [ ] `kb` exists with `embedding` as `double precision[]`
- [ ] `tsv` shows `generated always as (...) stored`
- [ ] both functions listed

Then run it **again** and confirm no errors — it has to be idempotent, because members
will run it twice.

### 3. Prove cosine_sim is not lying

Costs nothing and catches a whole class of silent wrongness:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[1,0,0]::float8[]) AS same,
          cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[0,1,0]::float8[]) AS unrelated,
          cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[-1,0,0]::float8[]) AS opposite,
          cosine_sim(ARRAY[0,0,0]::float8[], ARRAY[1,0,0]::float8[]) AS zero_vector;"
```

- [ ] `1 | 0 | -1 | 0` — in that order. Anything else and every search you run afterwards
      is quietly ranked wrong.

### 4. Documents where the container can see them

```bash
docker compose cp ./assets/docs-pack n8n:/home/node/docs-pack
docker compose exec n8n ls -la /home/node/docs-pack
```

- [ ] four `.md` files listed

### 5. Credentials

- [ ] n8n → Credentials → **Header Auth** named `OpenRouter`,
      header `Authorization`, value `Bearer <key>`
- [ ] the Class 2 **Postgres** credential points at database `brain`, not `n8n`
- [ ] the key has a balance — check `https://openrouter.ai/credits`

### 6. Ingest (P2)

Expect **four** chunks, one per document. Every practice document is shorter than 180
words, so each fits in a single chunk.

> Video 2 says *seven*. That was the old chunker emitting a trailing scrap already
> contained in the chunk before it; it was removed on 2026-08-24. `VIDEOS.md` lists the
> three ways to close that gap — the cheapest is one line in the pinned post.


Run the prompt in `assets/prompts/P2-ingest.md`, or import
`assets/demo/05-kb-ingest.json`. Execute it once.

```bash
docker compose exec -T postgres psql -U brain -d brain -c 'SELECT * FROM kb_sources;'
```

- [ ] four sources, **four chunks total**, one per document
- [ ] run it a second time — the count stays at four (the `ON CONFLICT` upsert works)
- [ ] `README.txt` is **not** in `kb_sources` — the file selector is `*.md` for a reason

```bash
docker compose exec -T postgres psql -U brain -d brain -tAc \
  'SELECT array_length(embedding,1) FROM kb LIMIT 1;'
```

- [ ] `1536`

### 7. Ask (P3) — the one that matters

Build from `assets/prompts/P3-ask.md` or import `assets/demo/06-kb-ask.json`.
**Activate it.**

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How much is the security deposit on the warehouse?"}'
```

- [ ] `answered: true`, the answer contains **$7,700**, source is `warehouse-lease.md`

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is my dog'\''s name?"}'
```

- [ ] `answered: false`, empty `sources`

**If the second one invents a name, stop and fix it before anything is published.**
Everything else the system says is now suspect, and that refusal is the thing the class
is about.

Three more worth running, because they are what members will actually ask:

```bash
# a figure from a different document
-d '{"question":"What does the equipment warranty cover?"}'
# something plausible but absent - the dangerous case
-d '{"question":"What is the insurance deductible for flood damage?"}'
# a question with no keyword overlap at all - exercises the fallback branch
-d '{"question":"Am I protected if the roof leaks?"}'
```

- [ ] the middle one refuses if the policy genuinely doesn't say
- [ ] the last one returns something rather than erroring (the pure-cosine fallback)

### 8. The dashboard (P4)

Open `assets/dashboard.html` by double-clicking it.

- [ ] tiles populate, no red box
- [ ] ask it the deposit question → answer plus a source pill
- [ ] ask it the dog question → **muted and calm**, not red
- [ ] stop the ask workflow (deactivate) and ask again → red box saying it's inactive
- [ ] reactivate, confirm it recovers without a reload

### 9. Cold start

The one everybody skips, and the reason Class 2's system was fragile:

```bash
docker compose down && bash brain-up.sh
```

- [ ] the ask webhook answers again without you touching anything

---

## Before the pinned post goes out

- [ ] Every command above ran clean
- [ ] The zip opens on a phone and the README is readable
- [ ] No key, password, personal path or mailbox appears in any file in the zip
- [ ] `install.sh` in the zip contains `chmod 644 schema.sql`
- [x] Platform decided — Skool's own live room, 2026-08-24
- [ ] Live room tested with a second person, who confirmed the terminal was readable
- [ ] `SKOOL-POST.md` blanks filled: date, time, and the two zip links

---

## Known-weak spots

Where I'd expect this to break first, in order:

1. **`queryReplacement` and the embedding.** The vector is passed as a JSON string and
   cast in SQL (`json_array_elements_text`) rather than bound as a raw array, because
   n8n's parameter binding and Postgres `float8[]` do not get along. It is the single
   most likely thing to need a tweak on a real run.
2. **`extractFromFile` on markdown.** The node is set to convert binary to text. If your
   n8n build returns the content on a different property, the chunker's
   `item.json.data || item.json.content` fallback covers two shapes but not a third.
3. **The `0.28` threshold.** Chosen from the bands measured for video 4 — answerable
   questions scored 0.35–0.59, unanswerable ones 0.12–0.26, and 0.28 sits in the empty
   gap. That gap is wide, but it was measured on *these four documents*. Yours may differ.
4. **`anthropic/claude-haiku-4.5` and `openai/text-embedding-3-small` slugs.** Check both
   resolve on OpenRouter the week of the class. A retired slug fails in a way that looks
   like a broken workflow rather than a bad name — this has bitten this workspace before.
