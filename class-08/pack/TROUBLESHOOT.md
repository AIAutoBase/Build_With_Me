# Class 8 — when it goes wrong

Ordered by how much it costs you. **Section 4 is the one that does not announce itself.**

---

# 1. Getting started

## `git: command not found`

`sudo apt install git` on Debian/Ubuntu, `xcode-select --install` on macOS.

## `Please tell me who you are`

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

These are written into every commit permanently.

## `fatal: not a git repository`

You are not inside one. `cd` to your brain folder, or run `git init -b main` if P1 has not
happened yet.

---

# 2. `.env` and other secrets

## `.env` shows up in `git status`

It is not being ignored. Check `.gitignore` contains a line that is **exactly** `.env` —
no trailing spaces, no `*.env`, no comment on the same line.

```bash
grep -n "env" .gitignore
```

## It is in `.gitignore` and STILL shows up

**`.gitignore` does not apply to files git is already tracking.** Ignoring is for
untracked files only.

```bash
git rm --cached .env
git commit -m "chore: stop tracking .env"
```

That stops it going forward. **It does not remove it from history** — section 4.

## You are not sure whether it is tracked

```bash
git ls-files | grep "^\.env$"
```

Output means tracked. Silence means not.

---

# 3. `gcommit` refusing you

**All of these are the tool working.** Every one is a real failure it will not repeat.

| It says | Why | What to do |
|---|---|---|
| `nothing is staged` | It never runs `git add` — the version it replaces swept other people's work into commits *(2026-08-25)* | `git add <paths>` yourself |
| `the message must be a SINGLE line` | Multi-line messages silently lost the prefix; `feat:` became a patch *(2026-08-10)* | Use plain `git commit` when you need a body |
| `no conventional-commit prefix found` | It cannot guess the bump | Start with `feat:` `fix:` `docs:` `chore:`… |
| `everything staged is documentation` | A warning, not a refusal. Docs-only bumps start the treadmill *(2026-08-05)* | Use plain `git commit -m "docs: ..."` |
| `VERSION does not look like SemVer` | The file has been edited by hand | Put `X.Y.Z` back in it |
| `neither the marker nor a heading` | Your CHANGELOG has no `# Changelog` line and no marker | Add one; it refuses to guess |

## The version jumped a whole major and you did not mean it

A `!` in the prefix (`feat!:`) or the words `BREAKING CHANGE` anywhere in the message.
Both mean major, on purpose.

## The CHANGELOG entry landed above the title

Your CHANGELOG has neither the `<!-- CHANGELOG:ENTRIES -->` marker nor a `# Changelog`
heading. The shipped `gcommit` refuses rather than guessing; older tools put it at line 1.

Add the marker just under the heading.

## Two version sections, one buried inside a bullet

The famous one *(2026-08-18)*. An entry whose prose **quotes** the marker gets a whole
release section injected into that bullet, because a naive replace hits every occurrence.

**The shipped `gcommit` fixes this** — it replaces only the first. If you see it, you are
on an older tool.

> **A dry run cannot catch this.** It prints the version summary, not the diff. **Read the
> file.**

---

# 4. The one that does not announce itself

## A secret is already in your history

**`git status` will never tell you.** You can have a spotless working tree and a `.env`
sitting in every commit from March.

```bash
git log --all --full-history --oneline -- .env
```

Any output means it is in there. `verify.sh` runs this for you.

### The honest fix is to rotate, not to rewrite

Rewriting history is technically possible and it is **not the right first move**:

- It rewrites every commit hash, so anything referencing them breaks
- **It does not help at all if anyone ever cloned or copied the repo** — and a backup is a copy
- It is fiddly enough that people get it half-right and believe they are done

**Rotate what leaked. In this order:**

| What | How |
|---|---|
| **n8n encryption key** | Read the warning below first |
| OpenRouter / OpenAI / any API key | Revoke and reissue at the provider |
| Telegram bot token *(Class 4)* | `/revoke` to BotFather |
| Calendar secret URL *(Class 7)* | **Reset** in your calendar settings |
| Mailbox password *(Class 2, 5)* | Change it, then update the n8n credential |

> ### Rotating `N8N_ENCRYPTION_KEY` is not free
>
> That key decrypts every credential n8n has saved. **Change it and n8n cannot read any of
> them** — they are still there, and unreadable.
>
> So: change the key, then **re-enter every credential by hand.** Budget an hour.
>
> Do it anyway if the key is genuinely exposed to people you do not trust. If the repo has
> never left your machine and never will, the honest risk assessment may be different —
> **but make that a decision rather than an assumption.**

### Then stop it happening again

```bash
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: stop tracking .env"
bash verify.sh
```

---

# 5. Undo

Full detail in `docs/UNDO.md`. The two you need today:

| | |
|---|---|
| **Throw away uncommitted changes to one file** | `git checkout -- path/to/file` |
| **Undo the last commit but keep the changes** | `git reset --soft HEAD~1` |

> **`git checkout --` destroys uncommitted work with no confirmation and no undo.** It is
> the one command in this class that can lose something. Look at `git diff` before you run
> it.

---

# 6. Size and speed

## The repo is enormous

Something big got tracked. Find it:

```bash
du -sh .git
git count-objects -vH
```

Usually `node_modules/`, a Postgres data directory, or video. The shipped
`gitignore-template` excludes all three — **if it was in place before the first commit.**
If not, it is in history, and the same "history keeps it" rule applies.

## `git status` is slow

Something huge is being scanned. Same causes, same fix.

---

## Posting for help

The **exact error text**, what you ran, and the output of `git status --short`.

**Never paste `.env`, a key or a token.** If you do, rotate it — deleting the message does
not help.
