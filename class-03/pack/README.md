# The Brain That Runs a Company — Class 3 pack

**What this file is.** Everything you need to give your system a memory it can search:
four prompts, the database schema, both workflows, the dashboard, and four practice
documents. This README is the whole procedure, start to finish, for **Windows, Mac and
Linux**.

**You do not need the videos.** They're linked at the bottom and they're worth watching,
but every command is here in order. If you can copy and paste, you can finish this.

**What you'll have at the end:** you type a question — *"how much is the security deposit
on the warehouse?"* — and your own machine answers it from your own documents, and tells
you which file it read. Ask it something it doesn't know and it says so instead of
inventing an answer.

---

## Contents

```text
README.md              this file
VERIFY.md              a checklist to confirm each step actually worked

prompts/
  P1-schema.md         the table your documents live in
  P2-ingest.md         document -> chunks -> numbers -> database
  P3-ask.md            question -> retrieve -> grounded answer, or a refusal
  P4-dashboard.md      the ask box on the dashboard

schema-kb.sql          what P1 produces, if you'd rather just run it
brain-sql.sh           helper: run SQL against the brain database
dashboard.html         the finished dashboard, ask box included
install.sh             the stack installer (Docker + n8n + Postgres)
MARKITDOWN.md          turn PDF/DOCX/XLSX into something the pipeline can eat
LOCAL-EMBEDDINGS.md    run it all offline, nothing leaves your machine

demo/                  both workflows, importable, as a fallback
docs-pack/             four practice documents + README.txt (the answer key)
```

---

## Which parts do you need?

| You are | Start at |
|---|---|
| New — nothing installed | **Part 1** |
| Did Class 1 (Node + Claude Code) | **Part 2** |
| Did Class 2 (n8n + Postgres running) | **Part 4** |

---

## Part 1 — Node and Claude Code

Skip if `node -v` prints v22 or higher and `claude --version` answers.

### Check what you have

**Windows (PowerShell) · Mac · Linux** — same command everywhere:

```bash
node -v
```

### Install Node 24

**Windows (PowerShell):**
```powershell
winget install OpenJS.NodeJS.LTS
```

**Mac:**
```bash
brew install node
```
No Homebrew? Get the installer from `https://nodejs.org` — take the LTS build.

**Linux / WSL:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# close the terminal, open a new one, then:
nvm install 24
nvm use 24
```

> **Then close your terminal and open a new one.** PATH does not update in a shell that is
> already running. This is the number one reason the next command "doesn't work."

Verify:
```bash
node -v     # v22 or higher
npm -v
```

### Install Claude Code

All three platforms:

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

**If `npm install -g` fails on permissions:** on Windows, reopen PowerShell as
Administrator. On Mac or Linux, your Node is owned by root — install `nvm` and reinstall
Node through it rather than fighting it with `sudo`.

---

## Part 2 — Docker

Everything else runs inside Docker: n8n, Postgres, the whole brain.

### Windows

1. Install **Docker Desktop** from `https://www.docker.com/products/docker-desktop/`
2. During setup, leave **"Use WSL 2 based engine"** ticked
3. **Reboot when it asks.** It genuinely needs it.
4. Launch Docker Desktop and wait for the whale icon to stop animating

You also need a Linux shell, because the installer is a bash script:

```powershell
wsl --install -d Ubuntu
```

Reboot, let Ubuntu finish its first-run setup, and **run every command in Part 3 from
inside that Ubuntu window** — not PowerShell.

> In Docker Desktop → Settings → Resources → WSL Integration, make sure your Ubuntu
> distro is switched on. Without it, `docker` is not found inside WSL.

### Mac

```bash
brew install --cask docker
```

Or download the `.dmg` from `https://www.docker.com/products/docker-desktop/` — **take the
build for your chip**, Apple silicon or Intel. Then launch Docker from Applications and
wait for the whale icon to settle.

### Linux

Nothing to do — the installer in Part 3 installs Docker for you.

### Confirm it works, all platforms

```bash
docker --version
docker ps
```

`docker ps` must return a table, even an empty one. If it says it cannot connect to the
daemon, Docker Desktop is not running yet.

---

## Part 3 — The stack: n8n and Postgres

**Read the script before you run it.** It's the habit this series keeps repeating, and it
applies to scripts from me as much as anyone:

```bash
curl -fsSL https://raw.githubusercontent.com/roughboy99/aiautobase-claude-skills/main/brain/install.sh -o brain-install.sh
claude "Analyze this install script before I run it. Tell me exactly what it does, what it installs, what it writes to, and whether it contains anything malicious - injections, credential theft, or calls out to somewhere I did not ask for." < brain-install.sh
```

Then run it:

```bash
bash brain-install.sh
```

**Windows:** run this inside your Ubuntu (WSL) window.
**Mac:** Docker Desktop must be installed and running first — the script says so and stops
if it isn't.
**Linux:** it installs Docker for you as part of the run.

The script is safe to run twice. It will not overwrite an existing `.env`, because that
file holds the key that decrypts your saved credentials.

It installs into `~/brain`. When it finishes:

