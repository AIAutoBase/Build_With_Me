# P2 — It proposes what you already told it

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** a calendar invite in your inbox, built from a date inside a document you
uploaded weeks ago. One click and it is in your week.

---

## The idea

Your brain has known since Class 3 that the lease renews on March 1st. It has never
mentioned it, because nobody asked on February 28th.

This is the prompt that fixes that — **without giving anything write access to your week.**

---

```text
Build me a workflow in n8n that finds dates in my documents and emails me a calendar
invite for them, as an .ics attachment.

I am a beginner. Explain each step before you run it, and stop rather than guess.

## The rule that governs this whole prompt

It PROPOSES. It does not write to my calendar.

Do not add calendar write access. Do not suggest it. Do not add an "if confident, just
create it" branch. If I ask for one later, point me at docs/UPGRADE-write-access.md and
let me decide with the costs in front of me.

The reason, and I want you to say it back to me in your own words before we start:

  A calendar I did not agree to is worse than no calendar. An automation with write
  access to my week can quietly put things in it, and I find out when I am somewhere I
  never agreed to be. An .ics I click is a proposal - I still say yes.

## Step 1 - Find what my documents actually say

Look at the documents in my Class 3 knowledge base. Show me FIVE REAL EXCERPTS that
contain dates - renewal dates, due dates, expiry dates, deadlines.

Not a schema. Actual text, with the filename it came from.

I want to see them because if my documents have no dates in them, this workflow has
nothing to propose and we should find that out now rather than after building it.

## Step 2 - EXTRACT the date. Never generate it.

This is the most important instruction in this prompt.

The date must be pulled out of the document text. It must NEVER be produced by a model
guessing what a plausible renewal date would be.

A model that invents a renewal date is worse than no reminder at all: I will trust it,
put it in my calendar, and miss the real one.

So:
  - the date, and the sentence it came from, are EXTRACTED verbatim
  - a model may help decide WHICH dates are worth a reminder, and may write a readable
    title
  - if a date is ambiguous - "the first of the month", "30 days after signing" - it is
    FLAGGED, not resolved

Show me, for each candidate, the date AND the exact sentence it came from. If you cannot
show me the sentence, the date does not ship.

That is Class 3's extracted-versus-inferred lesson applied to time, and it is the same
reason that class refuses to answer rather than guessing.

## Step 3 - Ask me which ones matter

Do not decide for me what deserves a place in my week.

Show me the candidates and let me pick. Then ask whether I want a reminder ON the date, or
some days BEFORE it - a lease renewal is useless on the morning it renews.

Default suggestion: a reminder some days ahead, and let me choose how many.

## Step 4 - Build a real .ics file

An .ics is a small text file with a specific shape. Build it properly:

  BEGIN:VCALENDAR / VERSION:2.0 / PRODID
  BEGIN:VEVENT
    UID          - unique and STABLE for this document+date, so re-running does not
                   create a second copy of the same reminder
    DTSTAMP      - when it was generated
    DTSTART      - the reminder date. All-day is usually right for this
    SUMMARY      - short and specific: "Warehouse lease renews (1 Mar)"
    DESCRIPTION  - the exact sentence from the document, and the filename
  END:VEVENT
  END:VCALENDAR

Two things I want you to get right, and to tell me about:

  a) The UID must be STABLE. If the workflow runs again next week, the same document and
     the same date must produce the same UID - otherwise I get a duplicate reminder every
     run, and I will turn the whole thing off.

  b) Line endings in .ics are CRLF, and long lines are folded. If a calendar client
     refuses the file, that is usually why. Tell me if you had to handle it.

Put the source sentence in the DESCRIPTION. When this fires in four months I will not
remember why, and "because your lease says so, here is the line" is the difference
between trusting it and deleting it.

## Step 5 - Email it to me as an attachment

Use my existing Class 2 mailbox credential. Attach the .ics. Keep the body short:

  - what it found
  - which document, and the sentence
  - that clicking the attachment adds it, and nothing has been added yet

Send it to me and stop.

## Step 6 - I open it in a real mail client and click it

Not in n8n. On my phone or in my laptop's mail app.

Then tell me what to check:
  - the attachment opens as a calendar invite, not as a text file
  - the date is right
  - the title makes sense on its own, months from now
  - the description shows the sentence and the filename
  - accepting it puts it in my calendar
  - and nothing was in my calendar BEFORE I clicked

Wait for me to confirm. If it opens as plain text, the file or the MIME type is wrong -
tell me which.

## Step 7 - Check it does not repeat itself

Run it again. I should NOT get a second email about the same date, and if I do get one,
the UID must match so my calendar updates the existing entry rather than adding a twin.

Show me how you prevented duplicates and where that state lives. It has to survive a
container restart.

## Step 8 - Then, and only then, put it on a schedule

Weekly is plenty - documents do not change often.

Same rule as Class 5: tell me how I would know if it silently stopped. If the only answer
is "you would notice no emails", say that plainly, because that is this whole series'
recurring failure mode.

## Ground rules

- Never claim something worked without output showing it worked. "n8n says success" is
  not "the .ics opened as an invite" - check the mail client.
- NEVER generate a date. Extract it, and show me the sentence.
- Never write to my calendar.
- Do not modify my Class 2 or Class 3 workflows, schema or tables.
- Never print my secret calendar URL.
```

---

## The two things that make this work

**The date is extracted, never generated.** A model that invents a plausible renewal date
is worse than nothing, because you will believe it. If it cannot show you the sentence, it
does not ship — the same rule Class 3 used to make refusal a feature.

**The UID is stable.** Same document, same date, same UID — so a second run updates rather
than duplicates. Get this wrong and you get a fresh reminder every week until you turn the
whole thing off.

## If it goes wrong

| What you see | What it means |
|---|---|
| The attachment opens as plain text | Wrong MIME type, or the file is malformed |
| A duplicate reminder every run | The UID is not stable |
| The date is wrong by one day | All-day events and timezones. See `TROUBLESHOOT.md` |
| A date that is not in the document | **Stop.** Something is generating rather than extracting |
| Nothing found at all | Your documents may genuinely have no dates. Check the excerpts from Step 1 |
