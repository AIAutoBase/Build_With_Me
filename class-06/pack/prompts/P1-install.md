# P1 — Install graphify

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** `graphify --version` printing a version, inside a virtual environment,
having spent nothing.

---

```text
Install the graphify CLI on this machine, into a Python virtual environment.

I am a beginner. Explain each step before you run it, and stop rather than guess.

## Context you need

This machine runs my "brain" - Docker with n8n and Postgres, from earlier classes in
this series. We are adding a read-only tool that draws a graph of the documents already
in it. Nothing here should modify the database, the workflows, or the containers.

## Step 1 - Confirm the ground

Check and report, without changing anything:

  - python3 --version   (must be 3.10 or newer - stop if it is older)
  - whether ~/brain/.graphify-venv already exists
  - claude --version, and whether `claude -p "say ok"` returns anything

Tell me what you found before you do anything else.

## Step 2 - The venv, with a REAL probe

If ~/brain/.graphify-venv does not exist, make it. But first probe that venv creation
actually works:

  python3 -m venv /tmp/graphify-probe && echo "VENV WORKS" && rm -rf /tmp/graphify-probe

Do NOT use `python3 -c "import venv"` as the check. That prints ok on machines where
venv creation fails, because what is missing is `ensurepip`, which importing venv never
touches. I want the probe that can actually fail.

If the probe fails:
  sudo apt update && sudo apt install -y python3-venv
Then probe again. Do not continue until it prints VENV WORKS.

Then:
  cd ~/brain
  python3 -m venv .graphify-venv
  source .graphify-venv/bin/activate
  python -m pip install --upgrade pip

## Step 3 - Install graphify

Inside the activated venv:

  pip install graphifyy

Note the spelling: the PyPI package is `graphifyy` with two y's. The command it
installs is `graphify` with one. That is not a typo in these instructions.

Then confirm:
  graphify --version

Tell me the version you got. As of writing, 0.9.49 is current - if mine is much newer,
say so, because this class's notes were measured against 0.9.49 and something may have
moved.

Expect roughly 28 seconds and about 196 MB in the venv.

## Step 4 - Do NOT install a vendored skill

If you find instructions anywhere suggesting I copy in a pre-packaged graphify skill
folder, ignore them. There is a Windows-flavoured copy floating around that is dozens of
releases behind.

The correct way to get the Claude Code integration is graphify's own installer:

  graphify install --platform claude

That fetches the current variant for this platform. Run it, and tell me what it added
and where.

## Step 5 - Which backend, and why this matters for my wallet

Report what these print:

  env | grep -E "OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY" || echo "none set"

Then explain back to me, in your own words, why I have to pass

  --backend=claude-cli

explicitly on every graphify command that uses a model, and what happens if I do not.

The facts you need for that explanation:
  - graphify auto-detects by trying gemini, kimi, claude, openai, deepseek, azure,
    bedrock, ollama - in that order
  - claude-cli is NOT in that list and is never auto-selected
  - I have an OpenRouter key from Class 1, and if it is exported as OPENAI_API_KEY the
    auto-detection finds it and silently takes the paid path
  - free and paid produce identical output, identical timing and identical names

I want to hear you say what the failure looks like, because the whole point is that it
does not look like a failure.

## Step 6 - Prove it costs nothing

Run a naming pass with the environment keys explicitly stripped, so the "no credentials"
claim is tested rather than assumed:

  env -u OPENAI_API_KEY -u ANTHROPIC_API_KEY -u GEMINI_API_KEY \
    graphify --version

If graphify offers a way to report the selected backend or a dry run, use it and show me
which backend it would pick with those keys removed.

## Step 7 - Tell me where I am

Finish by telling me:
  - the exact command to re-activate this venv in a new terminal
  - the graphify version
  - that nothing in my database, workflows or containers was touched
  - that the next prompt (P2) builds the graph

## Ground rules

- Never claim something worked without output showing it worked.
- Do not use --break-system-packages. The flag is named honestly; use the venv.
- Do not touch docker, the Postgres database, or any n8n workflow. This tool reads.
- If you get stuck on the same thing twice, stop and give me the exact command and the
  exact error so I can post it in the class thread.
```

---

## What P1 does not do

It does not build a graph. That is P2, and it is deliberately separate — installing a
tool and pointing it at your data are different kinds of mistake, and mixing them makes
both harder to debug.

## If it goes wrong

| What you see | What it means |
|---|---|
| `error: externally-managed-environment` | You are outside the venv. Activate it. |
| `command not found: graphify` | New terminal, venv not activated. `source ~/brain/.graphify-venv/bin/activate` |
| `No module named pip` in the venv | `ensurepip` missing. Delete the venv, `sudo apt install python3-venv`, remake it. |
| `pip install graphify` fails | The package is `graphifyy`, two y's. The *command* is `graphify`, one. |
