# Class 10 — build prompts

**The Brain That Runs a Company, Part 10: the mouth.**

Sixteen prompts. Paste them into Claude Code one at a time, in order, from inside your brain
folder. Each one says what it builds and how you know it worked.

---

## Before you paste anything

Same three rules as Class 9:

1. **Clean git working tree before you start.** Commit after each prompt that works.
2. **Never paste a real password into a prompt.** Prompt 03 shows you where they go instead.
3. **If a prompt's result surprises you, stop and read it** before pasting the next one.
   Six of these sixteen write to a database.

### The order is the durability argument

Storage comes before upload, and upload comes before conversion. At no point does this build
have a working "drop a file here" box that writes somewhere temporary.

That ordering is not fussiness. A file the member uploaded during development, into a store
that was not yet durable, is indistinguishable afterwards from one uploaded properly — same
row, same status, same everything — except that the bytes are gone. Building the durable
store first means there is never a window in which that file can exist.

---

## Prompt 01 — MinIO, with the volume as the point

```text
Write minio.compose.yml - a separate file, do not touch my docker-compose.yml.

  - Image: pinned to an exact MinIO release tag. Not :latest. Add a comment saying that
    :latest on a storage service means an unplanned upgrade can happen during a restart.
  - A NAMED volume mounted at /data. Name it after this project, not "data".
  - Ports 9000 (API) and 9001 (console), bound to 127.0.0.1 only. Not 0.0.0.0.
  - Credentials from environment variables MINIO_ROOT_USER and MINIO_ROOT_PASSWORD, with
    NO defaults. If they are unset the container must fail to start.
  - A healthcheck.

Then write me three sentences, above the file, answering: what happens to every file I
ever upload if I run docker compose down -v, and what happens if I run docker compose
down without -v, and which of those two I am likely to type by accident at 1am.
```

**You know it worked when:** you can answer the third question without rereading.

---

## Prompt 02 — The bucket, private, and proven private

```text
Write scripts/minio-init.sh. It runs once, against a running MinIO, and:

  1. Creates a bucket named brain-files if it does not exist.
  2. Sets its policy to private. Explicitly - do not rely on the default.
  3. Enables versioning on the bucket.
  4. Prints the policy back and asserts it does not contain "public" or "*" as principal.
     Exit non-zero if it does.

Step 4 is not decoration. A bucket that is public reads exactly like a bucket that is
private, from every direction except an unauthenticated request - so the script makes an
unauthenticated request. Show me the line where it does that.

Also explain, in two sentences in a comment: what versioning buys me here, and what it
costs me in disk.
```

**You know it worked when:** the script fails loudly if you make the bucket public on purpose.
Do that once, to see it.

---

## Prompt 03 — Credentials, put where credentials go

```text
I need MinIO credentials. Do not invent them for me and do not write any value anywhere.

Instead:
  1. Add MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, MINIO_ENDPOINT and MINIO_BUCKET to
     .env.example, with names and NO values - the same pattern Class 8 established.
  2. Tell me the exact command to generate a strong password on my OS, and tell me to
     run it myself.
  3. Tell me where to paste the result, and remind me that .env is gitignored and that
     you are not going to read it back to confirm.
  4. Write a check script that verifies the four variables are non-empty WITHOUT printing
     any of them - it prints only the variable name and "set" or "MISSING".

Then tell me what the MinIO quickstart uses as its default credentials, and what happens
to a bucket with those credentials and a published port.
```

**You know it worked when:** the check script says four names and four "set", and has never
seen a value.

---

## Prompt 04 — The files table

```text
Create a migration adding two tables.

files:
  id             bigserial primary key
  sha256         text not null                -- the object key
  original_name  text not null                -- as uploaded, unmodified
  mime_type      text not null
  size_bytes     bigint not null
  zone           text not null
                 check (zone in ('personal','business','clients','general'))
  uploaded_at    timestamptz not null default now()
  uploaded_by    text null
  status         text not null default 'pending'
                 check (status in ('pending','converting','converted','failed','unsupported'))
  status_reason  text null
  markdown       text null
  ocr_used       boolean not null default false
  ocr_confidence real null

  unique (sha256, zone)     -- same bytes, two zones, two rows, one object

file_zone_moves:
  id          bigserial primary key
  file_id     bigint not null references files(id)
  from_zone   text not null
  to_zone     text not null
  moved_at    timestamptz not null default now()
  reason      text null

Index files on zone, and on status where status <> 'converted'.

Two things to explain back to me in comments, in one sentence each:
  - why the unique constraint is on (sha256, zone) and not on sha256 alone
  - why moving a file between zones needs its own table when it is just an UPDATE

Show me the SQL. Do not run it.
```

