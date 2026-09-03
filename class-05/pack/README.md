# Hands and a Clock — Class 5 pack

This is the download for **AI Auto Base Class 5** of *The Brain That Runs a Company*.

Your brain stops waiting for you to ask.

---

## 1. What this actually does

```text
                    ┌── 7am ──▶ read last night's rows ──▶ one email: what came in
   the clock ───────┤
                    └── on a lead ──▶ write a reply ──▶ IMAP APPEND ──▶ your Drafts folder
                                                                            │
                                                                    you read it,
                                                                    you press send
```

Two things. A **clock** that tells you what happened while you were asleep, and **hands**
that write the reply and then stop.

**It does not touch anything you built in Class 2.** No new table, no schema change, no
migration. It reads the rows your classifier already writes.

Which has a useful consequence when something breaks: **is your Class 2 classifier still
writing rows?** If yes, the fault is here. If no, it is Class 2's, and it was already
broken.

---

## 2. Read this part first — this class fails differently

Every other class in this series fails **loudly**. A webhook 404s. A voice note comes back
as static. A graph renders with placeholder names. You find out immediately.

**A digest that stops firing sends you nothing. And nothing looks exactly like a quiet
Tuesday.**

You will not notice for a week. By then you will have made decisions on the assumption
that nothing came in, and you will be wrong.

So this pack checks differently from the others. `VERIFY.md` does not just ask *"did it
work?"* — it asks **"how would you ever know it stopped?"** Do not skip that section. It
is the whole reason this class is harder than it looks.

---

## 3. What you need first

**The starter pack**, done. Node, Claude Code, Docker, n8n, Postgres. Run its `verify.sh`.

**Class 2 working**, and actually classifying mail. This class reads those rows. If
nothing is writing them, the digest has nothing to summarise and you will build something
that reports zero every morning.

**Your mailbox credentials from Class 2** — the same ones, for both reading and writing.

**`PREWORK.md` done before the hour.** About ten minutes, and it contains one probe you
genuinely have to run rather than assume.

**No new signup.** Not the free kind either — everything here uses credentials you already
have.

---

## 4. What is in here

| File | What it is |
|---|---|
| `PREWORK.md` | **Start here.** The mailbox check, and the `APPEND` probe |
| `prompts/P1-digest.md` | The clock. Ends with an email in your inbox at 7am |
| `prompts/P2-draft.md` | The hands. Ends with a draft in your mail client, unsent |
| `VERIFY.md` | The acceptance test — including *"prove it will still fire tomorrow"* |
| `verify.sh` | Preflight. **Probes IMAP `APPEND` for real**, not by assumption |
| `TROUBLESHOOT.md` | Every error, silent ones first |
| `docs/UPGRADE-telegram.md` | Digest to Telegram instead of email. Needs Class 4 |
| `docs/UPGRADE-gmail-api.md` | Real Gmail drafts, and the consent screen that costs you |

---

## 5. The order that works

1. **`PREWORK.md`** — mailbox reachable, and the `APPEND` probe passes. **Do the probe.**
2. **P1** — the digest. Run it by hand first, before you let a schedule near it.
3. Read the email it sends you. Out loud, if you can. Is it something you would want at
   7am every day, or is it noise with a timestamp?
4. **P2** — draft-don't-send. Open the draft **in a real mail client**, not in n8n.
5. **Break it on purpose.** Point the schedule at a time that has passed and confirm you
   can tell the difference between "nothing happened" and "nothing came in."
6. `bash verify.sh`, and paste the output in the class thread.

**P1 alone is a complete, useful thing.** If P2 fights you, you still have a working
morning digest and you have not lost the hour.

---

## 6. Why it drafts instead of sending

This is the argument, and it is worth having rather than accepting.

**The first thing your brain does *to* the world rather than *for* you should not be able
to embarrass you.**

Not because the model writes badly — it writes fine. Because **you have not earned the
right to trust it yet, and neither has it.** Draft-don't-send is how you find out whether
it would have been right, at zero risk, for as long as you need.

Some people will move to auto-send after a month of good drafts. That is a decision to
make **with evidence**, on your own account, having read a hundred of them. It is not a
default, and this pack will not make it one for you.

---

## 7. What it costs

| Piece | Per day |
|---|---|
| The digest summary — one call, capped | fractions of a cent |
| Drafting a reply — one call per item you choose to answer | fractions of a cent |
| The schedule, the query, the IMAP `APPEND` | free |

Pennies. **Estimated, not measured** — the real figure goes in the show notes after the
class, read off live usage rather than guessed.

---

## 8. Two things that will bite you

**A schedule that never fired looks identical to a schedule with nothing to report.**
Build the digest so it **always sends**, even when the answer is "nothing came in." A
digest that only speaks when it has news is indistinguishable from a dead one.

**A draft without the `\Draft` flag is not a draft.** It appears in the folder as
*received mail* — sitting there looking like something someone sent you. `TROUBLESHOOT.md`
covers this, and it is the most confusing five minutes in the class.

---

## 9. When it goes wrong

`TROUBLESHOOT.md` has all of it. Post the **exact error text** in the class thread — the
wording is the diagnosis. Never post your mailbox password.

---

*The Brain That Runs a Company — Class 5. Orbix Automation Solutions.*
