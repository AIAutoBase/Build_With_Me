# The four undos, and which one loses work

Git has a lot of ways to go backwards. You need four, and **one of them destroys things
with no confirmation.**

---

## The one that can lose work

```bash
git checkout -- path/to/file
```

**Throws away uncommitted changes to that file.** No confirmation, no undo, no recovery.

It is also the one from the cold open — break the dashboard, put it back in ten seconds —
so you will use it, and you should know what it costs.

**Look before you run it:**

```bash
git diff path/to/file     # this is what you are about to destroy
```

If you are not sure, commit first. A messy commit you delete later beats work that no
longer exists.

---

## The four

### 1. Undo changes you have not committed

```bash
git checkout -- path/to/file      # one file
git checkout -- .                 # everything. Careful.
```

**Loses work.** See above.

### 2. Unstage something you added by mistake

```bash
git restore --staged path/to/file
```

**Safe.** The file keeps your changes; it just stops being in the next commit.

Use this the moment you notice `.env` in `git status` after an accidental `git add .`.

### 3. Undo the last commit, keep the changes

```bash
git reset --soft HEAD~1
```

**Safe.** The commit disappears, your work stays staged. This is the "wrong message" or
"forgot a file" fix.

Then commit again properly.

### 4. Undo a commit that is already shared

```bash
git revert <commit>
```

**Safe.** Makes a *new* commit that undoes the old one, leaving both in history.

On a local-only repo you rarely need this. It matters the moment anyone else has a copy —
which is the honest reason `reset` is fine here and would not be elsewhere.

---

## What NOT to reach for

### `git reset --hard`

Throws away commits **and** your working changes. It is the one that shows up in every
horror story.

There is almost always a softer answer. If you genuinely want it, run `git status` and
`git diff` first and read them.

### Rewriting history to remove a secret

`filter-branch`, `filter-repo`, `BFG` — all real tools, none of them the right first move.

**Rotate the secret instead.** Rewriting does not help if the repo was ever copied, and a
backup is a copy. `TROUBLESHOOT.md` section 4 has the full argument.

---

## Finding what you want to go back to

```bash
git log --oneline              # the commits
git log --oneline -- path      # commits that touched one file
git show <commit>              # what changed in one
git diff <commit> -- path      # that file, then vs now
```

**This is what the CHANGELOG is for.** "It broke in 0.4.2" gives you a place to start;
"it broke last Tuesday" does not.

---

## The one that is not an undo

```bash
git stash
```

Puts your uncommitted changes aside so you can do something else, and `git stash pop`
brings them back.

It is useful and it is also where work goes to be forgotten. **Commit instead**, on a
scruffy commit if you have to. A commit is visible in `git log`; a stash is not.
