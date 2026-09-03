# A Clock It Can Read — Class 7 pack

This is the download for **AI Auto Base Class 7** of *The Brain That Runs a Company*.

Your brain already knew. Now it tells you on the day it matters.

---

## 1. The thing this class is actually about

**Your brain has known since Class 3 that the warehouse lease renews on March 1st. It has
never once mentioned that on February 28th.**

Not because it forgot. Because nobody asked it on February 28th.

Class 3 solved **what**. This solves **when** — and *when* is a calendar, which is the one
organ the brain has been missing.

```text
   your calendar ──secret iCal URL──▶ n8n ──▶ what is on today
                                              │
                                              └──▶ your Class 5 digest gains a line

   your documents (CLASS 3) ──▶ dates found ──▶ .ics attached to an email
                                                        │
                                                   you click it
                                                        │
                                                   your calendar
```

---

## 2. No new signup. Not even the free kind.

**This is the first class in the series where that is literally true.**

| Piece | What it costs |
|---|---|
| Reading your calendar | A **secret URL** your calendar already generates. No account, no OAuth, no consent screen |
| Proposing an event | An `.ics` file attached to an email. It is just a file |
| Fetching, parsing, sending | Free — your existing n8n and mailbox |

The whole build runs on things you already have.

---

## 3. What you need first

**The starter pack**, done. Node, Claude Code, Docker, n8n, Postgres.

**Class 2 working** — n8n and the mailbox. Required.

**Class 3 working, with documents in it** — required for P2. The dates come *out of your
documents*, so a brain with nothing in it has nothing to propose.

**Class 5 — optional.** If you did it, your 7am digest gains a line about today. If you
skipped it, P1 still answers *"what is on today?"* whenever you ask.

**`PREWORK.md`, done before the hour.** About five minutes: fetch one URL out of your
calendar settings and understand what holding it means.

---

## 4. What is in here

| File | What it is |
|---|---|
| `PREWORK.md` | **Start here.** Your secret URL, and the trade that comes with it |
| `docs/CALENDARS.md` | Where that URL is, on Google, Apple iCloud, Outlook and Fastmail |
| `prompts/P1-read.md` | Fetch, parse, and answer *"what is on today?"* |
| `prompts/P2-propose.md` | Dates out of your documents become an `.ics` in your inbox |
| `VERIFY.md` | The acceptance test — including the one that catches a silent lie |
| `verify.sh` | Preflight. Fetches your URL and tells you **what it actually got** |
| `TROUBLESHOOT.md` | Every error, and the two that look like success |
| `docs/UPGRADE-write-access.md` | Real calendar write access, honestly costed |

---

## 5. The order that works

1. **`PREWORK.md`** — get the secret URL, and read what it means before you paste it anywhere.
2. `bash verify.sh` — it fetches the URL and reports what came back. **Do this before P1.**
3. **P1.** Ask it what is on today. Compare against your actual calendar, with your own eyes.
4. **Check a recurring event.** Section 7 below. This is the step people skip and it is the
   one that matters.
5. **P2.** Watch a date come out of a document you uploaded weeks ago and land in your inbox.
6. `bash verify.sh` again, and paste the output in the class thread.

---

## 6. Read this before you paste the URL anywhere

**Your secret calendar URL is read access to your entire calendar, for anyone who has it.**

It is not a token with scopes. It is not limited to today. Anyone holding that string can
read every event title you have — past, present and future — without logging in as you and
without you ever knowing.

So:

- It goes in an **n8n credential**, and nowhere else
- Never in a node parameter, never in a prompt, never in a screenshot, never in the class thread
- If it gets out: **Google has a Reset button** that invalidates the old one instantly.
  Apple and Outlook have the equivalent. `TROUBLESHOOT.md` has the paths

**The upside of that trade:** because it is only a URL, revoking it is one click and there
is no OAuth app to unpick, no consent to withdraw, and nothing that can *write* to your
week. Read-only is the right blast radius for step one.

---

## 7. The two things that will lie to you

Both look like success. Neither errors.

### Recurring events

Your weekly standup is **not fifty-two events in the feed.** It is one event plus a
repeat rule (`RRULE`).

A parser that does not expand that rule shows the standup **once**, on the day it first
happened — possibly years ago — and today looks empty. **Your one-off events appear
perfectly**, which is exactly why you will believe it.

> **Check a recurring event on purpose.** Pick one you know is on today and confirm the
> brain sees it. If it does not, you have a parser that works on the easy half of your
> calendar.

### Timezones and all-day events

An all-day event and a 9am event are stored differently in iCal, and a time can be written
with no zone at all. Class 5 already found that n8n defaults to **UTC** — so *"what is on
today"* can quietly mean "what was on yesterday evening, UTC".

`TROUBLESHOOT.md` covers both.

---

## 8. Why it emails you a file instead of writing to your calendar

This is Class 5's draft-don't-send, applied to time.

**A calendar you did not agree to is worse than no calendar.** Give an automation write
access to your week and it can quietly put things in it — and you find out when you are
somewhere you never agreed to be.

An `.ics` in your inbox is a **proposal**. You click it, your calendar asks, you say yes.
You are still the one who decides what your week looks like.

If you want it automatic after a month of good proposals, that is a decision to make **with
evidence** — and `docs/UPGRADE-write-access.md` is honest about what it costs: a Google
consent screen, and tokens that expire after seven days if you leave the OAuth app in
Testing.

---

## 9. What it costs to run

**Nothing.** A URL fetch, a parse, and an email you already send.

The only way this costs money is if you have the model write the proposal text rather than
filling a template — fractions of a cent, and the pack templates it by default.

**And the date is always extracted, never generated.** That is Class 3's EXTRACTED versus
INFERRED lesson applied to time: a model that invents a renewal date is worse than no
reminder at all.

---

## 10. When it goes wrong

`TROUBLESHOOT.md` has all of it. Post the **exact error text** in the class thread — the
wording is the diagnosis. **Never post your secret URL.**

---

*The Brain That Runs a Company — Class 7. Orbix Automation Solutions.*
