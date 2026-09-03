# Make It a Project — Class 8 pack

This is the download for **AI Auto Base Class 8** of *The Brain That Runs a Company*.

Seven weeks of work stops being a pile of files.

---

## 1. This class gives the brain nothing

Classes 1 to 7 added organs — reasoning, senses, memory, eyes, ears, hands, a graph, a
clock. **This one is aimed at you**, and the pitch is uncomfortable on purpose:

> You have seven weeks of work on one box, with no history, no versions, and no
> documentation. Change something, break it, and there is no way back. In three months
> you will not remember why any of it looks the way it does.

That is not a missing organ. It is a missing habit.

---

## 2. Why now, and why before the terminal class

Class 9 puts a Claude/Codex terminal in your dashboard — **an agent with shell access to
everything you have built.**

**You want history before you hand an agent a shell.** When it breaks something — and it
will — `git diff` is the way back.

That is the whole reason this class comes first, and it is worth knowing so it does not
feel like the boring one got scheduled ahead of the exciting one.

---

## 3. git is not GitHub

**Local repo. No remote. No account. Nothing published.**

Full undo, branch and diff, with no network involved. Your business documents' filenames
never appear on anyone else's server, because nothing leaves the box.

That is the same portability line the whole series runs on, and it is the cheapest class
to hold it: **git costs nothing and needs no signup at all.**

> **And it is not backup.** A repo on a box that dies, dies with it. Said properly in
> section 9, because it matters and it is the one thing this class does *not* solve.

---

## 4. What you need first

**git installed.** Most boxes have it. `PREWORK.md` checks.

**Something worth committing** — your `~/brain` folder with the compose file, the exported
workflows, the dashboard, the prompts. If you have done Classes 2 and 3, you have this.

**Nothing else.** No account, no service, no card.

---

## 5. What is in here

| File | What it is |
|---|---|
| `PREWORK.md` | **Start here.** Is git installed, and what have you actually got |
| `prompts/P1-track.md` | `git init`, the `.gitignore`, the first commit |
| `prompts/P2-version.md` | VERSION, CHANGELOG, conventional commits |
| `prompts/P3-document.md` | The README a stranger could follow |
| `gcommit` | The versioned-commit wrapper. Plain bash, no dependencies |
| `gitignore-template` | What not to track, with `.env` at the top |
| `env.example` | The names, none of the values |
| `VERIFY.md` | The acceptance test — including *"is `.env` really untracked?"* |
| `verify.sh` | Preflight, **and it searches your history for secrets** |
| `TROUBLESHOOT.md` | Every error, silent ones first |
| `docs/COMMIT-MESSAGES.md` | Conventional commits, and which type bumps what |
| `docs/UNDO.md` | The four undos, and which one loses work |

---

## 6. The order that works

1. **`PREWORK.md`** — confirm git exists and look at what you have.
2. `bash verify.sh` — **before** P1. If you already have a repo, it checks whether a
   secret is already in its history.
3. **P1.** `git init`, the `.gitignore`, the first commit. Then check `.env` is *not* in it.
4. **P2.** Versions and the CHANGELOG.
5. **P3.** The README.
6. `bash verify.sh` again, and paste the output in the class thread.

**P1 alone is worth the hour.** A member who stops there has history, and has stopped
carrying their credentials around loose in a folder.

---

## 7. The part that can actually hurt you

**Four times — in Classes 2, 3 and 4 — this series told you never to *overwrite* `.env`,
because it holds the key that decrypts every credential n8n has saved.**

**It never once told you not to commit it.**

Commit it a single time and it is in history permanently. Deleting the file and committing
again does **not** remove it: every earlier commit still contains it, and so does every
copy of that repo.

So:

- `gitignore-template` excludes `.env` **before it excludes anything else**
- `env.example` carries the names and none of the values
- `verify.sh` searches your history for it, not just your working tree

**If it is already in your history**, `TROUBLESHOOT.md` has the answer, and the short
version is: **rotate the key.** Rewriting history is a bigger job than this hour and it
does not help if anyone ever copied the repo.

---

## 8. The five traps in `gcommit`, and why they are in the pack

The `gcommit` here is a rewrite of a tool that has been in daily use for months. **Every
refusal in it is a real failure, with a date and a cost.**

| | What went wrong | It now |
|---|---|---|
| 1 | Staged everything, so two people in one repo swept each other's half-finished work into their commits *(2026-08-25)* | **Never stages.** You stage; it commits. Refuses on an empty index |
| 2 | A multi-line message silently lost its prefix — `feat:` became a patch, no error *(2026-08-10)* | **Refuses** a multi-line message |
| 3 | Writing the *current* version into an app footer made it stale instantly — committing is what bumps it *(2026-08-04, three releases)* | `--dry-run` prints the version it **will create** |
| 4 | Docs-only commits bumped SemVer, restarting the treadmill *(2026-08-05, two releases)* | **Warns** and points at plain `git commit` |
| 5 | A CHANGELOG entry whose prose *quoted* the marker got a whole release section injected inside a bullet *(2026-08-18)* | Replaces **only the first** occurrence, and never inserts above the title |

All five are the same shape, and it is the shape this series has been teaching since Class
3: **a silent failure that produces a plausible artifact.**

> **Trap 5 is the one to sit with.** A dry run prints the version summary, not the diff —
> so it cannot show you a mangled CHANGELOG. **Read the file.** A tool that is careful
> about one thing and blind to the next is normal, not unusual.

---

## 9. What this class does not do

**It is not backup.**

git gives you history. It does not give you a second copy. A repo on a box that dies dies
with it, along with every commit in it.

That is worth being annoyed about, and it is the honest next class.

---

## 10. When it goes wrong

`TROUBLESHOOT.md` has all of it. Post the **exact error text** — the wording is the
diagnosis.

**And never paste your `.env`, a key, or a token into the thread.** If you do, rotate it
rather than deleting the message.

---

*The Brain That Runs a Company — Class 8. Orbix Automation Solutions.*
