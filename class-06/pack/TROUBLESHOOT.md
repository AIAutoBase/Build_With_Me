# Class 6 — when it goes wrong

Every error we actually hit, and what it means. Ordered by how much it costs you.

---

# 1. The one that costs money, silently

## **You must pass `--backend=claude-cli` on every command that uses a model.**

Graphify picks a backend automatically by trying these, in order:

```
gemini → kimi → claude → openai → deepseek → azure → bedrock → ollama
```

**`claude-cli` is not in that list.** It is never selected for you.

You have an OpenRouter key from Class 1. If it is exported as `OPENAI_API_KEY`,
auto-detection reaches `openai`, finds it, and takes the paid path.

### Why you will not notice

| | Free path (`claude-cli`) | Auto-detected paid path |
|---|---|---|
| Output | identical | identical |
| Time to name 15 communities | ~10 s | ~10 s |
| Community names | good | good |
| On-screen difference | **none** | **none** |
| Your invoice | `$0.00` | billed |

There is no error, no warning, and no visible difference. The only place it shows up is
your billing page.

### Do this

Always:

```bash
graphify update . --backend=claude-cli
```

Check what is exported before you start:

```bash
env | grep -E "OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY" || echo "none set - good"
```

Prove the free path really needs no credentials by stripping them for one run:

```bash
env -u OPENAI_API_KEY -u ANTHROPIC_API_KEY -u GEMINI_API_KEY \
  graphify update . --backend=claude-cli
```

If that works, the "no credentials" claim is tested rather than assumed. That is the whole
difference between knowing and hoping.

---

# 2. The one that fails quietly and looks fine

## Communities named `Community 1`, `Community 2`, `Community 3`…

**This is a failure, and it does not error.**

Graphify's naming pass degrades gracefully — when it cannot reach a model it fills in
placeholder names instead of stopping. You get a complete, well-formed graph with a
picture that renders beautifully and tells you nothing.

| Cause | Fix |
|---|---|
| The naming pass never ran | You ran `graphify update` without a backend flag and nothing was detected |
| The backend was reachable but not working | Check `claude -p "say ok"` answers |
| The corpus is too thin to characterise | 626 words gives thin names. Feed it more documents |

**Good names use your vocabulary** — your clients, your projects, your document names.
Generic names mean it never really looked.

> Same shape as Class 3's green execution storing base64, and Class 4's audio file of the
> right size full of static. **The dangerous failures are the ones that produce a
> plausible artifact.**

---

# 3. Install problems

## `error: externally-managed-environment`

Debian 13 refusing a system-wide `pip install`. **Correct behaviour**, PEP 668. The marker:

```bash
ls /usr/lib/python3.13/EXTERNALLY-MANAGED
```

Use the venv. **Do not use `--break-system-packages`** — the flag is named honestly.

## `python3 -c "import venv"` prints ok, but making a venv fails

The famous one. `venv` imports fine while **`ensurepip` is missing**, and `ensurepip` is
what puts `pip` inside the new environment. Importing `venv` never touches it.

**Probe for real:**

```bash
python3 -m venv /tmp/probe && echo "VENV WORKS" && rm -rf /tmp/probe
```

Fix:

```bash
sudo apt update && sudo apt install -y python3-venv
```

> **A check that cannot fail is not a check.** Ask what your check would print if the
> thing were broken. If the answer is "the same thing", you do not have a check.

## `command not found: graphify`

New terminal, venv not activated:

```bash
source ~/brain/.graphify-venv/bin/activate
```

This is the most common "it was working yesterday" on this whole pack.

## `pip install graphify` — not found

The **package** is `graphifyy`, two y's. The **command** is `graphify`, one. Not a typo.

## `No module named pip` inside the venv

Same missing `ensurepip`. Delete the venv, install `python3-venv`, make it again.

---

# 4. Graph problems

## Very few nodes

It found fewer documents than you think. Check the folder you pointed it at, and remember
it wants **whole documents** — not the ~180-word chunks in your Postgres `kb` table.

## A high INFERRED percentage

Not automatically wrong, but know before you trust the picture. **EXTRACTED** is in your
documents; **INFERRED** the tool worked out; **AMBIGUOUS** it is unsure.

The class corpus reported **100% EXTRACTED**. If yours is very different, ask why before
you act on the graph.

## The graph does not include something you added yesterday

**It is a snapshot.** It does not update on its own. Re-run `graphify update`, then re-run
`vendor-vis.sh`.

**A stale graph does not error. It answers.** Confidently, about a corpus you no longer
have.

---

# 5. Serving problems

## Blank page where the graph should be

The vendored JavaScript did not load. Open the browser console — a 404 on
`vis-network.min.js` is the usual cause.

## `vis-network.min.js` is about 1 KB

You saved an **error page**, not a library:

```bash
head -c 100 vis-network.min.js
```

If it starts with `<!DOCTYPE html>` it is HTML. In a directory listing that failure looks
exactly like success.

## It renders on the box but not from your laptop

The dashboard is bound to `localhost`. Check the port binding in your compose file.

## It worked, then broke after you rebuilt the graph

**`graphify update` rewrites `graph.html` and puts the CDN link back.**

Re-run `vendor-vis.sh` after every rebuild. Verify:

```bash
grep -o 'src="[^"]*"' graph.html
```

Every result must be a local path.

---

# 6. MCP problems

## `graphify-mcp: not found`

The venv is not on `PATH` for processes that did not activate it. Register with the **full
path**:

```bash
which graphify-mcp        # inside the activated venv
```

## `/mcp` does not list graphify

Check what was actually registered:

```bash
claude mcp list
```

Usually the wrong scope or a relative path.

## It answers questions about your graph without calling the tool

**It made the answer up.** Ask again and require the tool call:

> "Using the graphify MCP, list my communities. Call the tool — do not answer from memory."

If it will not call the tool, it is not connected, regardless of what `/mcp` says.

---

# 7. Obsidian

## You cannot install Obsidian on the brain

It is an Electron **desktop** app; your brain is a headless server. There is no desktop
to install it into.

Obsidian goes on **your laptop**, and the vault gets there via Syncthing, a share, or git.
See `docs/UPGRADE-obsidian.md`. The served HTML is the default for this reason.

---

## Posting for help

Post the **exact error text**, not a description. The wording is the diagnosis.

Include: what you ran, the full error, `graphify --version`, and whether your venv was
activated.

**Graphify bugs go upstream** to `Graphify-Labs/graphify` — see `ATTRIBUTION.md`. Class
questions come to us.
