# Class 3 Addendum — the eyes, the door, and the inbox

**This is a continuation of `class-03-brain-pack.zip`, not a replacement.**
Keep that zip. Install it first. Get it working. Then come back here.

Everything in the first pack still stands: the `kb` table, the chunker, hybrid retrieval,
the refusal at 0.28. None of it changes. This adds three things on top.

---

## What it adds

| | What you get |
|---|---|
| **A dashboard with tabs** | One page, three tabs. The ask box moves into it, and it stops being a file you double-click. |
| **A door for documents** | Drag a PDF onto the page. It converts, chunks, embeds, and shows up in the list. No terminal, no `docker compose cp`. |
| **An inbox that sorts itself** | Mail comes in, gets read, gets filed as lead, client, invoice or other, and the ones that need a human answer are listed separately. |

`MARKITDOWN.md` in the first pack promised the drag-and-drop version was coming in a
later class. This is it.

---

## The organs after this

| Organ | Tool | State |
|---|---|---|
| Brain | Claude Code / Codex | running since Class 1 |
| Senses | n8n | running since Class 2 |
| Memory | Postgres | holds your documents, and now your mail |
| Eyes | Dashboard | **three tabs, and you can put things into it** |

It perceives, it remembers, it reasons. It still does not act, and it still cannot hear
you. That is later.

---

## What you need first

- The Class 3 pack installed, and `SELECT * FROM kb_sources;` returning your documents
- Your OpenRouter credential working — this uses the same key for the same embeddings
- About 20 minutes, most of it a Docker build

If the first pack is not working, fix that before this. Nothing here compensates for a
broken `kb` table; it just gives it a nicer front door.

---

## Install

Everything goes into the same folder as your `docker-compose.yml` from Class 2.

**1. Unzip it there.**

```bash
cd ~/brain                  # wherever your docker-compose.yml lives
unzip class-03-brain-pack-addendum.zip
ls                          # you should now see brain-web/ and dashboard/
```

**2. Read the two things you are about to run.**

Same rule as every class, and I am not going to stop repeating it.

```text
Read docker-compose.override.yml and brain-web/app.py in this folder.
Tell me what they start, what ports they open, what they can read on my machine,
and whether anything sends data anywhere. Then tell me straight whether you would
run them.
```

`docker-compose.override.yml` is a file Docker merges into your existing compose
automatically. **Your original `docker-compose.yml` is never edited.** Delete the
override and the change is undone.

**3. Start it.**

```bash
docker compose up -d --build brain-web
```

The build takes a few minutes the first time — it is installing MarkItDown and its
dependencies. After that it starts in about a second.

**4. Check it is alive.**

```bash
curl http://localhost:8088/health
```

```json
{"ok":true,"markitdown":"0.1.7","max_bytes":20971520}
```

If the port is already taken, the container will refuse to start and say so. Change
`8088` in `docker-compose.override.yml` to something free and run the command again.
That happened to me on my own box — `8080` was already in use by something else, which
is exactly why it is not the default here.

**5. Import the four workflows**, from `demo/`, and **activate all four**.

```text
02-dashboard-api.json     the inbox tab's data
03-email-sort.json        reads your mail and files it
07-kb-upload.json         the drag-and-drop door
08-kb-library.json        the document list, and forgetting one
```

**Then re-select the credential in every node that has one.** n8n gives credentials its
own IDs on your machine, and the ones written in these files are mine. A node with a
credential it cannot find shows a warning and fails at run time with an error about
authentication that has nothing to do with your key. Open each Postgres and HTTP node,
pick your credential from the dropdown, save.

**6. Point the dashboard at your n8n.**

Open `dashboard/config.js`. One line:

```js
window.BRAIN_N8N = "http://localhost:5678";
```

Leave it alone if everything runs on the machine you are browsing from. If your stack
lives on another box, put that box's address there — `http://192.168.1.50:5678`, or
whatever yours is. `localhost` means *the machine the browser is on*, so pointing a laptop at
`localhost` makes it look at the laptop, find nothing, and show a connection error while
n8n is perfectly healthy somewhere else. That one costs people an hour.

**7. Open it.**

```text
http://localhost:8088
```

---

## The mail part needs one more thing

`03 — Email sort` reads a real mailbox, so it needs a real credential, and I am not
shipping you one.

In n8n: **Credentials → New → IMAP**

| Field | Value |
|---|---|
| Host | your mail server, usually `mail.yourdomain.com` |
| Port | `993` |
| User | the full email address |
| Password | the mailbox password, or an app password |
| SSL/TLS | on |

Name it **`Demo Mailbox`** if you want the workflow to find it without editing, or name
it whatever you like and re-select it in the node.

**Use a mailbox you do not mind seeing on your own screen.** A spare address, or one you
make for this. The workflow marks mail as read as it processes it, which is how it avoids
doing the same message twice — point it at your main inbox and it will march through
everything unread in there.

If the mailbox is empty, nothing happens and the Inbox tab stays empty. That is correct
behaviour, not a fault. Send yourself a few messages to watch it work.

---

## What you should see

The Inbox tab, with counts across the top and two tables under them. The Ask tab, the
same box you already had. The Documents tab, with a drop zone and a list of what is in
the memory.

Drop a PDF on it. It should appear in the list within a few seconds with a chunk count.

```bash
docker compose exec -T postgres psql -U brain -d brain -c 'SELECT * FROM kb_sources;'
```

The list on the page and that query must agree. If they do not, the page is showing you
something stale and the query is right.

---

## Three things worth knowing

**Re-dropping a document replaces it, properly.** Fix a contract, drop it again, and the
old chunks are updated — and if the new version is shorter, the leftover chunks from the
longer one are deleted. Without that last part your memory keeps answering from
paragraphs you removed, and nothing anywhere tells you it is happening. It is one line of
SQL and it is the reason the workflow has a node called "Sweep the old tail".

**A scanned PDF will be refused, and that is the system working.** A scan is a photograph
of a page. There is no text in it to extract, so the converter returns almost nothing and
the upload comes back grey with "nothing to read". It does not go into the memory. If it
went in, you would have a document that appears to be filed and answers nothing — and you
would only find out the day you needed it.

**The document name is its identity.** Two different files both called `invoice.pdf` will
overwrite each other. That is the same rule that makes re-dropping work, and I have left
it that way rather than inventing something clever that breaks the useful case.

---

## When it does not work

| What you see | What it means |
|---|---|
| Page loads, tabs are empty, red box | n8n is not reachable. Check `config.js`, then check the workflow is **Active**. |
| `Could not load inbox.html` | `bi-brain-web` is not running. `docker compose ps`. |
| Upload says the webhook answered 404 | `07 — KB upload` is not Active. Saving is not activating. |
| Upload says it could not reach n8n | `config.js` is pointing somewhere wrong. |
| Everything green, list is empty | The Postgres credential is on the `n8n` database instead of `brain`. |
| Dashboard fine, Inbox tab empty | No mail has been sorted yet. Is `03 — Email sort` Active, and is there unread mail? |

The browser console is not optional here. Right-click, Inspect, Console. A page that
looks blank and a page that is failing look identical from the outside, and the console
is the difference.

---

## What this does not do yet

It does not act on anything. It reads, sorts and shows. It does not reply to mail, it
does not pay an invoice, it does not remind you.

It also cannot hear you or answer out loud.

Those are the next organs, and they are the next classes.

---

*Created by Hector Diaz, founder of Orbix Automation Solutions.*