**You know it worked when:** you can answer both comment questions in your own words.

★ Insight ─────────────────────────────────────
`unique (sha256, zone)` is the whole zone model in one line. The same contract can legitimately
be both a client file and a business file — two rows, two access answers, one set of bytes on
disk. Uniqueness on `sha256` alone would force you to pick, and whichever you picked would be
wrong half the time.

`file_zone_moves` exists because an `UPDATE` erases its own history. The day someone asks "was
this in the personal zone when Clara answered that call?", the `files` row cannot answer and
the moves table can.
─────────────────────────────────────────────────

---

## Prompt 05 — The upload endpoint, streaming

```text
Add POST /api/files/upload to the dashboard's Express server.

Requirements, all load-bearing:

  - STREAM the upload. Do not use a body parser that buffers. Pipe multipart straight
    through to MinIO. Add a comment saying what happens to container memory if two people
    upload a 200 MB video at the same time through a buffering parser.
  - Compute the sha256 WHILE streaming, in the same pass. Do not read the file twice.
  - Hard size cap from a constant at the top, default 100 MB, enforced during the stream
    and not after. On exceeding it, abort the stream, delete any partial object, and
    return a message naming the limit.
  - zone comes from the request and is validated against the four values before anything
    is written. An invalid zone is a 400 before a single byte is stored.
  - original_name is stored exactly as received - bytes unchanged, no normalising, no
    slugifying, no transliteration. It is display metadata and nothing reads it as a path.
  - After the object is durable, insert the files row with status 'pending' and return.
    Do not convert. Do not wait.

Return { id, sha256, status, deduped }.
```

**You know it worked when:** a 4 GB file is refused in a couple of seconds without your
container's memory moving.

---

## Prompt 06 — Dedupe, and prove it

```text
Add dedupe to the upload path.

If an object with this sha256 already exists in the bucket, do not upload it again -
but still create the files row if this (sha256, zone) pair is new, and set deduped true
in the response.

Then write scripts/verify-dedupe.mjs that proves it end to end:
  1. Upload a test file to the general zone. Record the object count in the bucket.
  2. Upload the identical file again to the general zone. Assert: object count unchanged,
     row count unchanged, deduped true.
  3. Upload the identical file to the clients zone. Assert: object count unchanged,
     row count increased by one.
  4. Rename the file on disk and upload it again to general. Assert: object count
     unchanged, row count unchanged. Content addressing means the name is not identity.

Print each assertion with its actual numbers, not just pass or fail. I want to see the
counts.
```

**You know it worked when:** step 4 passes, which is the one that surprises people.

---

## Prompt 07 — Filenames with accents, on purpose

```text
Before we build conversion, let us break the naming layer deliberately.

Write scripts/verify-filenames.mjs. It uploads four files whose names are:

  Contrato Adquisición 2026.pdf
  Résumé — A. Nuñez.docx
  factura #17 (final).pdf
  файл.txt

For each, it asserts three things and prints the actual bytes it saw at each layer:
  1. The original_name column round-trips byte-identical to what was sent.
  2. Nothing anywhere used original_name as a filesystem path.
  3. The object key is the sha256 and contains no character from the original name.

If any of these fail, tell me WHICH layer mangled it - the multipart parser, the database
client, the terminal I am reading the output in, or the converter's shell invocation.
Naming the layer is the entire value of this script.
```

**You know it worked when:** all four round-trip — or when you find out which layer is lying,
which is more useful.

---

## Prompt 08 — Choose the converter, once

```text
This is a decision, not an implementation. Do not write the converter yet.

Give me a straight comparison of two options for turning uploaded files into markdown:

  A. markitdown (one Python dependency, covers PDF, docx, xlsx, pptx, html, csv)
  B. pandoc + pdftotext + tesseract (three system binaries, each doing one thing)

For each, tell me:
  - what it installs on my box, and how big that is
  - which of my formats it handles well, badly, and not at all
  - what its failure looks like when it fails - error, empty output, or plausible garbage
  - what happens when it meets a scanned PDF with no text layer
  - whether it can be pinned to a version

Then recommend one, and say what I lose by taking your recommendation.

I will pick. Then write the converter in the next prompt.
```

