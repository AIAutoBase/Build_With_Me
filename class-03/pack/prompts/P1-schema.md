# P1 — The table that remembers

**What it builds:** the `kb` table, a full-text index, a cosine-similarity function, the
hybrid search function, and a view that tells you what's in there.

**Before you run it:** your Class 2 stack is up (`bash brain-up.sh`, or
`docker compose ps` shows both containers `Up`).

**Safe to run twice.** Everything is `IF NOT EXISTS` or `OR REPLACE`.

**Video:** *The table that remembers* (~3 min)

---

## The prompt

Paste this whole block into Claude Code, from the folder your stack lives in
(`~/brain` if you used the installer).

```text
I have a Postgres container from an earlier class, running under Docker Compose in
this folder. It has a database called `brain` with a `messages` table in it. I want
to add a knowledge base to it — somewhere to put documents I feed it, and the
ability to search them by meaning.

Print the folder you are working in and the container name you found, and confirm
both with me before you change anything.

Constraints, and these are not negotiable:

- Use ONLY what stock Postgres ships with. Do not install pgvector, do not pull a
  different Postgres image, do not recreate the container. That database already
  has my email in it and I am not risking it for an extension.
- Everything must be idempotent. I will run this more than once.
- Do not touch the `messages` table.

Create, in the `brain` database:

1. A table `kb`:
   - id           bigserial primary key
   - source       text not null        -- filename or title, used as the citation
   - chunk_index  int not null default 0
   - content      text not null
   - embedding    float8[] not null
   - created_at   timestamptz not null default now()
   - A CHECK constraint that the embedding has exactly 1536 dimensions.
   - A UNIQUE constraint on (source, chunk_index).

2. A generated tsvector column `tsv` over `content`, English config, STORED, with a
   GIN index on it. Generated, not trigger-maintained — it must not be able to drift
   from the content.

3. A function `cosine_sim(a float8[], b float8[]) RETURNS float8`. Plain SQL, no
   extension. Return 0 when either magnitude is 0 rather than dividing by zero.
   Mark it IMMUTABLE STRICT PARALLEL SAFE.

4. A function `kb_search(question_embedding float8[], question_text text,
   want int DEFAULT 5, narrow int DEFAULT 200)` returning (id, source, content, score).
   Two stages:
   - Narrow: full-text match on `tsv` using websearch_to_tsquery, LIMIT narrow.
   - Rank: cosine_sim over only those rows, ORDER BY score DESC, LIMIT want.
   - Fallback: if the full-text stage returns nothing at all, rank over the table
     instead, so a purely semantic question with no keyword overlap still works.

5. A view `kb_sources`: source, chunk count, last ingested, newest first.

Explain the two constraints to me in one sentence each before you apply them — I
want to know what they protect me from, not just that they exist.

Apply it, then show me:
- the output of `\d kb`
- the output of `\df cosine_sim kb_search`
- `SELECT * FROM kb_sources;`  (empty is the correct answer right now)

End with the one command I can run to prove the schema is there.
```

---

## Why the two constraints matter

Ask the model to explain them and it should tell you roughly this. If it doesn't,
it didn't understand what it built.

**The 1536 CHECK.** An embedding from a different model lives in a different vector
space. Mixing two models' vectors in one table does not error — it silently returns
nonsense rankings, which is far worse than a crash. Pinning the dimension makes a model
swap fail loudly on the first insert instead of quietly degrading every search you run
afterwards.

**The UNIQUE (source, chunk_index).** Re-ingesting the same document should update it,
not duplicate it. Without this, feeding the same lease in twice doubles every chunk, and
your retrieval starts returning the same paragraph five times because it genuinely is in
there five times.

## What you should see

```
                         Table "public.kb"
   Column    |           Type           | ...
-------------+--------------------------+-----
 id          | bigint                   |
 source      | text                     |
 chunk_index | integer                  |
 content     | text                     |
 embedding   | double precision[]       |
 created_at  | timestamp with time zone |
 tsv         | tsvector                 | generated always as (...) stored
```

Look at `embedding`: `double precision[]`. An array of numbers. That is all an
embedding has ever been, and that is why this needs no extension.

## If it goes wrong

| What you see | What it means |
|---|---|
| `ERROR: could not open extension control file .../vector.control` | You (or the model) tried pgvector. That's the expected failure — it isn't on this image. Carry on without it. |
| `ERROR: relation "messages" does not exist` | The `brain` database was never created — this is the `umask` bug. Re-run the installer from this class pack, which has the fix. |
| It connected to the `n8n` database instead | `n8n` is n8n's own 125-table database. Yours is `brain`. Tell it to use `-d brain`. |

## The fallback

If the prompt goes sideways, `assets/schema-kb.sql` in this pack is the same thing,
already written:

```bash
bash brain-sql.sh < schema-kb.sql
```
