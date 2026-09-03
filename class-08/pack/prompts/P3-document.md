# P3 — Document it

**Paste this whole file into Claude Code.**

**You end with:** a README that someone else — or you in six months — could stand your
brain up from.

---

## The test this prompt is built around

**Not "is it documented?"** That question has no answer and everyone says yes.

> **Could a competent stranger, given only this repo, get it running without asking you
> anything?**

That has an answer, and it is usually no.

---

```text
Write the README for my brain repo.

I am a beginner. Ask me things rather than inventing them, and stop rather than guess.

## Step 1 - Find out what is actually here, do not assume

Read my repo properly before writing a word:

  - docker-compose.yml - what services, what ports, what volumes
  - the exported workflows - what each one does, and which are active
  - the dashboard files
  - .env.example - what variables exist
  - VERSION and CHANGELOG.md, if P2 is done

Then tell me what you found. If something's purpose is not obvious from the file, ASK ME
rather than guessing. A confident wrong sentence in a README is worse than a gap,
because I will believe it in six months.

## Step 2 - The four questions

The README answers four things, in this order. Nothing else is required.

  1. WHAT IS THIS?
     Two sentences. What it does, for whom. Not how.

  2. HOW DO I RUN IT?
     The actual commands, in order, from a machine that has nothing.
     Every one of them copy-pasteable. No "simply" and no "just".

  3. WHAT DO I NEED FIRST?
     Accounts, keys, versions. What has to exist before step 2 works.

  4. WHAT BREAKS, AND WHAT DO I DO?
     The failures I have actually hit, and the fix. This is the section that
     makes it worth anything.

## Step 3 - Section 4 is the one that matters, so mine it properly

Do not invent plausible failures. Get the real ones:

  - read the TROUBLESHOOT files from my earlier class packs
  - look at what is in my CHANGELOG under "Fixed"
  - ask me: what has gone wrong that took you more than ten minutes?

Write down what I say. My own worst afternoons are the most valuable paragraphs in this
document, and they are the ones I will forget first.

## Step 4 - What NOT to put in it

  - No keys, no tokens, no URLs with a secret in them, no chat ids
  - No LAN addresses or personal paths - use placeholders, and say they are placeholders
  - No screenshots of anything with a credential panel open
  - No aspirational sections. If it is not built, it does not go in the README

Then check yourself: read back what you wrote and look for anything I would not want
read aloud. This file is going in git, and git remembers.

## Step 5 - Write it, then test it against the stranger

Write the README. Then re-read it AS the stranger and tell me honestly:

  - which step would they get stuck on
  - what did you assume they know
  - what did you leave out because you already knew it

Fix those. That gap is the whole exercise, and you are better placed to spot it than I
am, because I cannot un-know my own setup.

## Step 6 - Keep it honest about state

If something is half-built, say so IN the README. "The inbox sort is set up but has
never been run against real mail" is a useful sentence. Silence there is a lie that
costs somebody an afternoon.

Every class pack in this series does this, and it is why they are trustworthy.

## Step 7 - Commit it

  git add README.md
  git commit -m "docs: write the README"

Plain git commit, NOT gcommit - documentation only, so no version bump. (P2 explains
why; it is the treadmill.)

## Ground rules

- Ask rather than invent. A confident wrong sentence is worse than a gap.
- No secrets, no personal paths, no LAN addresses.
- Say what is not built rather than implying it is.
- Do not write aspirational documentation.
```

---

## Why this is a prompt and not a template

A README template gets filled in with the obvious and skips the useful. The four questions
force the useful bits — especially the fourth, which is the only section anyone reads twice.

## The one that gets skipped

**Section 4 — what breaks.** It is the hardest to write and the only one you will thank
yourself for. Your own worst afternoons are the most valuable paragraphs in the document,
and they are the first thing you forget.

## If it goes wrong

| What you see | What it means |
|---|---|
| The README describes something you do not have | It invented rather than asked. Make it re-read the repo |
| It is long and says nothing | It answered "what is this" four times. Only four questions, in order |
| A key ended up in it | **Rotate it.** It is committed now, and history keeps it |
| It reads as finished when it is not | Add the honest sentence. Silence there costs somebody an afternoon |
