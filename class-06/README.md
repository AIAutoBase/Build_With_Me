# Class 6 — See What Your Brain Knows

**The Brain That Runs a Company, Part 6.** Everything you fed your brain becomes a
graph you can look at — with an honest report of which lines in that picture are real.

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-06/**
>
> That page is the show notes. It recaps Classes 1–5, carries the one-line install, and is
> what you follow along with during the hour.

Wednesday 16 September 2026, 11:00 AM ET · Skool live room ·
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106)

---

## The one command

Run it **on the machine your brain runs on** — the one with Docker and n8n, not
necessarily the laptop in front of you.

**macOS / Linux / WSL**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-06/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/class-06/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

It downloads the pack, verifies the checksum, and proves your Python can actually make a
virtual environment — using a probe that **can fail**, which the obvious check cannot.

### Why it fetches a file instead of pasting the prompt inline

The prompt is 8,207 characters and `cmd.exe` caps a command line at 8,191. The inline form
works on Mac and Linux and truncates silently on Windows.

---

## No new signup. Not even the free kind.

| Piece | Cost |
|---|---|
| Graphify | Free, Apache-2.0 |
| The structural pass — nodes, edges, communities | **Zero tokens.** No model involved |
| Naming the communities via `claude-cli` | **$0.00** — your existing Claude Code plan |
| Disk | 196 MB for the venv |
| RAM at rest | ~50 MB |

**Class 1 pays off again here.** The Claude Code you installed in the very first hour of
the series is the engine that names the graph in the last one.

---

## This class reads. It does not write.

Nothing here touches your `kb` table, your workflows, or your containers. Delete the graph
and you are exactly where you started.

It also means: **if your brain is broken, this will not fix it — and it will show you that
it is broken**, which is a genuinely useful thing for a tool to do.

---

## What is here

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **The show notes.** Classes 1–5 recap, the install, the four prompts, the traps, the audit trail |
| [`install.txt`](install.txt) | What the one command fetches |
| [`setup-gate.html`](setup-gate.html) | Python, the venv probe, and the backend flag that costs money |
| [`downloads/`](downloads/) | The pack zip and `SHA256SUMS` |
| [`pack/`](pack/) | The pack unzipped — every file readable here without downloading |

Both HTML pages work standalone from `file://`, make **no network requests at all**, and
reference no external resources.

---

## What you need before this class

| | How to check |
|---|---|
| **Python 3.10+** | `python3 --version` |
| **A venv that really works** | `python3 -m venv /tmp/probe` — **not** `python3 -c "import venv"` |
| **Claude Code signed in** | `claude -p "say ok"` answers |
| **Class 3 working, with real documents** | Your dashboard's Ask tab answers a question about your own files |
| **Shell access to the brain machine** | Not just the dashboard |

New to the series? Start at **[Class 3](https://aiautobase.github.io/Build_With_Me/class-03/)** —
it covers a machine with nothing installed at all.

---

## Two traps worth knowing before you start

### The check that passes while it is broken

```bash
python3 -c "import venv" && echo ok     # prints ok on a box where venv creation FAILS
```

`venv` the module is present; **`ensurepip`** is not, and that is what puts `pip` inside
the new environment. Importing `venv` never touches it.

```bash
python3 -m venv /tmp/probe && echo "VENV WORKS" && rm -rf /tmp/probe
```

**A check that cannot fail is not a check.** Ask what yours would print if the thing were
broken. If the answer is "the same thing", you have a feeling, not a check.

### The flag that costs money if you forget it

Graphify auto-detects a backend by trying `gemini → kimi → claude → openai → deepseek →
azure → bedrock → ollama`.

**`claude-cli` is not in that list** and is never selected for you. If your OpenRouter key
from Class 1 is exported as `OPENAI_API_KEY`, auto-detection finds it and silently takes
the paid path.

```bash
graphify update . --backend=claude-cli    # every time
```

Free and paid produce identical output, identical timing and identical names. The only
place the difference appears is your invoice.

---

## Checksums

```bash
cd downloads && sha256sum -c SHA256SUMS
```

| File | SHA-256 |
|---|---|
| `class-06-graph-pack.zip` | `12e06b4900b230905b83ab09c2d599ea264a689f63faa12e3ae76c9a01cd8a3e` |

32,532 bytes · 12 files. This pack pins its zip timestamps, so the same sources always
produce the same hash — a mismatch means the sources moved, not that the clock did.

---

## Attribution

The tool this class installs is **Graphify** by **Graphify-Labs**, PyPI package
`graphifyy`, licensed **Apache-2.0**.

That licence is what makes this pack legal to distribute, and **attribution is a condition
of it, not a courtesy.** `ATTRIBUTION.md` ships inside the pack and the build script
**refuses to build without it**.

**Graphify bugs go upstream** to `Graphify-Labs/graphify`. Class questions — the venv, the
dashboard, the MCP, the audit trail — come to us.

The idea, *"your brain should be navigable"*, is not owned by anyone. Graphify is one
implementation. **Learn the idea, credit the tool.**

---

## The series

| Class | What it adds | Where |
|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | Aug 12 |
| 2 · Give It Senses | n8n and Postgres | Aug 19 |
| 3 · Ask Your Brain | Memory it can search | [class-03](https://aiautobase.github.io/Build_With_Me/class-03/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04](https://aiautobase.github.io/Build_With_Me/class-04/) |
| 5 · Hands and a Clock | The 7am digest, draft-don't-send | [class-05](https://aiautobase.github.io/Build_With_Me/class-05/) |
| **6 · The Graph** | **What connects to what** | **here** |
| 7 · A Clock It Can Read | Your real calendar, both directions | [class-07](https://aiautobase.github.io/Build_With_Me/class-07/) |
| **8 · Make It a Project** | History, versions, and a README | [class-08](https://aiautobase.github.io/Build_With_Me/class-08/) |
| — · Content Mate | The public voice — optional, in the classroom | [content-mate](https://aiautobase.github.io/Build_With_Me/content-mate/) |

---

## License

Class material MIT — see [LICENSE](LICENSE). Graphify itself is Apache-2.0 and belongs to
Graphify-Labs; see `ATTRIBUTION.md` in the pack.

*Orbix Automation Solutions · [getorbix.com](https://getorbix.com)*
