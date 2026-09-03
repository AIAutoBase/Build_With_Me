# Class 8 — Make It a Project

**The Brain That Runs a Company, Part 8.** Seven weeks of work stops being a pile of files.

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-08/**
>
> That page is the show notes. It recaps Classes 1–7, carries the one-line install, and is
> what you follow along with during the hour.

Wednesday 30 September 2026, 11:00 AM ET · Skool live room ·
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106)

---

## The sentence the class is about

**You have seven weeks of work on one box, with no history, no versions, and no
documentation.**

Change something, break it, and there is no way back. In three months you will not
remember why any of it looks the way it does.

That is not a missing organ. **It is a missing habit**, and this is the class that fixes
it.

---

## The one command

Run it **on the machine your brain runs on**.

**macOS / Linux / WSL**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-08/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/class-08/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

It downloads the pack and **searches your history for secrets**. It does not create a
repo, and it is explicitly forbidden from running `git init`, `git add` or `git commit` —
because an installer that helpfully staged everything would commit your `.env` and take
away the only decision this class is trying to teach.

---

## It costs nothing, and there is nothing to sign up for

The **first class in the series with no gate page**, because there is nothing to gate.

| Piece | What it costs |
|---|---|
| git | Free, already on most boxes, **no account** |
| The repo | Local. No remote, no GitHub, nothing published |
| Versions and CHANGELOG | A 300-line bash script in the pack |
| The README | An hour of your own honesty |

**git is not GitHub.** Full undo, branch and diff, with no network involved. Your business
documents' filenames never appear on anyone else's server, because nothing leaves the box.

---

## Why this one comes before the terminal class

**Class 9 puts a Claude/Codex terminal in your dashboard — an agent with shell access to
everything you have built.**

You want history *before* you hand an agent a shell. When it breaks something — and it
will — `git diff` is the way back.

That is the whole reason the boring-sounding class got scheduled ahead of the exciting one.

---

## The uncomfortable bit, said out loud

**Classes 2, 3 and 4 told you four separate times never to *overwrite* your `.env`**,
because it holds the key that decrypts every credential n8n has saved.

**Not one of them told you not to *commit* it.**

Commit it once and it is in history permanently. Delete the file, add it to `.gitignore`,
commit again — and your working tree is spotless while every earlier commit still contains
the key. **`git status` will never mention it again.**

So the pack:

- ships a `gitignore-template` that excludes `.env` **before anything else**
- ships an `env.example` with the names and none of the values
- ships a `verify.sh` that searches your **history**, not your working tree

**If it is already in there**, the answer is to **rotate the key, not rewrite history** —
rewriting does not help if anyone ever copied the repo, and a backup is a copy.
`TROUBLESHOOT.md` section 4 is honest about the price: rotating `N8N_ENCRYPTION_KEY` makes
every saved credential unreadable, so budget an hour to re-enter them.

---

## The five traps in `gcommit`

The `gcommit` in the pack is a rewrite of a tool in daily use for months. **Every refusal
in it is a real failure, with a date.**

| | What went wrong | It now |
|---|---|---|
| 1 | Staged everything, so two sessions in one repo swept each other's half-finished work into commits *(2026-08-25)* | **Never stages.** Refuses on an empty index |
| 2 | A multi-line message silently lost its prefix — `feat:` became a patch *(2026-08-10)* | **Refuses** multi-line messages |
| 3 | Writing the *current* version into an app footer made it stale instantly *(2026-08-04, three releases in one afternoon)* | `--dry-run` prints the version it **will create** |
| 4 | Docs-only commits bumped SemVer, restarting the treadmill *(2026-08-05)* | **Warns**, points at plain `git commit` |
| 5 | A CHANGELOG entry whose prose *quoted* the insert marker got a whole release section injected inside a bullet *(2026-08-18)* | Replaces **only the first** occurrence, and never inserts above the title |

All five are the same shape, and it is the shape this series has taught since Class 3: **a
silent failure that produces a plausible artifact.**

> **Trap 5 is the one to sit with.** A dry run prints the version summary, not the diff —
> so it *cannot* show you a mangled CHANGELOG. **Read the file.**

---

## What this class does not do

**It is not backup.** git gives you history, not a second copy. A repo on a box that dies
dies with it, along with every commit in it.

Said plainly in the pack rather than left for you to discover.

---

## What is here

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **The show notes.** Classes 1–7 recap, the install, all three prompts |
| [`install.txt`](install.txt) | What the one command fetches |
| [`downloads/`](downloads/) | The pack zip and `SHA256SUMS` |
| [`pack/`](pack/) | The pack unzipped — every file readable here without downloading |

`index.html` works standalone from `file://`, makes **no network requests at all**, and
references no external resources.

---

## Checksums

```bash
cd downloads && sha256sum -c SHA256SUMS
```

| File | SHA-256 |
|---|---|
| `class-08-project-pack.zip` | `783c9032cd8e076163087b2df014113c5b5ec6ac46ab883361def972d4ac2fd3` |

13 files. This pack pins its zip timestamps, so the same sources always produce the same
hash — a mismatch means the sources moved, not that the clock did.

`build-pack.py` carries **three guards**, all of which refuse rather than warn:

1. the usual **credential scan**
2. a **safety-net guard** — it refuses to build if `gitignore-template` stops having a line
   that is exactly `.env`, or if `env.example` gains a value
3. a **refusals guard** — it refuses if the shipped `gcommit` no longer contains any of its
   dated refusals, matched against the code with comments stripped, so a comment *about* a
   refusal cannot stand in for the refusal

All three were tested by breaking them. The third caught two bugs in itself that way: a
substring needle matched inside a mutated flag, and comments satisfied checks meant for
code.

---

## The series

| Class | What it adds | Where |
|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | Aug 12 |
| 2 · Give It Senses | n8n and Postgres | Aug 19 |
| 3 · Ask Your Brain | Memory it can search | [class-03](https://aiautobase.github.io/Build_With_Me/class-03/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04](https://aiautobase.github.io/Build_With_Me/class-04/) |
| 5 · Hands and a Clock | The 7am digest, draft-don't-send | [class-05](https://aiautobase.github.io/Build_With_Me/class-05/) |
| 6 · The Graph | What connects to what | [class-06](https://aiautobase.github.io/Build_With_Me/class-06/) |
| 7 · A Clock It Can Read | Your real calendar, both directions | [class-07](https://aiautobase.github.io/Build_With_Me/class-07/) |
| **8 · Make It a Project** | **History, versions, and a README** | **here** |
| — · Content Mate | The public voice — optional, in the classroom | [content-mate](https://aiautobase.github.io/Build_With_Me/content-mate/) |

---

## License

MIT — see [LICENSE](LICENSE).

*Orbix Automation Solutions · [getorbix.com](https://getorbix.com)*
