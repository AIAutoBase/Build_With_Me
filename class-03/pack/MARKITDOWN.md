# MarkItDown — getting real paperwork into the memory

**The problem.** The ingest pipeline you just built reads text. Your actual paperwork is
not text. It's a PDF from your insurer, an XLSX your bookkeeper sent, a DOCX contract, a
PowerPoint a vendor called a proposal.

**MarkItDown is the doorway.** One command turns almost any document into clean Markdown,
which is exactly what the chunker wants.

It's from Microsoft, it's open source, and it's free. **The official repository, and the
only one you should install from:**

> ### `https://github.com/microsoft/markitdown`

Owner `microsoft`, repository `markitdown`, MIT licensed. Check that owner before you
install anything — popular tools get look-alike repositories and look-alike package names,
and the fake ones are the ones that are pleased to see you.

---

## What it actually is

A converter. You give it a file, it gives you Markdown.

That's the whole idea, and the reason it matters here is the *Markdown* part. It doesn't
flatten your document into a wall of text — it keeps the structure:

| In the original | In the Markdown |
|---|---|
| A heading | `## A heading` |
| A table | a real Markdown table, rows and columns intact |
| Bold figures | `**$7,700**` |
| A list | a list |

**That structure is not decoration — it's what makes retrieval work.** A chunk that still
says `## Deductible` above the number tells the model what the number *is*. An invoice
whose table survived is still an invoice; one flattened into `Item Qty Unit Total
Architectural shingles 42 sq 118.00` is soup, and no amount of clever prompting recovers
it.

It is also, bluntly, the cheap option: Markdown is close to the smallest number of tokens
you can spend to represent a structured document, and you pay per token on every embed.

## What it converts

| | |
|---|---|
| **Documents** | PDF, DOCX, PPTX, XLSX, EPub, older Office formats |
| **Web and data** | HTML, CSV, JSON, XML, RSS, plain text |
| **Images** | EXIF metadata, and OCR / descriptions with an optional model |
| **Audio** | metadata, and speech-to-text with an optional model |
| **Containers** | ZIP archives, whole directories, YouTube URLs |

> **Verified here, on this machine:** version **0.1.7**, PDF and HTML both convert with
> their tables intact. The rest of that list comes from the project's own documentation
> and is not something I've personally run — check the format you care about before you
> build a workflow on top of it.

---

## First — read it before you install it

Same rule as Class 2, and I am not going to stop repeating it.

> **Read the thing before you run it. Every time. Including the ones from me.**

You are about to install code from the internet that will then read every document you
own. Twenty seconds of checking costs you nothing and costs an attacker the whole job.

**And you already own the tool for this.** You installed two agents in Class 1 —
have one of them go and look:

```text
Go and examine https://github.com/microsoft/markitdown before I install it.

Tell me:
- who actually owns this repository, and whether it is the real Microsoft one
- what the licence is
- what it does, in plain language
- what it installs, what it pulls in as dependencies, and what it writes to
- whether it sends anything anywhere - network calls, telemetry, analytics
- whether anything in it looks malicious: obfuscated code, credential access,
  install-time scripts, calls out to somewhere I did not ask for
- how actively maintained it is, and when the last real commit landed

Then tell me straight whether you would install it, and why.
```

That works in Claude Code or in Codex. Ask **both** if you want — they read differently,
and when the two of them disagree, that disagreement is the interesting part.

If you are happy with what it says, you can hand it the rest of the job too:

```text
Install markitdown on this machine from the official Microsoft repository. Use a
method that does not disturb my system Python if you can. Then convert
<a real file of mine> as a test, show me the first 40 lines of the output, and tell
me whether the conversion actually worked or just produced an empty file.
```

Let it pick the install method for your machine — that's the kind of thing it's good at,
and it's why you installed it.

**None of that is specific to MarkItDown.** It's the habit. Use it on the next tool
somebody recommends to you, and the one after that.

---

## Install it

```bash
pip install 'markitdown[all]'
```

The quotes matter in zsh and PowerShell — without them the brackets get eaten and you
install a version with no format support, which then fails on your first PDF for reasons
that have nothing to do with the PDF.

If you'd rather not touch your system Python:

```bash
pipx install 'markitdown[all]'
```

Check it:

```bash
markitdown --version
```

## Use it

One file:

```bash
markitdown insurance-policy.pdf -o insurance-policy.md
```

Look at what came out **before** you ingest it:

```bash
head -40 insurance-policy.md
```

It also reads stdin and writes stdout, so it drops into a pipe:

```bash
cat contract.docx | markitdown > contract.md
```

A whole folder of paperwork:

```bash
mkdir -p converted
for f in ~/paperwork/*.pdf; do
  markitdown "$f" -o "converted/$(basename "${f%.*}").md"
done
ls -la converted/
```

Then feed `converted/` to the ingest workflow exactly as you fed it `docs-pack/`:

```bash
docker compose cp ./converted n8n:/home/node/docs-pack
docker compose exec n8n ls -la /home/node/docs-pack
```

**Nothing in P2 changes.** The chunker, the embedding call, the upsert — all identical.
MarkItDown sits in front of the pipeline, not inside it. That's the point: one new tool,
zero new plumbing.

---

## Read the output before you trust it

This is the part people skip, and it's thirty seconds.

A converted document can look fine and be wrong. Two things go wrong quietly:

**Scanned PDFs come out empty.** If a PDF is a photograph of a page, there is no text in
it to extract. MarkItDown gives you an empty or near-empty file, your ingest cheerfully
stores nothing, and your system later says *"I don't have that in your documents"* about a
document you are certain you fed it. Check the file size of what comes out. That's your
tell. Scanned pages need OCR first, which is a different tool and a different afternoon.

**Complex layouts scramble.** Multi-column pages, forms and heavily designed PDFs can
interleave. Skim the output for sentences that don't follow each other.

The habit is the same one from Class 2, applied to documents instead of scripts: **look at
the thing before you run it through your system.**

---

## Why this pairs with the refusal

Worth sitting with for a second, because the two features protect each other.

A converter that silently produces an empty file would be dangerous in a system that
guesses — you'd feed in your policy, get a confident wrong answer, and never know the
document hadn't landed. In a system that refuses, the failure surfaces as *"I don't have
that in your documents"*, which is annoying, checkable, and true.

Then `SELECT * FROM kb_sources;` shows you the document with one tiny chunk, and you know
exactly what happened.

---

## Coming in a future class: this moves into the dashboard

Right now converting is a command you run and a folder you copy. That's fine for four
documents and tedious for four hundred.

The plan is to put it behind the eyes: **drag a file onto the dashboard, and it lands in
the memory.** The dashboard hands the file to a workflow, the workflow runs it through
MarkItDown, chunks it, embeds it, and the new source shows up in the list — no terminal,
no `docker compose cp`, no filename juggling.

Same pipeline underneath. What changes is that the door stops being a command line, which
is what it takes before anyone puts their actual filing cabinet into this.

That's a later class. Convert by hand until then — and if you build the drag-and-drop
version yourself first, post it, because that's the whole point of this community.

---

## The commands, in one place

```bash
pip install 'markitdown[all]'          # install, quotes required
markitdown --version                   # confirm
markitdown file.pdf -o file.md         # convert one
cat file.docx | markitdown > file.md   # or pipe it
head -40 file.md                       # ALWAYS look before ingesting
```

*Microsoft MarkItDown · MIT licensed · official repository:*
*`https://github.com/microsoft/markitdown`*

*Read it before you install it. Or have Claude or Codex read it for you — that is what
you installed them for.*
