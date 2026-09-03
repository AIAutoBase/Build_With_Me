# Build With Me — AI Automations by Hector

**The Brain That Runs a Company**, one class at a time. This repo is the student-facing
front door for every class in the series: the show notes, the one-line install, the pack
zip with its checksum, and every file of the pack readable without downloading.

Served with GitHub Pages at **https://aiautobase.github.io/Build_With_Me/**

## The classes

| Class | What it adds | Front door | Pack files |
|---|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | taught live, Aug 12 · no front door | — |
| 2 · Give It Senses | n8n and Postgres, the email classifier | taught live, Aug 19 · no front door | — |
| 3 · Ask Your Brain | Memory it can search, by meaning | [class-03/](https://aiautobase.github.io/Build_With_Me/class-03/) | [pack](class-03/pack/) · [addendum](class-03/addendum/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04/](https://aiautobase.github.io/Build_With_Me/class-04/) | [pack](class-04/pack/) |
| 5 · Hands and a Clock | The 7am digest, and draft-don't-send | [class-05/](https://aiautobase.github.io/Build_With_Me/class-05/) | [pack](class-05/pack/) |
| 6 · The Graph | What connects to what, from everything you fed it | [class-06/](https://aiautobase.github.io/Build_With_Me/class-06/) | [pack](class-06/pack/) |
| 7 · A Clock It Can Read | Your real calendar, both directions | [class-07/](https://aiautobase.github.io/Build_With_Me/class-07/) | [pack](class-07/pack/) |
| 8 · Make It a Project | History, versions, and a README | [class-08/](https://aiautobase.github.io/Build_With_Me/class-08/) | [pack](class-08/pack/) |
| — · Content Mate | The public voice — optional, classroom section | [content-mate/](https://aiautobase.github.io/Build_With_Me/content-mate/) | [pack](content-mate/pack/) |

Every class folder has the same shape:

| File | What it is |
|---|---|
| `index.html` | **The show notes.** Recap of the classes before it, the install, the run of the hour, what breaks |
| `install.txt` | What the one command fetches — the prompt Claude Code follows |
| `setup-gate.html` | The pre-class checks, where a class has them |
| `downloads/` | The pack zip and `SHA256SUMS` |
| `pack/` | The pack unzipped, so every file is readable here |

## The one command

Each class page carries its own. The shape is always the same — fetch the prompt **to a
file**, then hand it to Claude Code:

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-05/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/class-05/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

It is never piped into `claude` directly: Windows caps a command line at 8,191 characters
and these prompts are longer than that.

## Checksums

Every zip ships next to a `SHA256SUMS`. Verify before you unzip:

```bash
cd downloads && sha256sum -c SHA256SUMS
```

## Where the classes happen

Live, in the **Build With Me** classroom of
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106) on Skool.
Each lesson there points back to its folder here.

## License

MIT — see [LICENSE](LICENSE).

*AI Auto Base · Orbix Automation Solutions · [getorbix.com](https://getorbix.com)*