**You know it worked when:** you made the choice, and you can say what you gave up.

---

## Prompt 09 — The converter, isolated

```text
Write convert/to-markdown.mjs using the option I chose. One exported function:

  convert(localPath, mimeType) -> { markdown, ocrUsed, ocrConfidence, status, reason }

Rules:
  - It takes a local path. It knows nothing about MinIO, Postgres, zones or HTTP. It can
    be tested with a file and no infrastructure.
  - NEVER build a shell command by string concatenation with a filename. Use an argv
    array. A file named "; rm -rf ~" is a legal filename and someone's client will send
    you one.
  - Timeout per file, from a constant. A converter that hangs on one corrupt PDF must not
    stop the queue forever.
  - Audio, video and archives return status 'unsupported' with a reason naming the type.
    That is a correct answer, not a failure.
  - A PDF with no text layer returns ocrUsed true and whatever confidence the OCR engine
    reports. If the engine reports no confidence, return null - never invent a number.

Return, never throw, for anything that is a property of the file. Throw only for things
that are a property of the machine, like a missing binary.
```

**You know it worked when:** you can run it against a folder of junk files from the command
line, with no database running.

---

## Prompt 10 — The queue worker in n8n

```text
Build the n8n workflow that drains the conversion queue. Give me the node list, the
settings for each, and the SQL, so I can build it while you talk me through it.

  1. Schedule trigger, every 30 seconds.
  2. Postgres: claim ONE pending row atomically. It must use
       update files set status='converting'
       where id = (select id from files where status='pending'
                   order by uploaded_at limit 1 for update skip locked)
       returning *;
     Explain to me in one sentence what "for update skip locked" prevents, and what
     happens without it when the schedule fires while the last run is still going.
  3. Download that object from MinIO to a temp path.
  4. Run the converter.
  5. Write back: markdown, status, status_reason, ocr_used, ocr_confidence.
  6. Delete the temp file. In a path that runs even when step 4 threw.
  7. On any failure: set status 'failed' with the reason. Never leave a row in
     'converting' - a row stuck in 'converting' is invisible to the queue forever.

Add an eighth branch: any row in 'converting' for more than 10 minutes goes back to
'pending'. Tell me why that is a separate branch and not error handling.
```

**You know it worked when:** you kill n8n mid-conversion and the row comes back by itself
ten minutes later.

---

## Prompt 11 — Embed into the Class 3 memory

```text
Extend the queue: after a successful conversion, embed the markdown into the pgvector
memory built in Class 3.

  - Reuse the existing embeddings table and the existing embedding model. Do not create a
    second memory. If the dimensions do not match, stop and tell me rather than creating
    a parallel table - two memories that disagree is worse than one that is incomplete.
  - Chunk the markdown before embedding. Tell me the chunk size and overlap you chose and
    why, in one sentence.
  - EVERY chunk row carries the file's zone, denormalised onto the chunk. Not a join to
    files - the zone travels with the chunk.
  - Every chunk row carries file_id and ocr_used.

That third rule is the one that matters. Explain to me, in two sentences, what goes wrong
in Class 11 if the zone lives only on the files row and the search joins to get it.
```

**You know it worked when:** you can explain why the zone is denormalised. The answer is that
one forgotten `JOIN` in a query written three weeks from now silently returns personal
documents to a phone caller.

---

## Prompt 12 — Zone-scoped search, with no way to say "everything"

```text
Write search/query.mjs, exporting one function:

  searchFiles({ query, zones, limit })

Rules:
  - zones is REQUIRED and must be a non-empty array of the four valid values. There is no
    default. There is no "all". There is no wildcard. Passing nothing throws.
  - Add a comment saying that this is deliberate, that a convenience default of "all
    zones" would be used by every future caller that forgot to think, and that Class 11
    hands this function's output to whoever dialled a phone number.
  - The zone filter is applied in the SQL WHERE clause, not in JavaScript after fetching.
    Show me the line. Filtering after fetching means the wrong rows were already loaded
    into a process that might log them.
  - Results carry file_id, original_name, zone, ocr_used, and the matching chunk.

Then write the one test that matters: seed one document in each of the four zones, query
with zones ['general','business'], assert the result set contains nothing from personal
or clients. Assert on the row count and on the zone of every row.
```