```bash
cd ~/brain
docker compose ps
```

Both containers must say `Up`.

### Three things that look broken and aren't

```bash
curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:5678/          # 404 - normal
curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:5678/healthz   # 200 - this is the real test
```

1. **The root address returns 404.** Normal on n8n 2.x — the editor lives at
   `/home/workflows`.
2. **`/healthz` is the one to test.** It should say 200.
3. **First boot takes 60–90 seconds** while n8n runs its database migrations. Check too
   early and it looks broken. Wait for `Editor is now accessible` in
   `docker compose logs n8n`.

Open `http://localhost:5678` in a browser and create your n8n account.

---

## Part 4 — Class 3: give it a memory

### 4.1 — Get an OpenRouter key

Sign up at `https://openrouter.ai`, create a key at `https://openrouter.ai/keys`, and
**put a small amount of credit on it**. Embedding the whole practice pack costs a fraction
of a cent.

> A key with no balance fails with an error that does *not* say "you're out of money" in
> plain language. If things break here, check your credits first.

In n8n: **Credentials → New → Header Auth**

| Field | Value |
|---|---|
| Name | `OpenRouter` |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_KEY_HERE` |

Never paste a key into a node parameter — it travels with every export you ever share.
That is why the files in this pack are safe to hand around: they carry the credential's
*name*, never its value.

Also check your **Postgres** credential from Class 2 points at database **`brain`**, not
`n8n`. This is the most common mistake in the whole class.

### 4.2 — The table (P1)

Unzip this pack, then from the unzipped folder:

**Mac / Linux / Windows (WSL):**
```bash
cp schema-kb.sql brain-sql.sh ~/brain/
cd ~/brain
bash brain-sql.sh < schema-kb.sql
```

Confirm:
```bash
docker compose exec -T postgres psql -U brain -d brain -c '\d kb'
docker compose exec -T postgres psql -U brain -d brain -c '\df cosine_sim kb_search'
```

Prove the similarity function is not lying — costs nothing, catches a whole class of
silent wrongness:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[1,0,0]::float8[]) AS same,
          cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[0,1,0]::float8[]) AS unrelated,
          cosine_sim(ARRAY[1,0,0]::float8[], ARRAY[-1,0,0]::float8[]) AS opposite;"
```

Expect `1 | 0 | -1`. Anything else and every search you run afterwards is ranked wrong.

Or run the prompt instead and let Claude Code build it — `prompts/P1-schema.md`. Same
result, and you learn more.

### 4.3 — Put the documents where the container can see them

The n8n container cannot see your desktop.

```bash
cd ~/brain
docker compose cp /path/to/pack/docs-pack n8n:/home/node/docs-pack
docker compose exec n8n ls -la /home/node/docs-pack
```

Four `.md` files must be listed. If they aren't, nothing downstream will work and the
error you get will be about something else entirely.

> `docs-pack/README.txt` is the answer key. It's `.txt` on purpose so the ingest workflow
> can't pick it up — ingest the answer key and your system starts citing *it* instead of
> the actual documents. Don't rename it.

### 4.4 — Ingest (P2)

Open `prompts/P2-ingest.md` and paste the prompt into Claude Code, or import
`demo/05-kb-ingest.json` into n8n. Run it once.

```bash
docker compose exec -T postgres psql -U brain -d brain -c 'SELECT * FROM kb_sources;'
```

Expect **four sources, four chunks** — every practice document is shorter than 180 words,
so each becomes a single chunk. Run it again and the count stays at four, because
re-ingesting updates instead of duplicating.

```bash
docker compose exec -T postgres psql -U brain -d brain -tAc \
  'SELECT array_length(embedding,1) FROM kb LIMIT 1;'
```

Expect `1536`.

### 4.5 — Ask (P3)

Build it from `prompts/P3-ask.md`, or import `demo/06-kb-ask.json`. **Then activate the
workflow** — an inactive workflow returns 404 and this is the most common "it's broken"
moment of the whole class.

A question the documents answer:

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How much is the security deposit on the warehouse?"}'
```

**Windows PowerShell** (if you're testing from PowerShell rather than WSL):
```powershell
curl.exe -s -X POST http://localhost:5678/webhook/ask `
  -H "Content-Type: application/json" `
  -d '{\"question\":\"How much is the security deposit on the warehouse?\"}'
```

Expect `$7,700` and `warehouse-lease.md`.

Now a question they do **not** answer:

```bash
curl -s -X POST http://localhost:5678/webhook/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is my employee health plan copay?"}'
```

Expect:

```json
{ "answered": false, "answer": "I don't have that in your documents.", "sources": [] }
```

**If that second one invents an answer, stop and fix it before you trust anything else.**
That refusal is the difference between a memory and a chatbot, and it's the whole point of
the build.

### 4.6 — The dashboard (P4)

Copy `dashboard.html` anywhere you like and open it by double-clicking. No server, no
build step.

Type a question into the ask box. You should get the answer plus a small pill naming the
file it came from. Ask something it doesn't know and you get a quiet, muted *"I don't have
that in your documents"* — calm, not red. That's the system working.

