# Class 9 — verify

Nine things to prove against the **running** cockpit, not against the source.

The result column is blank. Fill it in by running each one. A blank column is an honest
statement that this has not been verified; a column full of ticks you did not earn is
worse than no file.

> This is the only class in the arc whose pack ships a `VERIFY.md`. Classes 10, 11 and 12
> write theirs in class, in their last build prompt. This one comes with the pack because
> the cockpit is the dangerous one, and you want the list of things that must be true
> **before** you build the thing, not after.

---

## Before you start

```bash
node check-guard.mjs --guard <path to your guard.mjs>
```

Green here is a precondition, not a result. It proves your guard refuses strings. The nine
below prove the running system refuses commands.

---

| # | What | Command | Pass looks like | Result |
|---|---|---|---|---|
| 1 | `.env` is refused, naming rule 8 | Type `cat .env` in the cockpit | `REFUSED`, reason names `.env`, rule shown is 8 | |
| 2 | Path escape is refused | `ls ../../` | `REFUSED`, rule 7, message says the path resolves outside the root | |
| 3 | Composition is refused **for the metacharacter** | `ls; cat .env` | `REFUSED`, **rule 1**, not rule 8. If it says 8, your guard tokenized before rejecting — fix the order | |
| 4 | Git writes are refused | `git commit -m "x"` | `REFUSED`, rule 4 | |
| 5 | READ mode blocks a WRITE command | In READ mode: `mkdir test` | `REFUSED`, rule 6, message names the mode | |
| 6 | Output cap holds and the tab survives | `find /` | Output stops at the cap, a final line says it was capped, tab still scrolls and accepts input | |
| 7 | stdin-waiting command fails fast, leaves nothing | `cat` with no arguments, then `ps` | Returns within a second or two. **`ps` shows no leftover process** | |
| 8 | Exposed binding stops the whole server | Set the host to `0.0.0.0`, unset `COCKPIT_AUTH_TOKEN`, start | Server **refuses to start**. Message names the two ways out | |
| 9 | Every attempt above left a row | `select verdict, rule, raw_input from cockpit_audit order by started_at desc limit 12;` | Twelve rows. Every refusal above appears with verdict `REFUSED` and a reason | |

---

## Item 3 is the one people get wrong

`ls; cat .env` must be refused for the **metacharacter**, not for `.env`.

If your guard reports rule 8, it split the string first and then looked at the pieces. That
means it is parsing shell syntax — and a guard that parses shell syntax is a shell parser
with fewer eyes on it than the real one. Rule 1 exists so that nothing downstream ever has
to be correct about `;`.

## Item 7 is the one people skip

Running `cat` with no arguments and seeing it come back is half the test. The other half is
`ps`. A hung spawn with a closed browser tab is invisible from the cockpit and holds
whatever it holds — a database connection, a file handle — until the box restarts.

## Item 8 is the demo

Do it on purpose, in front of people. A refusal you have watched is a refusal you believe.

---

## Then answer this, in writing

**What would have to go wrong for someone else to get a shell on this box?**

Write the answer down. If the only answer you can give is "it's secure", the hour did not
land and the list below is where to start.

Three things this design does not protect against:

1. **An agent in WRITE mode with a scripting language on the allowlist.** `python` or `node -e`
   reads any file on the box, and rule 8 becomes decoration. The default allowlist has
   neither, on purpose. Adding one is a decision, not a convenience.
2. **A command that is allowed and wrong.** `mv` is on the WRITE list. The guard has no
   opinion about whether you wanted that file moved. Git is the answer here, which is why
   Class 8 came first.
3. **Anything reached before the guard.** The guard protects the command path. It does not
   protect the dashboard's other routes, the database, or the box. If the dashboard has an
   authentication hole, the cockpit is not what an attacker will use.
