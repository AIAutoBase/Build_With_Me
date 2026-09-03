# P1 — The clock

**Paste this whole file into Claude Code.**

**You end with:** an email in your inbox, every morning, telling you what came in while
you were asleep — including on the mornings when the answer is *nothing*.

---

```text
Build me a scheduled digest in n8n. Every morning it reads what my Class 2 classifier
wrote overnight and sends me one email.

I am a beginner. Explain each step before you take it, and stop rather than guess.

## Context

I have n8n and Postgres running from earlier classes. A workflow from Class 2 reads my
inbox, classifies each message, and writes a row. This new workflow READS those rows.

Do not modify the Class 2 workflow. Do not add a table. Do not change the schema. If you
think you need to do any of those, stop and tell me why instead.

## Step 1 - Look at what I actually have

Find the Class 2 table and show me:
  - its columns
  - how many rows exist
  - the newest row's timestamp
  - the distinct categories the classifier uses, with counts

Then show me FIVE REAL ROWS. Not a schema - actual rows.

I want to see them because the digest is going to summarise these, and if they are
empty, or all one category, or the timestamps are stale, then the digest I am about to
build will report nothing every morning and look perfectly healthy doing it.

Tell me plainly if what you found will not make a useful digest.

## Step 2 - Ask me what I want in it

Before you build anything, ask me:
  - what would make me glad this arrived at 7am
  - what would make me start ignoring it
  - what time I actually read email

Wait for my answers. Build it around mine, not around what is easy to query.

A digest I delete unread is worse than no digest, because it teaches me to ignore
something my brain sends me.

## Step 3 - Build the query first, on its own

Before any schedule and any email, write the SQL that answers "what came in since
yesterday morning" and run it by hand.

Show me the results. Iterate with me until the numbers look right.

Getting this wrong inside a scheduled workflow is miserable to debug, because it only
runs once a day and you cannot see it.

## Step 4 - Build the workflow, but do NOT put a schedule on it yet

Use a manual trigger while we build. Nodes:

  1. Manual trigger (for now)
  2. Postgres - the query from Step 3
  3. A branch: is there anything to report, or not?
  4. Summarise - one model call, capped short
  5. Send email

## Step 5 - The branch that matters most

**The digest must send even when there is nothing to report.**

Both branches send an email. One says what came in; the other says, in plain words,
"nothing came in overnight."

I want you to explain back to me why, before you build it. The reason:

  A digest that only speaks when it has news is indistinguishable from a broken one.
  If it goes quiet, I cannot tell whether nothing happened or whether the workflow
  died three weeks ago. The empty digest is the heartbeat.

This is the single most important design decision in this class. Do not let me talk you
out of it because "empty emails are annoying".

## Step 6 - The summary, kept short and honest

One model call. Cap it hard - a digest longer than the screen is a digest I stop reading.

Rules for the prompt you write:
  - Summarise ONLY what is in the rows. Do not infer, do not embellish, do not guess at
    urgency that is not in the data.
  - If a row is ambiguous, say so rather than picking a side.
  - Counts must come from the SQL, not from the model. Do not let it count things -
    models are bad at counting and it will be confidently wrong.

That last one matters. Pass the model the numbers; do not ask it for them.

## Step 7 - Run it by hand and send me the real email

Run it. Show me the email I actually received - not what n8n says it sent.

Then read it back to me and ask: is this something I would want at 7am, or is it noise
with a timestamp?

If it is noise, we fix it now, before it is on a schedule.

## Step 8 - NOW add the schedule

Replace the manual trigger with a schedule trigger, at the time I told you in Step 2.

Then check, and tell me explicitly:
  - what timezone the schedule is interpreted in
  - what n8n's timezone is set to
  - whether those are the same as MY timezone

A digest set for 7am that fires at 2am because the container is on UTC is the most
common way this goes wrong, and it looks like the workflow is fine.

## Step 9 - Prove it will fire tomorrow, not just that it ran today

This is the part people skip.

Show me:
  - the workflow is ACTIVE, not just saved
  - when n8n thinks the next execution is due
  - what I would look at in a week to confirm it has been running

Then tell me honestly how I would find out if it silently stopped. If the only answer is
"you would notice no email", say that, because that is the failure mode of this whole
class and I need to be uncomfortable about it.

## Step 10 - Break it on purpose

Deactivate the workflow. Confirm with me that from the outside, this looks EXACTLY like
a quiet week.

Then turn it back on.

I want to have seen that, because it is the thing I will actually have to guard against.

## Ground rules

- Never claim something worked without output showing it worked.
- Do not modify my Class 2 workflow, my schema, or my tables.
- Counts come from SQL. The model summarises; it does not count.
- Never write my mailbox password into a file. It belongs in the n8n credential.
- Test with a manual trigger before any schedule goes near it.
```

---

## What P1 gives you

**A complete, useful thing on its own.** If P2 fights you, you still have a working
morning digest and you have not lost the hour.

## The two failure modes to remember

**Timezone.** A 7am schedule on a UTC container fires at 2am and looks perfectly fine.

**Silence.** A dead schedule and a quiet week are the same thing from where you sit. That
is why the empty digest always sends.

## If it goes wrong

| What you see | What it means |
|---|---|
| No email at all | The workflow is saved but not **Active**. |
| Email arrives at the wrong hour | Container timezone versus your timezone. |
| "0 items" every morning | Class 2 is not writing rows. The digest is fine; its source is not. |
| Counts in the text disagree with the table | You let the model count. Pass it the numbers instead. |
| It ran once and never again | Check Active, then check the schedule's next-run time. |