**You know it worked when:** the test passes, and when you try to call `searchFiles` without
zones and it throws.

---

## Prompt 13 — The Ingress tab

```text
Add a Files tab to the Vite + React dashboard.

  - Four zone sections: Personal, Business, Clients, General. Visually distinct, and the
    zone is always visible on every file row - never inferred from which section it is in.
  - A drop zone per section. Dropping a file uploads it to THAT zone. There is no
    "choose a zone" dropdown after the fact, because a dropdown has a default and a
    default gets accepted.
  - Show a confirmation before uploading to Clients or Personal that names the zone in
    words: "This file will be readable by anything scoped to the Clients zone." One
    click, not a typed confirmation - but it is shown, every time, for those two.
  - Each row: name, size, uploaded date, and a status chip - pending, converting,
    converted, failed, unsupported. Different colours. Unsupported is neutral grey, not
    red - it is not an error.
  - Poll for status while any row on screen is pending or converting. Stop polling when
    none are.
  - Files with ocr_used show a visible marker. Not a tooltip. On the row.
```

**You know it worked when:** you can tell, from across the room, which of your files the brain
actually read properly.

---

## Prompt 14 — The OCR honesty pass

```text
Make OCR results impossible to mistake for parsed text, everywhere they can appear.

Three places:
  1. The file row in the Files tab - a marker, already done in prompt 13.
  2. Search results - any chunk from a file with ocr_used shows the same marker, in the
     result, next to the text.
  3. Anything the brain says using that chunk - when a chunk with ocr_used is retrieved,
     the context handed to the model is prefixed with a line saying this text came from
     OCR of a scanned document and may contain transcription errors, especially in
     numbers.

Then write me the paragraph I should read out loud in class, explaining why OCR is the
one component here that fails by producing something that looks right. Keep it under
eighty words and do not soften it.
```

**You know it worked when:** an OCR'd invoice cannot appear anywhere in your system without
saying it was OCR'd.

---

## Prompt 15 — Delete, honestly

```text
Add deletion. It is going to be less satisfying than it sounds, and the UI has to say so.

  - Deleting a file deletes the files row and its embedding chunks.
  - It does NOT delete the object from MinIO. Versioning is on; the bytes remain.
  - The confirmation dialog says this in plain words: the file will disappear from the
    brain and from search, and the original bytes stay in storage. It names where.
  - Add scripts/orphans.mjs that lists objects with no files row, with their total size.
    Do not have it delete anything. Deleting orphans is a decision with no undo and it
    does not belong behind a script that runs unattended.

Then tell me the honest consequence of this design in two sentences, including what it
means for a client asking me to delete their data.
```

**You know it worked when:** you understand that your brain now has a retention policy, and
that you chose it by default rather than on purpose.

---

## Prompt 16 — Adversarial verify

```text
Write VERIFY.md for the ingress, and run it with me.

It must prove all ten of these against the running system:

   1. Upload the same file twice: one object, one row, deduped true
   2. Upload the same file to two zones: one object, two rows
   3. A file named Contrato Adquisición 2026.pdf round-trips byte-identical
   4. A file over the size cap is refused during the stream, and no partial object is left
   5. An invalid zone is refused with a 400 before any byte is stored
   6. docker compose restart minio - every file is still there
   7. A 40-page PDF converts without the upload request ever blocking; record the seconds
   8. A scanned image converts with ocr_used true and shows the marker in search results
   9. An .mp4 lands as status unsupported, with a row and an object and no markdown
  10. searchFiles with zones ['general','business'] returns zero rows from personal or
      clients; and calling it with no zones throws

For each: the exact command, the exact output that counts as a pass, and a blank result
line. I fill those in.

Then tell me the three things this design does not protect against. One of them is about
files clients send me. Be specific, and do not reassure me.
```

**You know it worked when:** item 7 has a real number in it, and that number replaces the
estimate written in `DECISIONS.md`.

---

## What you have at the end

A dashboard tab where you drop a file into one of four zones. The original bytes are stored
once, addressed by their own hash, in a bucket that survives a restart. A queue turns it into
markdown without blocking anything, embeds it into the memory you built in Class 3, and
marks it if OCR was involved. Search cannot see a zone it was not handed.

And a written list of the three ways it can still hurt you.

**Next class:** all of this is still something you have to be at a keyboard to use. Class 11
gives it a phone number.
