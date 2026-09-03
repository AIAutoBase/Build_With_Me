# Class 6 — does it actually work?

Five levels. Each one ends somewhere you can see, and the last one is the only one that
proves the graph is really *yours*.

```bash
bash verify.sh
```

That covers levels 0 and 1 automatically. The rest need your eyes.

---

## What a green check is worth

Nothing, on its own.

Class 3 had a workflow report `"status": "success"` while storing base64 as text and
merging four documents into one row. Class 4 produced audio files of exactly the right
size and duration that contained static.

**This class has its own version of that, and it is worse than both**, because the output
is a picture and pictures are persuasive:

> A graph built with a broken naming pass renders perfectly. The layout is beautiful. The
> clusters are real. And every community is called `Community 1`, `Community 2`, and it
> tells you nothing at all.

So every level below asks *what would this look like if it were broken?* — and checks
that instead.

---

## Level 0 — the parts are there

```bash
bash verify.sh
```

- [ ] Python 3.10 or newer
- [ ] **The venv probe passed** — a real `python3 -m venv`, not `import venv`
- [ ] `graphify --version` prints something
- [ ] `claude -p` answers, so the naming backend exists
- [ ] You have been told whether `OPENAI_API_KEY` is exported

**If the last one warned you, read it.** It is the difference between `$0.00` and a bill.

---

## Level 1 — the structural pass ran, and cost nothing

```bash
graphify update <your documents>
```

- [ ] It reported nodes, edges and communities
- [ ] **Tokens used: zero**

Reference, from the class corpus: **1 second · 119 nodes · 110 edges · 15 communities · 0
tokens.**

> The zero is the interesting number. The shape of your knowledge — what connects to what,
> which clusters exist — is **computed, not generated.** No model is asked anything at this
> point. Most of what looks like AI in a graph tool is arithmetic.

**If nodes are in single digits**, it found almost no documents. Check the folder. It wants
whole documents, not the ~180-word chunks in your Postgres `kb` table.

---

## Level 2 — read the audit trail before you look at the picture

Find graphify's provenance report.

- [ ] You have an EXTRACTED / INFERRED / AMBIGUOUS breakdown
- [ ] You read it **before** opening the visualisation

| | Means |
|---|---|
| **EXTRACTED** | It is literally in your documents |
| **INFERRED** | The tool worked it out |
| **AMBIGUOUS** | It is not sure |

Class corpus: **100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS.**

A high INFERRED percentage is not automatically wrong — but you want to know before you
make a decision off the picture.

> This is Class 3's refusal lesson wearing different clothes. A memory that says *"I don't
> know"* beats one that guesses; **a graph that cannot tell you which edges are real is
> decoration.**

---

## Level 3 — the names are yours, not placeholders

Read the community names out loud.

- [ ] They use **your** vocabulary — your clients, your projects, your document names
- [ ] Not one of them is called `Community 1` or `Document Cluster` or `Miscellaneous`

**This is the level people skip and it is the one that fails silently.**

Generic names mean the naming pass did not really run. It degrades gracefully instead of
erroring, so you get a complete, beautiful, useless graph.

Then confirm which backend actually ran:

- [ ] It was `claude-cli`, and it cost `$0.00`
- [ ] Not an auto-detected paid path

Reference: about **10 seconds**, roughly **36,700 input tokens** of your existing Claude
plan.

---

## Level 4 — it is on your dashboard, and it works with the internet unplugged

- [ ] `graph.html` opens from your dashboard's **Graph** tab
- [ ] It renders — nodes visible, not a blank page

Then the part that makes it yours:

```bash
grep -o 'src="[^"]*"' graph.html
```

- [ ] **Every result is a local path.** Not one `https://`

```bash
ls -l vis-network.min.js
head -c 100 vis-network.min.js
```

- [ ] About **700 KB**, and it does **not** start with `<!DOCTYPE html>`

> A 1 KB file called `vis-network.min.js` is a 404 page saved to disk. In `ls -l` that
> looks exactly like success.

- [ ] It loads from **another device on your network**, not just localhost

---

## The check that actually proves it is your graph

Everything above can pass on a graph built from the wrong folder.

**Open the graph and find a document only you would have.**

- [ ] You can see a specific file of yours in it — by name
- [ ] Click it, and the things it connects to are things that genuinely relate to it
- [ ] At least one connection **surprises you**

That last one is the whole reason this class exists. If nothing surprises you, either
your corpus is too thin, or you already knew your own filing system perfectly, and one of
those is much more likely than the other.

Then the negative test:

- [ ] Ask it about a document you have **not** ingested. It is not in the graph.

---

## Level 5 — your brain can query its own shape

Only if you did P4.

- [ ] `/mcp` in Claude Code lists graphify as connected
- [ ] You asked something **only the graph could answer**, and it **called the tool**
- [ ] The answer matches what you can see in the picture

Try:

> "Using the graphify MCP, what in my graph connects to nothing else? Call the tool — do
> not answer from memory."

- [ ] It called the tool rather than inventing a plausible answer

**If it answered without calling the tool, it made it up.** A confident answer is not
evidence of a connection.

---

## Reference numbers

Measured 2026-08-25 on the teaching box — Debian 13, 4 cores, 3.7 GB RAM, no GPU.

| | |
|---|---|
| Install | 28 s · 196 MB venv · ~50 MB RAM at rest |
| Structural pass | 1 s · 119 nodes · 110 edges · 15 communities · **0 tokens** |
| Audit trail | 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS |
| Naming via `claude-cli` | 10 s · **no credentials** · $0.00 · ~36,700 input tokens of quota |
| Naming via OpenRouter | 10 s · ~$0.002 |
| `graph.html` over HTTP | **200 in 3 ms**, LAN included |
| Vendored `vis-network` | 687 KB |

Your numbers will differ with your corpus. **The zero should not.**

---

## What this does not verify

- **That the graph is a good picture of your business.** Only you can judge that, and it
  is the point of the hour.
- **That it stays true.** The graph is a **snapshot**. Add a document and it does not know
  until you rebuild — and a stale graph does not error, it answers.
- **Anything about Class 3's correctness.** This draws what is there. If Class 3 ingested
  garbage, you get an accurate graph of garbage.
