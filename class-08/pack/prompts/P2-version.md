# P2 — Version it

**Paste this whole file into Claude Code.** P1 must be done first — this needs a repo with
at least one commit in it.

**You end with:** a `feat:` commit that takes `0.1.0` to `0.2.0`, and a CHANGELOG that says
why.

---

```text
Set up versioning and a CHANGELOG in my brain repo, using the gcommit script from the
pack.

I am a beginner. Explain each step before you run it, and stop rather than guess.

## Step 1 - Why a version number is worth anything

Before we install anything, tell me why this matters for a folder only I use. I am
suspicious that this is ceremony.

The honest answer, in your words:

  - "it broke last Tuesday" is useless; "it broke in 0.4.2" is a place to look
  - a CHANGELOG is the answer to "why does this look like this?" three months from now,
    when I have forgotten
  - and it forces one sentence about intent per change, which is the actual value -
    the number is just the index

If you cannot make that case honestly, say so, and I will decide whether to bother.

## Step 2 - Install gcommit

Copy the pack's gcommit into my repo (or somewhere on my PATH) and make it executable:

  chmod +x gcommit

Then read it to me - not all of it, but the comment block at the top. It lists five real
failures, each with a date, that the script refuses to repeat. I want to know what it is
protecting me from before I start relying on it.

## Step 3 - Initialise

  ./gcommit --init

That creates:
  VERSION        starting at 0.1.0
  CHANGELOG.md   Keep a Changelog format, with an insert marker
  and a "Latest changes" section in my README if there is one

Show me all three. Then stage and commit them YOURSELF - the script deliberately does not
commit its own setup:

  git add VERSION CHANGELOG.md README.md
  git commit -m "chore: start versioning"

## Step 4 - Conventional commits, and which one bumps what

Explain the prefixes to me with an example of each from MY repo - something I might
actually write:

  feat:      a new capability          -> minor   0.1.0 -> 0.2.0
  fix:       something was broken      -> patch   0.1.0 -> 0.1.1
  perf:      same thing, faster        -> patch
  docs:      documentation only        -> patch
  refactor:  same behaviour, different -> patch
  chore:     housekeeping              -> patch
  feat!:     breaks something          -> MAJOR   0.1.0 -> 1.0.0

Then the rule that matters more than the table: the prefix is a promise about what
changed. If I cannot pick one, the commit is probably two commits.

## Step 5 - The dry run, and why it exists

Make a real change to something in the repo. Stage it.

Then:

  ./gcommit --dry-run "feat: <what you changed>"

Read the output to me. It prints the version it WILL create.

Explain why that matters, because it is not obvious:

  If any version string lives INSIDE this repo - an app footer, an about screen,
  APP_VERSION - I have to write the NEW number into it, not the current one. Committing
  is what creates the new version. Writing the current one means the footer is stale the
  instant the commit lands, and fixing that produces another commit, which produces
  another version.

  That treadmill cost three releases in one afternoon in the workspace this came from,
  on 2026-08-04.

If I have such a version string, update it now with the number the dry run printed, and
stage that too.

## Step 6 - The real thing

  ./gcommit "feat: <the same message>"

Then show me:
  cat VERSION
  head -20 CHANGELOG.md
  git log --oneline -3

## Step 7 - READ THE CHANGELOG. Do not just check the version number.

This is the step I want you to insist on.

Open CHANGELOG.md and look at it properly:

  - is the new section at the TOP, under the title, and not above it?
  - is there exactly ONE new version section?
  - are the older entries still intact - no bullet split in half?

Why: a dry run prints the version summary, not the diff. It CANNOT show you a mangled
CHANGELOG. In the workspace this pack came from, an entry whose prose quoted the insert
marker got a whole release section injected inside one of its bullets - two version
headings, one buried mid-list, on 2026-08-18. The version number was perfect.

The shipped gcommit fixes that specific bug. It will have others. Read the file.

## Step 8 - When NOT to use it

Tell me plainly: gcommit is for releases. If a commit changes only documentation, notes
or plans, use plain git commit.

  git add docs/ && git commit -m "docs: ..."

Why: a docs-only version bump means the app has nothing new to announce, so any in-repo
version string goes stale, and fixing it costs another bump. Two releases for zero
change, 2026-08-05.

The script warns about this. Do not train me to click through the warning.

## Step 9 - What I do from now on

  git status --short                     what changed
  git add <paths>                        choose
  ./gcommit --dry-run "feat: ..."        what version will this be
  ./gcommit "feat: ..."                  do it
  head -20 CHANGELOG.md                  read it back

## Ground rules

- Never claim something worked without output showing it worked.
- Never stage anything on my behalf without showing me the list first.
- Never use a multi-line message with gcommit - it refuses, and it is right to.
- Always dry-run before a real gcommit.
- ALWAYS open the CHANGELOG afterwards. The version number is not the artifact; the
  file is.
```

---

## The five traps `gcommit` refuses

Each one is real, dated, and cost something. All the same shape — **a silent failure that
produces a plausible artifact.**

| | | Fixed by |
|---|---|---|
| 1 | `git add -A` swept another session's work into a commit *(2026-08-25)* | It never stages. Refuses on an empty index |
| 2 | Multi-line message → `feat:` silently became a patch *(2026-08-10)* | Refuses multi-line |
| 3 | In-repo version written from the current number, stale instantly *(2026-08-04)* | `--dry-run` prints the **next** version |
| 4 | Docs-only commits bumping SemVer *(2026-08-05)* | Warns, and points at plain `git commit` |
| 5 | Prose quoting the marker got a release section injected mid-bullet *(2026-08-18)* | Replaces only the **first** occurrence |

## If it goes wrong

| What you see | What it means |
|---|---|
| `nothing is staged` | Working as designed. Stage what you mean first |
| `the message must be a SINGLE line` | Working as designed. Use plain `git commit` for a body |
| `no conventional-commit prefix found` | Start with `feat:`, `fix:`, `docs:`… |
| The entry landed above the title | A CHANGELOG with no marker **and** no `# Changelog` heading |
| Two version sections | Read `TROUBLESHOOT.md` — and check whether your prose quotes the marker |
| The version jumped by a whole major | A `!` in the prefix, or `BREAKING CHANGE` in the text |
