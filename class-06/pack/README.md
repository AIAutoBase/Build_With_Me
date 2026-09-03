# See What Your Brain Knows — Class 6 pack

This is the download for **AI Auto Base Class 6** of *The Brain That Runs a Company*.

Everything you fed your brain in Classes 3 to 5 becomes a graph you can look at — the
communities it forms on its own, the hub documents everything else hangs off, and an
honest audit trail of what was **extracted** from your documents versus what was
**inferred**.

---

## 1. What this actually does

```text
your documents ──▶ graphify ──▶ graph.json ──▶ graphify-mcp ──▶ your brain queries its own graph
                       │
                       └──▶ graph.html ──▶ your dashboard ──▶ a "Graph" tab
```

**It reads. It does not write.** Nothing in this class changes your `kb` table, your
workflows, or anything else you built. If you delete the graph you are back exactly where
you started.

That also means: **if your brain is broken, this will not fix it — and it will show you
that it is broken**, which is a genuinely useful thing for a tool to do.

---

## 2. The idea, not the tool

**Your brain should be navigable.**

You can ask it a question and it answers — that is Class 3. But you cannot *see* what it
knows, which means you cannot see what it is missing, what is isolated, or what turns out
to sit at the centre of everything.

Graphify is one implementation of that idea. It is a good one and it is free. **It is not
the point.** If it disappears tomorrow, the idea survives and something else implements
it. Learn the idea.

---

## 3. What you need first

**The starter pack**, done — Node, Claude Code, Docker, n8n, Postgres. Run its
`verify.sh`.

**Class 3 working**, with documents in it. This class draws a graph of what your brain
knows; a brain that knows nothing draws an empty graph and teaches you nothing.

**Claude Code, signed in.** This is the engine that names the graph, and it is the one
you installed in the very first hour of the series. **No new key, no card, `$0.00`.**

**`PREWORK.md`, done before the hour.** About fifteen minutes. It has four traps in it,
and one of them is a check that passes while the thing it checks is broken.

---

## 4. What is in here

| File | What it is |
|---|---|
| `PREWORK.md` | **Start here.** Python, the venv, and the four traps |
| `prompts/P1-install.md` | Install graphify in a venv. Ends with `graphify --version` |
| `prompts/P2-graph.md` | Build the graph and read its audit trail. Ends with a `graph.json` |
| `prompts/P3-serve.md` | Vendor the JavaScript, serve it from your dashboard. Ends with a **Graph** tab |
| `prompts/P4-mcp.md` | Register the graph as an MCP server. Ends with **your brain answering questions about its own shape** |
| `VERIFY.md` | The acceptance test, including the one that proves the graph is really yours |
| `verify.sh` | One command. Prints **Ready**, or names exactly what is missing |
| `TROUBLESHOOT.md` | Every error we hit, and the one that costs money silently |
| `ATTRIBUTION.md` | Graphify's licence and required credit. **Read it — this is not boilerplate** |
| `docs/UPGRADE-obsidian.md` | The graph in Obsidian on your laptop, instead of a web page |
| `vendor-vis.sh` | Makes `graph.html` work without the internet. One script, two steps |

---

## 5. The order that works

1. **`PREWORK.md`** — Python 3.10+, and a venv that actually works. Do the real probe it
   asks for; the obvious check passes while the thing is broken.
2. **P1** — install graphify into the venv.
3. **P2** — build the graph. Read the audit report before you look at the picture.
4. **P3** — vendor the JavaScript, then serve it. Your dashboard gets a Graph tab.
5. **P4** — register the MCP, then ask your brain what it knows about itself.
6. `bash verify.sh`, and paste the output in the class thread.

Each prompt ends somewhere you can see. If you stop after P2 you have a graph and an
audit report; that is already the interesting part.

---

## 6. The one that costs money if you skip it

**You must pass `--backend=claude-cli` explicitly. Every time.**

Graphify auto-detects a backend by trying, in order:

```
gemini → kimi → claude → openai → deepseek → azure → bedrock → ollama
```

**`claude-cli` is not in that list.** It is never chosen for you.

You have an OpenRouter key from Class 1. If it is exported as `OPENAI_API_KEY`,
auto-detection finds it, silently takes the paid path, and starts billing.

**Free and paid look identical on screen.** Same output, same timing, same community
names. The only difference is your invoice.

`TROUBLESHOOT.md` has this in bold with the command to check which backend actually ran.

---

## 7. What it costs

| Piece | Cost |
|---|---|
| Graphify | Free, Apache-2.0 |
| The structural pass — nodes, edges, communities | **Zero tokens.** No model is involved at all |
| Naming the communities, via `claude-cli` | **$0.00** — your existing Claude Code plan, ~36,700 input tokens of quota |
| Naming via OpenRouter, if you choose it | about $0.002 |
| Disk | 196 MB for the venv |
| RAM at rest | about 50 MB |

**No new signup.** Not even the free kind this time.

### The measurement worth understanding

The structural pass — 119 nodes, 110 edges, 15 communities — took **one second and zero
tokens.** No model was asked anything.

The model is only used to give the communities *names*. Everything about the shape of your
knowledge was computed, not generated.

That is a good thing to know about tools like this in general: most of what looks like AI
in a graph tool is arithmetic, and the AI part is a labelling convenience.

---

## 8. The audit trail is the reason this is in the series

Graphify reports where every claim in the graph came from:

```
100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
```

**EXTRACTED** means it is in your documents. **INFERRED** means the tool worked it out.
**AMBIGUOUS** means it is not sure.

Class 3 taught you that a memory which says *"I don't know"* is worth more than one that
guesses. This is that lesson applied to a picture. A graph that cannot tell you which
edges are real is decoration.

**Read the report before you look at the picture.** Pictures are persuasive and that is
the problem with them.

---

## 9. Attribution is required, and this is the class about portability

Graphify is **Apache-2.0** (`Graphify-Labs/graphify`). That licence is what makes this
pack legal to hand you, and it requires attribution. `ATTRIBUTION.md` carries it, and it
travels with anything you build on this.

Six classes of *your stack, on your machine* would be a poor thing to end by quietly
stripping someone's credit off their work.

---

## 10. When it goes wrong

`TROUBLESHOOT.md` has all of it. The two that catch nearly everyone:

| What you see | What it means |
|---|---|
| `error: externally-managed-environment` | Debian will not let you `pip install` system-wide. Use the venv. This is correct behaviour, not a broken box. |
| Communities named `Community 1`, `Community 2`… | The naming pass did not run, or ran without a working backend. **It degrades quietly instead of erroring** — you get a graph that looks fine and tells you nothing. |

Post the **exact error text** in the class thread. The wording is the diagnosis.

---

*The Brain That Runs a Company — Class 6. Orbix Automation Solutions.*
*Graphify is © Graphify-Labs, Apache-2.0. See `ATTRIBUTION.md`.*
