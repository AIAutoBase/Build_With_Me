# Class 9 — The Cockpit

**The Brain That Runs a Company, Part 9.**

A terminal inside your dashboard, running an agent with shell access to the folder that
holds eight weeks of your work.

That sentence is the sales pitch and the warning, and it is the same sentence.

---

## What this pack is

Teaching material and a working reference guard. **It is not the cockpit.** You build that
in class, from the sixteen prompts in `prompts/`, on your own machine.

That is deliberate. A terminal that runs commands on your box is not something you should
install from a zip you did not read, and handing you the zip while telling you that would
be dishonest.

## What is in it

| File | What it is |
|---|---|
| `guard.mjs` | The **reference guard**. Decides which commands may run. Runs nothing, ever — no `spawn`, no `exec`, no `child_process` import |
| `allowlist.json` | The nineteen commands the reference guard permits, and the flags and subcommands each accepts |
| `refusals.txt` | Forty-five commands that MUST be refused, each with the rule number expected to catch it |
| `allowed.txt` | Twenty commands that MUST be allowed. The shorter half of the claim, and the one that proves the guard is not a brick |
| `check-guard.mjs` | The offline checker. **The only file here that is safe to run before class**, and the only one the installer runs |
| `VERIFY.md` | Nine things to prove against the running system, with blank result lines you fill in |
| `TROUBLESHOOT.md` | The five traps, symptom first |
| `prompts/BUILD-PROMPTS.md` | The sixteen build prompts |

## What this pack does NOT do

- It does not start anything. Not the dashboard, not Docker, not the cockpit.
- It does not run any git command that changes anything.
- It does not read, print or edit your `.env`.
- It does not install an npm package.

The installer checks your setup and stops. Wiring happens in class, at minute 14.

## The reference guard is a reference

`guard.mjs` ships so that refusals are **provable on your machine before class**, while
nothing on your box can yet execute anything from a browser. It is not the guard you will
run in production.

In class you write your own (build prompt 04) and point the checker at it:

```bash
node check-guard.mjs --guard ../brain/cockpit/guard.mjs
```

Your guard needs to export `makeGuard({ root })` returning an object with
`check(rawInput, mode)`. That is the only shape requirement, and it exists so this checker
can reach it.

## Run the checker now

```bash
node check-guard.mjs
```

Expected: forty-five refusals with the expected rule, twenty allowed, zero failures. It
spawns nothing to produce that table.

If any line says FAIL, do not wire the cockpit into anything. A guard that allows something
on the refusal list is worse than no guard, because it produces a table that looks like a
guarantee.

## The nine rules

| Rule | Refuses |
|---|---|
| 1 | A shell metacharacter — `; \| & $ \` > <`, a newline, `$(` or `${` |
| 2 | An empty command |
| 3 | A command not on the allowlist |
| 4 | A subcommand not allowed for that command |
| 5 | A flag not allowed for that command |
| 6 | A WRITE command while the cockpit is in READ mode |
| 7 | A path resolving outside the pinned root |
| 8 | `.env`, by name |
| 9 | More arguments than the entry permits |

**Rule 1 is the load-bearing one.** Refusing metacharacters means you are no longer writing
a shell parser — and every published escape of this shape is a bug in somebody's shell
parser. It costs you pipelines and buys you the entire class of attack that composition
enables.

**Rule 7 compares resolved paths**, not strings. String-matching on `../` is defeated by a
symlink. Resolving first is defeated by nothing, because the answer it checks is the answer
the operating system will actually use.

## What this does not protect against

Stated here rather than left for you to discover:

- **An agent in WRITE mode with a scripting language on the allowlist can read any file on
  the box.** The default allowlist has none, on purpose. Add `python` and rule 8 becomes
  decoration.
- **The guard does not stop a command that is allowed and wrong.** `mv` is on the WRITE
  list. It can still move something you wanted.
- **Everything here assumes POSIX path resolution.** The Windows path is untested.

Git is what covers the second one. That is why Class 8 came first.

---

MIT licensed. Requires Node 20 or newer.
