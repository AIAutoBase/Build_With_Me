# Class 9 — troubleshooting

Symptom first, because the symptom is what you have at 11pm.

---

## "It works from my laptop now" — and that is the problem

**Symptom:** you changed the dashboard to listen on `0.0.0.0` so you could reach it from
another machine. It worked immediately. Nothing errored. Everything is fine.

**Cause:** you published an unauthenticated shell to whatever network that box is on. If
the box has a public IP, or a port forward, or a tunnel you forgot about, that is the
internet.

There is no symptom for this. The only way to find out is for somebody else to find it
first.

**Fix:** put it back on `127.0.0.1`. If you genuinely need remote access, set
`COCKPIT_AUTH_TOKEN` to something 32 characters or longer and put it behind a Cloudflare
Tunnel with access control. The preflight from build prompt 09 refuses to start otherwise —
if it did not refuse, you removed it, and git will show you when.

---

## A permission prompt keeps blocking the agent

**Symptom:** the agent stops and asks before doing things, repeatedly, and it is slowing
you down. A search suggests `--dangerously-skip-permissions`.

**Cause:** the prompts are working.

**Fix:** none. Do not add the flag. It removes every block at once, the agent gets faster
and more capable, and the cost stays invisible until the one command that mattered.

If a specific command is blocked and you want it, add that one command to
`allowlist.json` and commit the change. That is a decision with a diff. The flag is a
decision with no record.

---

## The browser tab froze

**Symptom:** you ran something that produces a lot of output — `find /`, a big `grep` — and
the tab locked up. You force-quit it.

**Cause:** no output cap, or the cap is applied after buffering instead of during the
stream. Tens of megabytes went into a websocket and then into DOM nodes.

**And the part that is not obvious:** the process is still running. Nothing is reading it.
It will hold whatever it holds — a database connection, a file handle — until the box
restarts.

**Fix:** the 256 KB cap from build prompt 07, checked as you stream rather than at the end.
Then the DOM cap from prompt 11 — the server cap does not stop a browser accumulating
across fifty commands.

Check for leftovers: `ps` for the command you ran.

---

## A command shows a cursor and never comes back

**Symptom:** you ran something and the cockpit sits there. No output, no error, no exit.

**Cause:** the command is waiting on stdin. `cat` with no arguments does this. So does
anything that decided to prompt you.

**Fix:** close stdin immediately on spawn, and set the 30-second timeout — both are in
build prompt 07. A command that wants input should fail fast, not hang.

Then look for the zombie. A hung spawn with nothing reading it does not clean itself up.

---

## Every saved credential stopped working, three days later

**Symptom:** n8n cannot log into anything. Workflows that ran for weeks now fail on
authentication. Nothing changed that you remember.

**Cause:** something rewrote `.env`. The encryption key changed. Every credential saved
since Class 2 is now undecryptable — they are still there, and they cannot be read.

The most likely something is an agent that noticed a variable it thought was wrong and
helpfully fixed it. Class 8 foreshadowed this and it still happens.

**Fix, in order:**

1. `git log -p -- .env.example` and your shell history. Find when.
2. If `.env` was ever committed, `git show <commit>:.env` has the old key. This is the one
   case where the Class 8 failure saves you.
3. If it was not committed, the key is gone. Every credential has to be re-entered by hand.
   There is no recovery.

**Prevention:** rule 8. It is why the cockpit refuses `.env` by name, and why the refusal
is logged rather than silent.

---

## The guard refused something I think is fine

**Symptom:** `REFUSED  <your command>  Reason: ...  Rule: guard.mjs rule N`.

**Cause:** possibly the guard is right. Possibly your allowlist is too narrow.

**Fix:** read rule N in `guard.mjs`. The refusal names it so you can get there in ten
seconds. Then either accept it, or widen `allowlist.json` — one entry, with a sentence
saying why it is safe enough to be there. If you cannot write that sentence, that is your
answer.

---

## `check-guard.mjs` says my own guard has no `makeGuard`

**Symptom:** `does not export makeGuard({ root })`.

**Cause:** your guard has a different shape. That is allowed — but the checker cannot reach
it.

**Fix:** export `makeGuard({ root })` returning `{ check(rawInput, mode) }`, where `check`
returns `{ verdict, rule, reason, argv }`. Build prompt 04 specifies it. The shape exists
only so this checker works against your code as well as ours.
