# Upgrade — the digest to Telegram instead of email

**Optional. Needs Class 4.** The class default is email, and that is on purpose.

---

## Why email is the default

Two reasons, and the first is the real one.

**A digest about your email that arrives somewhere else is a lesson in fragmentation.**
The thing it summarises lives in your inbox. Putting the summary in a different app means
two places to check, which is the problem this class exists to reduce.

**And it keeps Class 5 independent of Class 4.** A member who skipped the Telegram class
is not blocked here. The series should not quietly accumulate hard dependencies between
hours that were each presented as complete.

---

## Why you might want it anyway

The honest case, and it is a good one:

**You will actually read it.** A message on your phone at 7am gets looked at. An email
lands in the same inbox as everything else you are behind on — including, now, a summary
of how behind you are.

If you already have the Class 4 bot, this costs one node.

---

## What it takes

You need the Class 4 bot: `BRAIN_BOT_TOKEN` and `BRAIN_OWNER_ID` in your stack's `.env`,
and the container restarted since you added them.

Then in the P1 workflow, replace the send-email node with a Telegram `sendMessage` to your
own chat id. **Everything else is unchanged** — the schedule, the query, the summary, and
the branch that sends even when there is nothing to report.

That branch matters more here, not less. **A silent Telegram bot is even easier to ignore
than a silent inbox**, because you were not expecting anything from it in the first place.

---

## Three things that will bite you

**Telegram messages have a length cap** — 4,096 characters. A busy night can exceed it and
the send fails. Cap the summary, or split it. Failing on the busiest morning is the worst
possible day to fail.

**Formatting is not email.** No tables. `Markdown` or `HTML` parse modes only, and an
unescaped character in a subject line will break the whole message with a parse error
rather than sending it plainly.

**One bot, one n8n trigger.** This is a `sendMessage`, not a trigger, so it does *not*
conflict with your Class 4 voice workflow — but if you ever add a trigger here, you need a
second bot. Class 4's `PREWORK.md` explains why messages vanish silently otherwise.

---

## Or do both

The version most people end up wanting:

- **Email** stays the record — searchable, archived, on every device
- **Telegram** gets one line: *"3 new leads, 1 invoice, 1 needs a reply — check your
  digest"*

The bot becomes the nudge; the email stays the document. Two nodes instead of one, and the
heartbeat rule applies to both: **they both send even when the answer is nothing.**
