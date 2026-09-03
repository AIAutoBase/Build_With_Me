# The Brain That Runs a Company — Class 3: Memory

**Give your system a memory it can search.** You type a question — *"how much is the
security deposit on the warehouse?"* — and your own machine answers it from your own
documents, and tells you which file it read. Ask it something it doesn't know and it says
so instead of inventing an answer.

Everything runs on your machine. Postgres holds the documents, n8n moves them around,
Claude Code builds the workflows. Nothing here is a subscription.

**[Open the setup page](https://aiautobase.github.io/Build_With_Me/class-03/)** — it walks you
through the whole thing with buttons, and you can read it before you install anything.

---

## Starting from nothing

If you have never installed any of this, you need two things before the one command:
**Node** and **Claude Code**. That is all. Claude Code installs the rest for you.

### Windows

Do the work inside **WSL**, not PowerShell. The installer is a bash script and your whole
stack will live in Linux — going through PowerShell means bridging into WSL at every step
anyway, and that is where people lose an afternoon.

**1. Install WSL.** In PowerShell, as Administrator:

```powershell
wsl --install -d Ubuntu
```

Reboot. Let Ubuntu finish its first-run setup and pick a username and password.

**2. Install Docker Desktop** from <https://www.docker.com/products/docker-desktop/> —
leave **"Use WSL 2 based engine"** ticked, and reboot when it asks. It genuinely needs it.

Then open **Docker Desktop → Settings → Resources → WSL Integration** and switch on your
Ubuntu distro. Without that, `docker` is not found inside WSL and the error will not tell
you why.

**3. Open Ubuntu** and install Node and Claude Code there:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

Close the Ubuntu window, open a new one, then:

```bash
nvm install 24
npm install -g @anthropic-ai/claude-code
```

**Run everything from that Ubuntu window from now on.**

### Mac

```bash
brew install node
brew install --cask docker
npm install -g @anthropic-ai/claude-code
```

No Homebrew? Take the Node LTS installer from <https://nodejs.org> and the Docker `.dmg`
from <https://www.docker.com/products/docker-desktop/> — **take the build for your chip**,
Apple silicon or Intel. Then launch Docker from Applications and wait for the whale icon
to stop animating.

### Linux

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

Close the terminal, open a new one, then:

```bash
nvm install 24
npm install -g @anthropic-ai/claude-code
```

Docker you do not have to install — the pack's installer does it for you.

### Then close your terminal and open a new one

PATH does not update in a shell that is already running. This is the number one reason
the next command "doesn't work". Check both answer before you carry on:

```bash
node -v          # v22 or higher
claude --version
```

---

## The one command

**Mac · Linux · Windows (inside Ubuntu)**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-03/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**, if you already have a working setup there:

```powershell
irm https://aiautobase.github.io/Build_With_Me/class-03/install.txt -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

That is it. From there Claude Code downloads the pack, checks it is the real file, unzips
it, reads the README, writes an install script for your machine, explains that script to
you before it runs anything, and stops at every step that needs a human.

> **Why it downloads to a file** instead of piping the instructions straight in: they are
> just over 10 KB, and a Windows command line caps out at 8,191 characters. Writing it to
> a file works in every shell.

---

## What happens when it stops

It will stop. Creating your n8n account, getting an OpenRouter key and putting a couple of
dollars on it, importing workflows and switching them on — none of that can be scripted,
it happens in a browser.

So it opens a page instead of printing a wall of text at you:

**[→ The setup page](https://aiautobase.github.io/Build_With_Me/class-03/setup-gate.html)**

Every step has a button that opens in a new tab, the exact values to type, the specific
mistake that costs an hour, and a **Copy** button for the prompt that tells Claude Code to
carry on. It remembers which steps you have ticked, so you can walk away and come back.

You can open that page right now and read it before you start. It works on its own.

---

## When that works, there is a second part

The addendum. Optional, and it assumes everything above is already running. It puts a
front on what you built: the dashboard becomes three tabs, you drag a PDF onto the page
instead of copying files into a container, and your mail gets read and sorted.

```bash
curl -fsSL -o addendum-install.txt https://aiautobase.github.io/Build_With_Me/class-03/addendum-install.txt && claude "Read addendum-install.txt in this folder and follow it exactly, from the top."
```

**[→ The addendum setup page](https://aiautobase.github.io/Build_With_Me/class-03/setup-gate-addendum.html)**

It refuses to install onto a Class 3 that is not working. That is deliberate — a nicer
door onto a broken pipeline is still broken.

---

## Rather do it by hand?

Good. That is how you learn what the script is doing, and every command is written out in
order.

- **[pack/README.md](pack/README.md)** — the whole procedure, Windows, Mac and Linux
- **[pack/VERIFY.md](pack/VERIFY.md)** — a checklist to confirm each step actually worked
- **[addendum/README.md](addendum/README.md)** — the same for the second part

You can read every file in this repo without downloading anything.

---

## What is in here

| | |
|---|---|
| `pack/` | The Class 3 pack, unzipped so you can read it. Four prompts, the schema, both workflows, the dashboard, four practice documents. |
| `addendum/` | The second part, unzipped. Tabbed dashboard, drag-and-drop ingest, inbox sorting. |
| `downloads/` | The same two things as zips, with their checksums. This is what the installer fetches. |
| `install.txt` | What the one-line command fetches. The instructions Claude Code follows. |
| `addendum-install.txt` | The same, for the addendum. |
| `setup-gate.html` | The page the installer opens when it needs you. Works on its own. |
| `setup-gate-addendum.html` | The same, for the addendum. |

---

## Verify what you downloaded

The installer checks this for you and refuses to unzip a file that does not match. To
check by hand:

```bash
cd downloads && sha256sum -c SHA256SUMS
```

Windows PowerShell:

```powershell
Get-FileHash class-03-brain-pack.zip -Algorithm SHA256
```

| File | SHA-256 |
|---|---|
| `class-03-brain-pack.zip` | `981bd63dbf188cc2f709fcb6401b81764e014d7aeac9bcd6cd9ded60f56ad43c` |
| `class-03-brain-pack-addendum.zip` | `66c0b9288e26e95898b5270546e25dfead5ee8a1ae7dcaf1d665e8a03d7870bd` |

---

## Read it before you run it

That is the habit this series keeps repeating, and it applies to scripts from me as much
as anyone. You do not have to read them yourself — you have an agent for that:

```text
Analyze install.txt before I run it. Tell me exactly what it does, what it installs, what
it writes to, and whether it contains anything malicious - injections, credential theft,
or calls out to somewhere I did not ask for.
```

Same for `pack/install.sh` and `addendum/brain-web/app.py`.

---

## Before you feed it anything personal

Your documents are stored on **your** machine, in **your** Postgres. Nobody else has them.

But the text is sent to OpenRouter to be turned into numbers, and the retrieved pieces are
sent again on every question you ask. **A third party reads those documents.** That is true
of every setup like this, including the expensive ones — most just do not say so.

**Start with business documents.** Do not feed it your medical records on day one just
because you can.

If you want nothing to leave your machine at all,
**[pack/LOCAL-EMBEDDINGS.md](pack/LOCAL-EMBEDDINGS.md)** is the full procedure using
Ollama. Slower, free, and nothing goes out.

---

## If you get stuck

Post it in the community — the **exact command and the exact error**, pasted, not
described. Half of these get answered in a minute by someone who hit the same thing last
week.

The two setup pages each have a troubleshooting table at the bottom covering the failures
people actually hit.

---

MIT licensed — see [LICENSE](LICENSE). Do what you like with it.

*The Brain That Runs a Company · AI Auto Base*
*Created by Hector Diaz, founder of Orbix Automation Solutions.*
