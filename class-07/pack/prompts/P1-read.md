# P1 — It knows what is on today

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** asking your brain *"what is on today?"* and getting your actual day back
— including the things that repeat.

---

```text
Build me a workflow in n8n that reads my calendar and can tell me what is on today.

I am a beginner. Explain each step before you run it, and stop rather than guess.

## Context you need

I have n8n and Postgres running from earlier classes in this series. This adds a workflow
that FETCHES A URL and parses it. It must not add a table, change my schema, or modify any
existing workflow. If you think you need to, stop and tell me why instead.

My calendar exposes a secret, read-only iCal URL. I already have it. It is going into an
n8n credential and nowhere else.

## Step 1 - Take the URL safely

Ask me to put the secret URL into an n8n credential, or an environment variable, myself.

DO NOT ask me to paste it into this chat. DO NOT write it into any file you create. DO NOT
echo it back to the screen at any point, including in an error message.

That URL is read access to my entire calendar for anyone holding it - not a scoped token.
Say that back to me in one line so I know you have understood it.

## Step 2 - Fetch it once, and look at what actually came back

Before building anything, fetch the URL and show me:

  - the HTTP status
  - the first 20 lines
  - how many bytes came back
  - how many VEVENT blocks it contains

The first line must be BEGIN:VCALENDAR. If it is HTML, I copied the wrong link and we stop
here.

Tell me the VEVENT count out loud. If my calendar has hundreds of events and the feed has
twelve, something is limited and I want to know now rather than after I trust it.

## Step 3 - Parse it, and be honest about what parsing iCal means

Build a Code node that turns the feed into structured events: summary, start, end, whether
it is all-day, and whether it repeats.

Three things I want you to handle explicitly, and to TELL ME how you handled each:

  a) ALL-DAY vs TIMED events.
     DTSTART;VALUE=DATE is an all-day event. DTSTART with a time is not. They are
     different shapes and if you treat them the same, all-day events land at midnight
     and sort wrongly.

  b) TIMEZONES.
     A DTSTART can carry a TZID, or end in Z for UTC, or have neither - which means
     floating local time. Tell me which of those my feed actually uses.
     Also tell me what n8n's GENERIC_TIMEZONE is set to. If it is unset it is UTC, and
     "today" will be the wrong day for part of every day.

  c) RECURRING EVENTS - and this is the one that matters most.
     A weekly meeting is ONE VEVENT with an RRULE, not one per week. If you do not
     expand that rule, the meeting shows up once, on the date it first happened,
     possibly years ago - and today looks empty.

     My one-off events will still look perfect. That is exactly why I would believe it.

     Tell me plainly which approach you are taking:
       - expand the RRULE properly in code, or
       - use a library available inside my n8n container, or
       - NOT handle recurrence, and say so out loud as a known limitation

     Any of those is acceptable. Silently doing the third while implying the first is
     not.

## Step 4 - Answer "what is on today"

Make it return today's events, in time order, in a form I can read - not raw JSON.

Something like:

  09:30  Standup (repeats weekly)
  14:00  Call with the insurance broker
  all day  Invoice due - SupplyCo

Include whether each one is recurring. I want to be able to see at a glance that the
recurring ones are actually being found.

## Step 5 - The check that catches the silent failure

I wrote down one recurring event in the pre-work, with the date it next occurs.

Ask me for it. Then check whether your parse finds it on that date.

If it does not: STOP and tell me the recurrence handling is not working, rather than
moving on. Do not describe this as "mostly working". A calendar that shows two thirds of
my day is worse than one I know is broken, because I will plan around it.

## Step 6 - Compare against my actual calendar, with my own eyes

Show me today's output and ask me to open my real calendar side by side.

Ask me directly: is anything missing, and is anything on the wrong day or at the wrong
hour?

Do not skip this because the code looks right. The whole class is about whether the brain
sees my real day, and only I can confirm that.

## Step 7 - Make it askable

Wire it so I can get this on demand - a webhook I can curl, or the dashboard, whichever
fits what I already have. Follow the pattern my existing workflows use rather than
inventing a new one.

## Step 8 - If I did Class 5, add one line to the digest

Ask me whether I built the 7am digest in Class 5.

If yes: add today's calendar to it, as a short line near the top. Not a full listing - a
summary I will actually read, like "3 things on today, first at 09:30."

Follow the rule that class already set: the digest ALWAYS sends, even when the answer is
nothing. "Nothing on today" is a useful thing to be told and it is also the heartbeat that
proves the digest still runs.

If I skipped Class 5, say so and move on. Do not build a digest for me here.

## Ground rules

- Never claim something worked without output showing it worked.
- Never print my secret URL, not even partially, not even in an error.
- Do not modify my Postgres tables, my Class 2 classifier, or any existing workflow.
- If recurrence is not handled, SAY SO. Do not let me find out in three weeks when I miss
  something.
```

---

## What P1 gives you

**A complete, useful thing on its own.** Even if P2 never happens, your brain can tell you
what is on today — and if you did Class 5, your digest opens with it.

## The failure to actually watch for

**Recurring events.** One-off events parse perfectly, which is precisely why a broken
recurrence handler is believable. Check the event you wrote down in the pre-work.

## If it goes wrong

| What you see | What it means |
|---|---|
| The feed is HTML | Wrong link — that is the browser one, not the iCal one |
| Far fewer events than you have | Some feeds are limited by date range. Check what came back |
| Today looks empty but you have meetings | **Recurrence is not being expanded.** The classic |
| All-day events show at 00:00 and sort oddly | `VALUE=DATE` is being treated as a timestamp |
| Everything is an hour or a day out | Timezone — check `GENERIC_TIMEZONE` and the `TZID` in the feed |
