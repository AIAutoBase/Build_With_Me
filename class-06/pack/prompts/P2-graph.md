# P2 — Build the graph, and read its audit trail

**Paste this whole file into Claude Code**, on the machine your brain runs on, with the
venv activated.

**You end with:** a `graph.json`, a report saying where every claim came from, and
community names that are actually about your business.

---

```text
Build a knowledge graph from my documents using graphify, and then help me read the
audit report BEFORE we look at any picture.

## Step 1 - Point it at the right documents

Find where my documents actually live. Likely candidates on this machine:

  - the docs folder from the Class 3 pack (docs-pack/ or similar)
  - anything I have dropped into the brain's document folder since
  - the Obsidian vault, if I have one

Do NOT go straight to the Postgres `kb` table. The chunks in there are cut into ~180-word
pieces for retrieval; graphify wants whole documents. If the only copy of a document is
in the database, tell me and we will decide together.

Tell me what you found and how many documents there are, and wait for me to confirm the
set before you run anything.

## Step 2 - The structural pass, and pay attention to what it costs

Run:

  graphify update <the folder>

Report exactly:
  - how long it took
  - nodes, edges, communities
  - tokens used

For reference, the class corpus gave: 1 second, 119 nodes, 110 edges, 15 communities,
ZERO tokens.

Then explain to me why the token count is zero. I want to understand that the shape of
the graph - what connects to what, and which clusters exist - is computed, not generated.
No model has been asked anything at this point.

That matters to me because it tells me which part of this tool is arithmetic and which
part is AI. Say which is which.

## Step 3 - Read the audit report FIRST

Before showing me any visualisation, find and read me graphify's provenance/audit
report - the breakdown of EXTRACTED versus INFERRED versus AMBIGUOUS.

The class corpus reported: 100% EXTRACTED, 0% INFERRED, 0% AMBIGUOUS.

Explain each of the three to me in one line:
  EXTRACTED  - it is literally in my documents
  INFERRED   - the tool worked it out
  AMBIGUOUS  - it is not sure

Then tell me my numbers, and whether anything in my graph is inferred rather than
extracted. If some of it is inferred, that is not automatically bad - but I want to know
which parts before I trust the picture.

Say plainly why we read this before looking at the graph: a picture is persuasive whether
or not it is true, and once I have seen it I will believe it.

## Step 4 - Name the communities, on the free path

Now the only step that uses a model - giving the clusters human names.

Run it with the backend named EXPLICITLY:

  graphify update <the folder> --backend=claude-cli

Do not leave the backend to auto-detection. claude-cli is not in graphify's detection
list and will never be chosen for me, and if OPENAI_API_KEY is exported it will silently
take a paid path that looks exactly the same.

Expect about 10 seconds and roughly 36,700 input tokens of my existing Claude plan -
$0.00 in actual money.

Afterwards, confirm which backend actually ran, and show me the evidence rather than
assuming.

## Step 5 - Judge the names, do not just accept them

Read me the community names it produced.

Then tell me honestly whether they are good. Good means they use MY vocabulary - the
names of my documents, my clients, my projects. Bad means generic filler like
"Community 1", "Document Cluster", "Miscellaneous".

If they are generic, something went wrong and it went wrong QUIETLY. Likely causes:
  - the naming pass did not run at all
  - it ran with no working backend and degraded to placeholders
  - the corpus is too small to characterise

Do not tell me it worked if the names are generic. That is the failure mode of this
whole step and it produces a graph that looks completely fine.

## Step 6 - Look at what it found

Now show me:
  - the biggest communities, and what is in them
  - the hub nodes - whatever the most connected documents are
  - anything ISOLATED, connected to nothing

Then ask me the question that makes this worth an hour:

  "Does this match what you thought was in there?"

The isolated nodes and the surprising hubs are the interesting part. A document nothing
connects to is either genuinely standalone or filed wrong, and only I know which.

## Step 7 - Where things are

Tell me:
  - the path to graph.json and how big it is
  - the path to graph.html
  - that nothing in my database or workflows was touched
  - that P3 makes graph.html work without the internet and puts it on my dashboard

## Ground rules

- Never claim something worked without output showing it worked.
- Read the audit report before showing me any visualisation.
- Always pass --backend=claude-cli explicitly on anything that uses a model.
- Do not modify my documents. This tool reads them.
- Generic community names are a FAILURE, not a result. Say so.
```

---

## The two things this prompt is really teaching

**Zero tokens for the structure.** The nodes, the edges and the clusters are arithmetic.
The model only writes labels. Most of what looks like AI in a graph tool is not.

**The audit trail before the picture.** A graph that cannot tell you which edges came from
your documents and which it made up is decoration. This is Class 3's refusal lesson,
applied to something that looks convincing.

## If it goes wrong

| What you see | What it means |
|---|---|
| `Community 1`, `Community 2`, … | The naming pass did not really run. **It degrades quietly rather than erroring.** See `TROUBLESHOOT.md`. |
| Very few nodes | It probably found only a handful of documents. Check what folder you pointed it at. |
| High INFERRED percentage | The tool is guessing at connections. Worth knowing before you rely on the picture. |
| It ran but cost money | You did not pass `--backend=claude-cli`, and `OPENAI_API_KEY` was exported. |
