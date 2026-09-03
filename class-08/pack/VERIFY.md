# Class 8 — did it actually work?

`verify.sh` answers most of this. **Two of the checks below it cannot make for you**, and
they are the two that matter.

Run the script first:

```bash
bash verify.sh ~/brain
```

Then walk this list.

---

## The bar for this class

You are done when **all four** of these are true:

1. Your brain folder is a git repo with real commits in it
2. **`.env` is not in the working tree and not in the history**
3. `./gcommit "feat: ..."` produces a version bump and a CHANGELOG entry you have **read**
4. A stranger could stand your brain up from the README without asking you anything

---

# 1. It is a repo

```bash
cd ~/brain
git log --oneline
```

**Expect:** at least two commits — the first import and something since.

**If it prints nothing:** `git init -b main` ran but nothing was committed. P1 step 6.

```bash
git status --short
```

**Expect:** short, and nothing in it surprises you.

> **If this is long, that is the finding, not a failure.** A hundred untracked lines
> usually means `node_modules/` or a database directory is not being ignored. Fix
> `.gitignore` before the next commit rather than after.

---

# 2. `.env` is out — both places

## Working tree

```bash
git ls-files | grep "^\.env$"
```

**Expect: nothing.** Output means it is tracked.

```bash
git check-ignore -v .env
```

**Expect:** a line naming `.gitignore` and the rule. **No output means it is not being
ignored**, even if you think you added it.

## History — the one `git status` will never mention

```bash
git log --all --full-history --oneline -- .env
```

**Expect: nothing.**

**If it prints commits**, then deleting the file did not help and neither did
`.gitignore`. Every one of those commits still contains the key, and so does every copy of
the repo.

Go to `TROUBLESHOOT.md` section 4. **The answer is to rotate what leaked, not to rewrite
history.**

## Everything else that is key-shaped

```bash
git grep -I -n -E "sk-or-v1-|sk-ant-|ghp_|AIza" $(git rev-list --all)
```

**Expect: nothing.** This catches the case `.env` checks miss — a key pasted directly into
a workflow export, a note or a compose file.

---

# 3. Versioning works, and you looked at what it produced

```bash
cat VERSION
head -25 CHANGELOG.md
git log --oneline -5
```

**Expect:** `VERSION` past `0.1.0`, and a CHANGELOG section that matches.

> ### This is the check most people skip
>
> **Open `CHANGELOG.md` and read it.** Not the version number — the file.
>
> - Is the newest section **under** the title, not above it?
> - Is there exactly **one** new version section?
> - Are the older bullets still whole — nothing split in half?
>
> A dry run prints the version it will create. It cannot show you a mangled CHANGELOG,
> because it does not write one. On 2026-08-18 in the workspace this pack came from, a
> CHANGELOG ended up with a whole release section buried inside somebody's bullet. **The
> version number was perfect.**
>
> The shipped `gcommit` fixes that specific bug. It will have others.

### Prove the refusals are real

Three seconds each, and now you know they are not decoration:

```bash
./gcommit "feat: nothing is staged"
```
**Expect:** refusal, exit 1. It never runs `git add`.

```bash
git add README.md
./gcommit --dry-run "feat: a thing"
```
**Expect:** the **next** version printed, and nothing committed.

**Why the dry run exists:** if any version string lives *inside* the repo — an app footer,
`APP_VERSION` — you must write the **new** number into it. Writing the current one makes it
stale the instant the commit lands, and fixing that costs another commit, which costs
another version. Three releases in one afternoon, 2026-08-04.

---

# 4. The README passes the stranger test

**This is the check no script can make.**

Not *"is it documented?"* — everyone answers yes to that. The question is:

> **Could a competent stranger, given only this repo, get it running without asking you
> anything?**

Read your README as if you had never seen the machine:

- [ ] **What is this?** Answered in two sentences, at the top
- [ ] **How do I run it?** Real commands, in order, copy-pasteable. No "simply", no "just"
- [ ] **What do I need first?** Accounts, keys, versions, before step 2 works
- [ ] **What breaks?** Real failures you have hit, with the fix

And the negative check — grep your own document:

- [ ] No keys, tokens, chat ids, or URLs with a secret in them
- [ ] No LAN addresses or personal paths presented as if they were yours to reuse
- [ ] Nothing described as working that has never been run

> **The last one is the honest bit.** "The inbox sort is set up but has never run against
> real mail" is a useful sentence. Silence there is a lie that costs somebody an afternoon
> — possibly yours, in March.

---

# What "passed" looks like

```
  14 passed, 0 failed, 1 warnings

  Ready.
```

Plus, from your own eyes and not from a script:

- You **opened** `CHANGELOG.md` and it is well-formed
- You **read** the README as a stranger and fixed what you found

---

# What passing does NOT mean

**It does not mean your history is clean** — it means the checks in this list found
nothing. `verify.sh` looks at the last 200 commits and at four key shapes. A password in a
config file, or a token shaped like nothing in particular, walks straight past it.

**It does not mean the README is good** — it means it has four sections. Only the stranger
test tells you whether it works, and you cannot run that on yourself perfectly, because you
cannot un-know your own setup.

**It does not mean you are backed up.** A local repo on one disk is version control, not a
backup. If the disk dies, both go. That is a real gap and this class does not close it.

---

*The Brain That Runs a Company — Class 8. Orbix Automation Solutions.*
