# Check it before you trust it

Twelve minutes. Each step proves the one before it, so stop at the first failure instead
of pressing on.

**Everything below was run against a live stack on 2026-08-24** — Postgres, n8n, a real
OpenRouter key and a real mailbox. It is not a reading of the code.

---

## 1. The service

```bash
curl http://localhost:8088/health
```

- [ ] `{"ok":true,"markitdown":"0.1.7", ...}`
- [ ] `http://localhost:8088` loads and shows three tabs
- [ ] the dot top-right is green and says `live`

If the page loads but the tabs are blank, open the browser console. A blank tab and a
broken tab look identical from the outside.

## 2. The converter, on its own

Before involving n8n at all, prove the converter works:

```bash
curl -F "file=@some-document.pdf" http://localhost:8088/convert | head -c 300
```

- [ ] `"ok":true` and Markdown you recognise
- [ ] the tables in the original are still tables in the Markdown

Now the case that matters. Find a **scanned** PDF — a photograph of a page — and send it:

- [ ] `"ok":false` and `"reason":"empty"`

That is the converter working, not failing. A scan has no text in it. If it came back
`ok:true` with a few characters, the floor is set too low and empty documents will get
into your memory.

## 3. The drop box

Drop a document on the Documents tab.

- [ ] a row appears, goes from converting to a chunk count
- [ ] it shows in the table below within a few seconds
- [ ] the same document appears here:

```bash
docker compose exec -T postgres psql -U brain -d brain -c 'SELECT * FROM kb_sources;'
```

- [ ] the page and the query agree

## 4. The part that silently corrupts, if you skip it

This is the one worth doing properly.

Take a long document — several hundred words — and drop it. Note the chunk count. Then
cut it down to a couple of hundred words, **keep the same filename**, and drop it again.

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT chunk_index FROM kb WHERE source = 'your-file.md' ORDER BY chunk_index;"
```

- [ ] the chunk count went **down**
- [ ] the high-numbered chunks from the first version are **gone**

If they are still there, your memory is still holding paragraphs you deleted, it will
still retrieve them, and it will still cite them. Nothing will ever tell you.

> Measured here: a 652-word document ingested as 5 chunks; the same filename re-uploaded
> at 227 words came back as 2, and chunks 2, 3 and 4 were removed.

## 5. The overlap is real

Chunks are supposed to share 30 words at each boundary. A chunker with no overlap at all
produces the same number of rows, ingests without an error, and answers most questions
correctly — you find out on the one question whose answer straddled a boundary.

Ingest something long enough to make several chunks, then:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
"WITH w AS (SELECT chunk_index, regexp_split_to_array(trim(content),'\s+') AS a
            FROM kb WHERE source='your-file.md')
 SELECT p.chunk_index,
        array_to_string(p.a[array_length(p.a,1)-29:array_length(p.a,1)],' ')
          = array_to_string(n.a[1:30],' ') AS overlap_ok
 FROM w p JOIN w n ON n.chunk_index = p.chunk_index + 1 ORDER BY 1;"
```

- [ ] `overlap_ok` is `t` on every row

## 6. Forgetting

- [ ] `forget` on a document removes it from the list
- [ ] `SELECT * FROM kb_sources;` agrees
- [ ] asking a question about it now returns *"I don't have that in your documents."*

That last one is the real test. A document removed from a list but still in the table is
still answerable.

## 7. The inbox

With `03 — Email sort` active and unread mail in the mailbox:

- [ ] rows appear in `messages`
- [ ] the Inbox tab shows counts, and the numbers match:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT category, count(*) FROM messages GROUP BY category ORDER BY 2 DESC;"
```

- [ ] no `unclassified` rows — a few are survivable, a lot means the model is not
      returning JSON

Now read its work, message by message:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT category, needs_reply, from_name, left(subject,40), left(reason,30) FROM messages ORDER BY category;"
```

- [ ] you agree with most of it
- [ ] you have looked at the ones you disagree with

You are not checking that it ran. You are checking that it is right, and those are
different questions. Eleven test messages here came back ten right and one wrong — a
happy customer saying thank you, filed as `other` instead of `client`. Nothing about the
dashboard looked any different for the wrong one.

## 8. Nothing leaked

```bash
grep -rn "sk-or-\|Bearer \|password" dashboard/ brain-web/ docker-compose.override.yml
```

- [ ] nothing but comments

The workflows in `demo/` carry credential **names**, never values. n8n keeps the values
in its own encrypted store, which is why those files are safe to share and why you have
to re-select the credential after importing them.