If you'd rather build it yourself, `prompts/P4-dashboard.md` adds the ask box to the
Class 2 dashboard.

---

## Part 5 — Your own documents

The pipeline reads text. Your real paperwork is PDF, DOCX, XLSX.

**MarkItDown** is Microsoft's open-source converter and it's the doorway.

Official repository — check the owner really says `microsoft`:
**`https://github.com/microsoft/markitdown`**

**Read it before you install it.** Same rule as everything else, including tools I
recommend. You don't have to read it yourself — you have an agent for that:

```text
Go and examine https://github.com/microsoft/markitdown before I install it. Who owns it,
what licence, what does it install, does it send anything anywhere, does anything look
malicious? Then tell me straight whether you would install it.
```

Happy with the answer? Let it install it, or do it yourself:

**Windows (PowerShell):**
```powershell
pip install "markitdown[all]"
```

**Mac / Linux:**
```bash
pip install 'markitdown[all]'
```

The quotes matter — without them the brackets get eaten and you install a version with no
format support, which then fails on your first PDF for reasons that have nothing to do
with the PDF.

Use it:

```bash
markitdown --version
markitdown insurance-policy.pdf -o insurance-policy.md
head -40 insurance-policy.md          # ALWAYS look before you ingest
```

**Windows PowerShell** uses a different viewer:
```powershell
Get-Content insurance-policy.md -TotalCount 40
```

Then copy the converted files in and run the ingest workflow again, exactly as in 4.3.

> **A scanned PDF is a photograph of a page.** There is no text in it to extract, so it
> converts to an empty file, ingests as nothing, and your system later refuses to answer
> about a document you're certain you fed it. Check the size of what comes out. Scanned
> pages need OCR first, which is a different tool and a different afternoon.

`MARKITDOWN.md` has the rest, including the full format list.

**Coming in a future class:** this moves onto the dashboard — drag a file onto the page
and it lands in the memory, no terminal at all.

---

## If something goes wrong

| What you see | Platform | What it means |
|---|---|---|
| `claude: command not found` | all | Terminal not restarted after installing Node |
| `docker: command not found` inside WSL | Windows | Docker Desktop → Settings → Resources → WSL Integration → enable your distro |
| `Cannot connect to the Docker daemon` | Mac / Windows | Docker Desktop isn't running. Launch it and wait for the whale to settle. |
| `permission denied` on the docker socket | Linux | `sudo usermod -aG docker $USER`, then **log out and back in** |
| `404` from the ask webhook | all | The workflow is saved but not **Active** |
| `{"code":503,"message":"Database is not ready!"}` | all | n8n lost the startup race to Postgres. `docker compose down && docker compose up -d` — `restart` will not fix it. |
| CORS error in the browser, fine in `curl` | all | The Respond node is missing `Access-Control-Allow-Origin: *` |
| `relation "messages" does not exist` | all | The `brain` database was never created. Re-run `install.sh` from this pack — it has the fix. |
| Answers are confidently wrong | all | Questions and documents were embedded with different models. Both nodes must name the same one. |
| It refuses everything | all | `kb` is empty, or your threshold is too high. Check `SELECT * FROM kb_sources;` |
| `ENOENT: no such file or directory` | all | The container can't see your files. Re-run the `docker compose cp` in 4.3. |

Still stuck? Post it in the community — the **exact command and the exact error**, pasted,
not described.

---

## Before you feed it anything personal

Your chunks are stored on **your** machine, in **your** Postgres. Nobody else has them.

But the text is sent to OpenRouter to be turned into numbers, and the retrieved pieces are
sent again on every question you ask. **A third party reads those documents.** That's true
of every setup like this, including the expensive ones — most just don't say so.

**Start with business documents.** Don't feed it your medical records on day one just
because you can.

If you want nothing to leave your machine at all, `LOCAL-EMBEDDINGS.md` is the full
procedure using Ollama. Slower, free, and nothing goes out.

---

## The videos

Optional. Everything above is complete without them — but they show the mistakes and the
reasoning, which a command list can't.

| # | Video | Length | Covers |
|---|---|---|---|
| 1 | The table that remembers | ~3 min | Part 4.2 |
| 2 | Feed it a document | ~4 min | Part 4.4 |
| 3 | **Ask your brain** | ~4 min | Part 4.5 |
| 4 | Why it is fast | ~3 min | the retrieval design |

They're in the community post. **If you only watch one, watch number 3** — it shows the
system answering correctly and then refusing, which is the part worth understanding.

---

## When this works, there is a second download

`class-03-brain-pack-addendum.zip`, in the same community post. Optional, and it assumes
everything above is already running.

It puts a front on what you just built: the dashboard becomes three tabs, you drag a PDF
onto the page instead of copying files into a container, and your mail gets read and
sorted. One extra container next to n8n, four more workflows, and its own README and
checklist.

It changes nothing in this pack. **Get this one working first** — the addendum is a nicer
door onto the same pipeline, and a nicer door onto a broken pipeline is still broken.

---

*The Brain That Runs a Company · AI Auto Base*
*Created by Hector Diaz, founder of Orbix Automation Solutions.*
