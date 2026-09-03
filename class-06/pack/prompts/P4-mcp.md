# P4 — Let your brain query its own graph

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** asking Claude Code a question about the *shape* of what you know — and
getting an answer out of your own graph rather than out of the model.

---

## What this is

Classes 1 to 5 gave your brain organs. This registers the graph as an **MCP server**, so
the brain can look at its own structure.

Class 3 let you ask *"what does my lease say?"* — a question about **content**.

This lets you ask *"what in here is connected to the lease?"* and *"what do I have that
connects to nothing?"* — questions about **shape**, which retrieval cannot answer, because
retrieval finds passages and has no idea what the corpus looks like from above.

---

```text
Register my graphify graph as an MCP server so I can query it from Claude Code.

## Step 1 - Find the server

graphify ships `graphify-mcp` as its own executable. Confirm it exists and find its full
path - it will be inside the venv:

  which graphify-mcp
  graphify-mcp --help

Show me what it says. If it is not there, stop and tell me; do not improvise a different
MCP server.

## Step 2 - Explain MCP to me in three lines

Before you configure anything, tell me in plain language:
  - what MCP is
  - what registering this one actually lets Claude Code do that it could not before
  - what it does NOT do

I want the third one especially. Be honest about the limits.

## Step 3 - Register it

Add it with the full path from Step 1, because the venv is not on PATH for processes that
did not activate it:

  claude mcp add graphify --scope user -- <full path to graphify-mcp> <path to my graph>

Use the real paths you found, not placeholders. Then confirm:

  claude mcp list

## Step 4 - Prove it is actually connected

In a Claude Code session, /mcp should list graphify as connected.

Then - and this is the part that matters - ask it something that ONLY my graph could
answer. Not something the model could plausibly invent. For example:

  "Using the graphify MCP, how many communities are in my graph and what are they
   called? Do not answer from memory - call the tool."

Show me the tool call and the response. If it answers without calling the tool, it made
it up, and you should say so rather than accepting a plausible answer.

## Step 5 - Ask it the questions that retrieval cannot answer

Now try the ones that make this worth doing. These are about SHAPE, not content:

  - "What in my graph connects to nothing else?"
  - "Which document is the most connected, and what connects to it?"
  - "Which two communities are furthest apart?"
  - "If I deleted <some document>, what would become isolated?"

Run at least two, show me the answers, and tell me which ones the graph could genuinely
answer versus which ones it fudged.

Then explain the difference to me: Class 3's retrieval finds passages inside documents.
This sees the corpus from above. They answer different questions and neither replaces
the other.

## Step 6 - The honest limits

Tell me plainly:
  - the graph is a SNAPSHOT. It does not update when I add a document; I have to re-run
    graphify update, and then re-run vendor-vis.sh
  - the MCP registration is on THIS machine for MY user - it is not part of the stack and
    it does not survive a rebuild of the containers
  - if the graph is stale, the answers are confidently wrong, and nothing will warn me

That last one is the one to say out loud. A stale graph does not error. It answers.

## Step 7 - Make staleness visible

Suggest one small, concrete way I would notice a stale graph - for example printing the
graph's mtime somewhere I will see it, or a line on the dashboard's Graph tab saying when
it was built.

Implement whichever one is simplest, if it does not require touching my workflows.

## Ground rules

- Never claim the MCP is working because it is listed. Make it answer something only the
  graph knows.
- If it answers from memory instead of calling the tool, say so.
- Do not modify my database or workflows.
- Use full paths - the venv is not on PATH for other processes.
```

---

## The closing idea of the series

Class 1 installed something that could reason. Class 6 ends with that same thing **reading
a map of everything you taught it since.**

And the engine that named the graph is the Claude Code you installed in the very first
hour — no new key, no card, `$0.00`. The first tool and the last tool are the same tool.

## The limit worth repeating

**A stale graph does not error. It answers.**

It is a snapshot. Add documents and the graph does not know until you rebuild it — and
then it will confidently tell you about a corpus you no longer have. Rebuild it when your
documents change, and re-vendor the JavaScript afterwards.

## If it goes wrong

| What you see | What it means |
|---|---|
| `graphify-mcp: not found` | The venv is not activated, or you used a bare name instead of the full path. |
| `/mcp` does not list it | The `claude mcp add` scope or path is wrong. `claude mcp list` shows what was registered. |
| It answers without calling the tool | It is answering from the conversation, not the graph. Ask again and require the tool call. |
| Answers describe documents you deleted | The graph is stale. Re-run `graphify update`, then `vendor-vis.sh`. |
