# Class 6 — do this before the hour

**Time: about fifteen minutes. Cost: nothing, and no card.**

Class 6 turns everything you fed your brain into a graph you can look at. To do that it
needs Python and a working virtual environment on the machine your brain runs on.

That sounds trivial and it is not. **Four things go wrong on a clean Debian box, and one
of them is a check that passes while the thing it checks is broken.** All four are below.
Read to the end before you start.

---

## Before you begin

| You need | Check |
|---|---|
| The starter pack done | `bash verify.sh` says **Ready** |
| Class 3 working, **with documents in it** | Your dashboard's Ask tab answers a question about your own files |
| Claude Code signed in | `claude --version`, then `claude -p "say ok"` returns something |
| Shell access to the box your brain runs on | Not your laptop, unless that is the same machine |

**Class 3 needs actual documents in it.** This class draws a picture of what your brain
knows. If it knows nothing, you get an empty picture and learn nothing from it. Ingest a
few real documents first — the practice pack counts, your own paperwork is better.

---

## Step 1 — Check your Python

```bash
python3 --version
```

**You need 3.10 or newer.** The teaching box has 3.13.5.

If you are below 3.10, stop and upgrade before class. Everything after this depends on it.

---

## Step 2 — Trap 1: you cannot `pip install` anything

Try it and Debian 13 tells you no:

```
error: externally-managed-environment
```

**That is correct behaviour, not a broken machine.** It is PEP 668. Debian protects its
own Python packages from being overwritten by `pip`, and the marker file that turns it on
is right here:

```bash
ls /usr/lib/python3.13/EXTERNALLY-MANAGED
```

The fix is a **virtual environment** — a private Python that lives in a folder and cannot
break the system one. That is what Step 3 makes.

> **Do not** work around this with `--break-system-packages`. The flag is named honestly.

---

## Step 3 — Trap 2: the check that passes while it is broken

This is the important one, and it is worth understanding rather than just copying.

The obvious way to check whether you can make a virtual environment is:

```bash
python3 -c "import venv" && echo ok
```

**It prints `ok` on a box where venv creation fails.** We found this the hard way — the
check went green and then the venv failed a minute later.

The reason: `venv` the module is present, but `ensurepip` is not, and that is what
actually installs `pip` into the new environment. Importing `venv` never touches it.

**So probe it for real.** Actually make one and throw it away:

```bash
python3 -m venv /tmp/probe && echo "VENV WORKS" && rm -rf /tmp/probe
```

If that fails:

```bash
sudo apt update && sudo apt install -y python3-venv
```

Then run the probe again, and do not continue until it prints `VENV WORKS`.

> ### The lesson, which is bigger than this class
>
> **A check that cannot fail is not a check.**
>
> `import venv` could never have told you the truth, because it does not touch the thing
> that was missing. It made you feel checked without checking anything.
>
> This is the same shape as Class 3's green execution that stored the wrong data, and
> Class 4's file of the right size full of static. Ask yourself what your check would do
> if the thing were broken. If the answer is "the same thing", it is not a check.

---

## Step 4 — Make the real environment

On the box your brain runs on:

```bash
cd ~/brain
python3 -m venv .graphify-venv
source .graphify-venv/bin/activate
python -m pip install --upgrade pip
```

Your prompt should now start with `(.graphify-venv)`.

**Everything in this class happens inside that environment.** If you open a new terminal
you have to activate it again:

```bash
source ~/brain/.graphify-venv/bin/activate
```

Forgetting this is the single most common way to get *"command not found: graphify"* on a
machine where graphify is definitely installed.

Budget: **196 MB** of disk once graphify is in, and about **50 MB** of RAM at rest.

---

## Step 5 — Trap 3: know which backend you are about to use

**Read this even if you skip the rest. It is the one that quietly costs money.**

Graphify picks a backend automatically by trying these in order:

```
gemini → kimi → claude → openai → deepseek → azure → bedrock → ollama
```

**`claude-cli` — the free one we are going to use — is not in that list.** It is never
selected for you. You have to ask for it by name, every time:

```bash
graphify update . --backend=claude-cli
```

Now here is why it matters. You have an OpenRouter key from Class 1. If it is exported as
`OPENAI_API_KEY`, auto-detection reaches `openai`, finds it, and takes the **paid** path.

**Free and paid look identical on screen.** Same output. Same ten seconds. Same community
names. The only place the difference shows up is your invoice.

Check what is currently exported, before class:

```bash
env | grep -E "OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY" || echo "none set - good"
```

If any of them are set, you do not have to unset them permanently — just know that you
must pass `--backend=claude-cli` explicitly, and `TROUBLESHOOT.md` shows you how to
confirm which one actually ran.

---

## Step 6 — Trap 4: Obsidian is not going on this box

If you have read about Graphify elsewhere, it is usually paired with **Obsidian**, and you
may be expecting to install it here.

**You cannot.** Obsidian is an Electron desktop application. Your brain is a headless
server with no desktop. There is nothing to install it into.

So the default in this class is **the graph served from the dashboard you already have** —
a web page, on the machine that already serves you a dashboard, reachable from any device
on your network.

Obsidian is still available to you, on **your laptop**, and it is genuinely nicer. It just
means getting the vault from the box to the laptop — Syncthing, a network share, or git.
That is `docs/UPGRADE-obsidian.md`, and it is an upgrade rather than the main path
deliberately.

---

## What to have ready on the day

- [ ] `python3 --version` is 3.10 or newer
- [ ] `python3 -m venv /tmp/probe` really works — **the real probe, not `import venv`**
- [ ] `~/brain/.graphify-venv` exists and activates
- [ ] Claude Code signed in — `claude -p "say ok"` answers
- [ ] Class 3 has **real documents** in it, and the Ask tab answers about them
- [ ] You know whether `OPENAI_API_KEY` is exported on that box
- [ ] Shell access to the machine, not just the dashboard

---

## If something goes wrong

| What you see | What it means |
|---|---|
| `error: externally-managed-environment` | PEP 668. Use the venv. Working as designed. |
| `python3 -c "import venv"` says ok but `python3 -m venv` fails | `ensurepip` is missing. `sudo apt install python3-venv`. |
| `command not found: graphify` | The venv is not activated in this terminal. `source ~/brain/.graphify-venv/bin/activate`. |
| `No module named pip` inside the venv | Same missing `ensurepip`. Delete the venv, install `python3-venv`, make it again. |
| Python is 3.9 or older | Graphify needs ≥ 3.10. Upgrade before class. |

Post the exact error text in the class thread — the wording is the diagnosis.

---

*The Brain That Runs a Company — Class 6. Orbix Automation Solutions.*
