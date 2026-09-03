# Commit messages that are worth reading later

A commit message is a note to yourself in three months, when you have forgotten everything
and something is broken.

That is the whole design brief.

---

## The prefixes, and what each one bumps

```
feat:      a new capability            ->  minor    0.1.0 -> 0.2.0
fix:       something was broken        ->  patch    0.1.0 -> 0.1.1
perf:      same thing, faster          ->  patch
refactor:  same behaviour, different   ->  patch
docs:      documentation only          ->  patch
chore:     housekeeping, deps, config  ->  patch
feat!:     breaks something            ->  MAJOR    0.1.0 -> 1.0.0
```

`BREAKING CHANGE` anywhere in the message does the same as `!`.

---

## The rule that matters more than the table

**The prefix is a promise about what changed.**

If you cannot pick one, the commit is probably two commits. That is not pedantry — it is
the single thing that makes `git log` readable a year later. A commit that fixes a bug
*and* adds a feature *and* tidies the compose file can never be reverted cleanly, and it
cannot be summarised in one line without lying.

---

## What goes after the colon

**What changed, in the imperative, in one line.**

| | |
|---|---|
| Good | `fix: stop the inbox sort re-labelling already-sorted mail` |
| Bad | `fix: bug` |
| Bad | `fix: fixed the thing that was broken in the workflow` |

The test: read it back with *"this commit will…"* in front.

> *"This commit will stop the inbox sort re-labelling already-sorted mail."* ✔
> *"This commit will bug."* ✗

**About 50 characters** is the target. Not a rule — a hint that you are describing one
change rather than an afternoon.

---

## Say WHY when the what is obvious

The diff already shows *what* changed. It can never show *why*.

```
fix: raise the digest timeout to 90s

The summariser routinely takes 40-60s on a full inbox and the old 30s
cut it off mid-message, which looked like an empty digest rather than a
timeout.
```

**That paragraph is the valuable part**, and it is the part git cannot reconstruct.

> **`gcommit` refuses multi-line messages** — on purpose, because multi-line silently ate
> the prefix and turned a `feat:` into a patch *(2026-08-10)*.
>
> So when you need a body, use plain `git commit`:
>
> ```bash
> git commit          # opens your editor: subject, blank line, body
> ```
>
> You lose the automatic version bump. Bump it separately if the change deserves one. The
> paragraph is worth more than the automation.

---

## Which tool, when

| Situation | Use |
|---|---|
| A release — the brain does something new or fixed | `./gcommit "feat: ..."` |
| Documentation, notes, plans only | `git commit -m "docs: ..."` |
| You need a body explaining why | `git commit` |
| Work in progress you want saved | `git commit -m "chore: wip ..."` — commit it, do not stash it |

> **Why docs get a plain commit:** a docs-only version bump means the app has nothing new
> to announce, so any in-repo version string goes stale, and fixing *that* costs another
> bump. Two releases for zero change *(2026-08-05)*. `gcommit` warns; do not train yourself
> to click through the warning.

---

## Scopes, if you want them

```
feat(dashboard): add the calendar strip
fix(inbox): stop re-labelling sorted mail
```

Optional. They pay off once one repo holds several parts. Skip them until then rather than
inventing a taxonomy you will not keep.

---

## The messages you will regret

| | Why |
|---|---|
| `update` | Every commit is an update |
| `fix stuff` | Which stuff |
| `asdf` | You will find this one at 2am |
| `feat: changes` | A prefix does not rescue an empty sentence |
| `WIP` | Fine for ten minutes, terrible in history. Say what is in progress |

---

## One habit that makes all of this work

```bash
git status --short      # what actually changed
git diff                # read it
git add <paths>         # choose. Not `git add -A`
```

**Choosing what goes in the commit is what makes the message writable.** If you sweep
everything in with `-A`, the honest message is "some things changed" — and you have also
just swept in whatever another session left lying around *(2026-08-25, which is why
`gcommit` never stages)*.
