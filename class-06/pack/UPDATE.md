# Class 6 pack — update

**This pack has been run start to finish on a clean Debian 13 machine, and three things
in the previous version were broken by a new release of graphify. All three are fixed
here.**

Translations of this page are in [`i18n/`](i18n/). English is the original; where a
translation and the English disagree, the English is right.

[Español](i18n/UPDATE.es.md) · [Português](i18n/UPDATE.pt.md) · [Italiano](i18n/UPDATE.it.md) · [हिन्दी](i18n/UPDATE.hi.md) · [اردو](i18n/UPDATE.ur.md) · [ไทย](i18n/UPDATE.th.md)

---

## The fastest way to install this

You do not have to read the pack first. Hand the zip to Claude Code and let it do the
work, including fixing whatever breaks on your machine.

Put the zip in a folder, open Claude Code in that folder, and paste this:

```text
Read class-06-graph-pack.zip in this folder. Unzip it, read every file in it, and then
install it on this machine following PREWORK.md and prompts/P1-install.md.

Rules:
- Explain each step before you run it, and stop rather than guess.
- Never tell me a step passed unless you saw its output say so.
- This tool READS my documents. Do not modify my database, my workflows or my containers.
- Pass --backend=claude-cli explicitly on anything that uses a model. The free path is
  never selected for me automatically.
- If something fails, read the error, check TROUBLESHOOT.md, and fix it. Tell me what
  you changed and why.
- Finish by running verify.sh and reading me its output.
```

That is the whole install. Claude Code reads the pack, hits the traps, and works through
them with you watching.

**If it gets stuck on the same thing twice, stop it** and post the exact command and the
exact error in the community. The wording of an error is the diagnosis.

---

## Verified on

| | |
|---|---|
| Operating system | **Debian 13 (trixie)**, x86-64, no GPU |
| Python | 3.13.5 |
| graphify | **0.9.62** (the previous pack was measured against 0.9.49) |
| Claude Code | 2.1.258, signed in |
| Run | P1 to P4, end to end, on a machine already running the Class 3 stack |

What it produced on that machine:

| | |
|---|---|
| Structural pass | 1.7 s · 69 nodes · 57 edges · 12 communities · **0 tokens** |
| Audit trail | **100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS** |
| Naming pass | 11.5 s · 58,301 in / 655 out · **$0.00** |
| Graph over HTTP | **200 in 2.3 ms**, from a different machine on the network |
| `verify.sh` | **12 passed · 0 failed** |

Your numbers will differ. Those are one corpus on one box, not a target.

---

## What changed, and why

### 1. The naming pass moved to its own command

graphify 0.9.62 no longer accepts `--backend` on `update`. Run the old command and you
get:

```text
error: unknown update option: --backend
```

`--no-label` moved too. The class now uses:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**The cost trap survived the rename.** `label` auto-detects a backend from your API keys
exactly as `update` used to, and `claude-cli` is still not in the detection list. If you
have an OpenRouter key exported as `OPENAI_API_KEY`, auto-detection finds it and takes the
paid path. Free and paid look identical on screen. Pass `--backend=claude-cli` every time.

Every prompt, slide and page in the pack now says `label`.

### 2. Installing graphify does not install the MCP server it installs

P4 registers your graph as an MCP server so the brain can query its own shape. On 0.9.62
that step died at `claude mcp list` with **"Failed to connect"** and no other clue.

The cause: `pip install graphifyy` puts the `graphify-mcp` executable on your PATH
**without the library it imports to serve**. So `which graphify-mcp` finds it. Worse:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

It prints usage because the argument parser runs before the import does. It is a check
that cannot fail, which means it is not a check — the same lesson this class has now
taught three times, and this time it was our own script.

The fix is one line, and it is in P4:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` now imports the module with the venv's own interpreter instead of trusting
`--help`.

### 3. The graph rendered as a blank page while the server returned 200

This is the serious one, and it is the reason this update exists.

graphify 0.9.62 writes an **`integrity` hash** onto the script tag that loads the
visualisation library from a CDN. `vendor-vis.sh` repointed the `src` at your local copy
and left that hash behind. The hash belongs to a different build of the library, so the
browser refused to run the file it had just downloaded, and the page drew nothing.

Every check the class taught you still passed:

| Check | Said |
|---|---|
| `grep -o 'src="..."'` | one local path, no URLs |
| `ls -l vis-network.min.js` | 652,000 bytes |
| `head -c 100 vis-network.min.js` | JavaScript, not an error page |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

The only evidence anywhere was one line in the browser console: `vis is not defined`.

`vendor-vis.sh` now hashes the file it actually downloaded, writes that hash, drops
`crossorigin`, and **refuses to finish** if a hash it did not write survives. It was
tested afterwards in a real browser: the nodes are on the canvas, and the page makes
**two network requests, both to your own machine** — which is the offline claim tested
rather than asserted.

**If you already built a graph with the old script, re-run the new `vendor-vis.sh`.**
Your page may be blank for this reason and nothing will have told you.

---

## Also worth knowing

`TROUBLESHOOT.md` has three new entries: the `unknown update option` error, the
`Failed to connect` on MCP, and the blank page that returns 200.

**Re-run `vendor-vis.sh` after every `graphify update`.** Rebuilding the graph rewrites
the page and the CDN link comes back. Your offline page quietly becomes an online page,
and you find out somewhere without internet, which is exactly when you wanted it.

The graph is a **snapshot**. It does not update when you add a document. A stale graph
does not error — it answers, confidently, about documents you have since changed.

---

## Attribution, unchanged

graphify is **Apache-2.0**, from `Graphify-Labs/graphify`, and attribution is a condition
of that licence rather than a courtesy. It ships in `ATTRIBUTION.md`. Read it. The class
teaches that your brain should be navigable; graphify is one implementation of that, not
the subject.

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Created by Hector Diaz, founder of
Orbix Automation Solutions.*
