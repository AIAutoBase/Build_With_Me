# P1 — Track it

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** `git log` showing one commit, `git status` clean, and **`.env` nowhere
near either of them.**

---

```text
Put my brain folder under version control, locally, with no remote.

I am a beginner. Explain each step before you run it, and stop rather than guess.

## The rule that governs this whole prompt

DO NOT create a remote. Do not suggest GitHub, do not run `git remote add`, do not offer
to push anywhere. This is a local repository on my own machine, on purpose.

If I ask for a remote later, that is a different conversation and it is really about
backup, not about version control.

## Step 1 - Look before you touch

Find my brain folder - the one with docker-compose.yml, my exported workflows, the
dashboard, the prompts from earlier classes. Do not assume ~/brain; look.

Then show me, and do not skip any of it:

  - is it already a git repo? (if yes, STOP and tell me - we are in a different
    situation and I need to know before anything changes)
  - how many files, and how big is the folder
  - anything over 10 MB
  - is there a .env
  - is there anything else with a secret in it - a JSON credentials file, a .pem, a
    token pasted into a note

I want to see this list before we make any decisions about what to track.

## Step 2 - Explain the .env problem back to me

Before we create anything, tell me in your own words why .env must never be committed.

The facts you need:

  - it holds the key that decrypts every credential n8n has saved
  - committing it once puts it in history PERMANENTLY
  - deleting the file and committing again does NOT remove it: every earlier commit
    still contains it, and so does every copy of the repo
  - the fix, if it has already happened, is to ROTATE the key - not to try to rewrite
    history

I want to hear you say the third one especially, because that is the part that surprises
people. Four earlier classes told me never to OVERWRITE this file. None of them told me
not to commit it.

## Step 3 - The .gitignore, first

Before `git init`. Before anything is staged.

Copy the pack's gitignore-template to .gitignore in my brain folder. Read it to me and
explain the first section - the secrets one - line by line.

Then explain the rule it is built on, which matters more than the list:

  IF IT HAS A VALUE IN IT, IT DOES NOT GO IN GIT.

Lists go stale. That sentence does not.

## Step 4 - The .env.example

Copy the pack's env.example to .env.example in my folder, then adjust it to match the
variables I ACTUALLY have in my .env.

Read my .env to get the NAMES.

  - Copy the names.
  - Do NOT copy any value. Not one, not even a short one, not even one that looks
    harmless.
  - Do not print any value to the screen while you do this.

Then show me the .env.example you produced so I can confirm it is empty of values.

## Step 5 - git init, and set my identity

  git init -b main

If git does not know who I am yet, ask me for a name and an email and set them. Do not
invent them and do not use a placeholder - the commits carry this forever.

## Step 6 - Stage deliberately, and show me before committing

Do NOT run `git add -A` or `git add .`.

Stage what should be tracked, explicitly, and then show me:

  git status --short

Walk down that list with me. For anything you are unsure about, ask rather than
including it.

Then, before committing, run this and read the answer out loud:

  git ls-files | grep -c "^.env$"

That must be 0. If it is not, stop - we fix it before the first commit exists, because
after the commit it is a much worse problem.

## Step 7 - The first commit

  git commit -m "chore: put the brain under version control"

Then show me:

  git log --oneline
  git status

One commit. Clean tree.

## Step 8 - Prove the safety net actually works

This is the part that makes the rest believable, so do it properly.

  1. Have me pick a file that is safe to break - the dashboard HTML is ideal.
  2. Break it visibly. Delete a chunk of it.
  3. Show me it is broken - reload the page, or cat the file.
  4. Show me what changed:      git diff
  5. Put it back:               git checkout -- <that file>
  6. Show me it is back.

Then tell me plainly: that is the whole reason we did this, and it is the reason we did
it BEFORE the class that puts an agent with shell access in my dashboard.

## Step 9 - What I do from now on

Give me the three commands I will actually use, and nothing more:

  git status --short           what have I changed
  git add <paths>              choose what goes in
  git commit -m "..."          save it, with a reason

Tell me to commit when something works, not when something is finished. Finished is
rare; working happens all day.

## Ground rules

- Never claim something worked without output showing it worked.
- NEVER stage or commit .env, or any file with a credential in it.
- Never print the contents of .env to the screen.
- Do not create a remote, and do not offer to.
- Do not use `git add -A` or `git add .` - stage explicitly, every time.
- If .env is already in history, STOP and tell me. Do not try to rewrite history to fix
  it; tell me to rotate the key instead.
```

---

## Why no `git add .`

Two people — or two agent sessions — in one repo, and whoever commits first sweeps the
other's half-finished work into their commit. That happened in the workspace this pack
comes from on **2026-08-25**: three commits carried one session's work under another
session's message.

Nothing was lost that time. A mid-flight edit could easily have shipped.

## If it goes wrong

| What you see | What it means |
|---|---|
| `Please tell me who you are` | git has no name/email. `git config --global user.name` and `user.email` |
| `.env` shows in `git status` | Your `.gitignore` is missing, misspelled, or `.env` was already tracked |
| Already tracked despite `.gitignore` | `.gitignore` does not apply to tracked files. `git rm --cached .env` |
| `git checkout` did not restore it | The file was never committed, so there is nothing to restore to |
| The repo is enormous | Something big got staged. Check `gitignore-template` is actually in place |
