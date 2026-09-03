# Class 7 — do this before the hour

**Time: about five minutes. Cost: nothing, and no account to create.**

Class 7 gives your brain a clock it can read — your actual calendar. To do that it needs
**one URL**, which your calendar already generates for you.

That is the whole of the pre-work. But **read section 2 before you copy it**, because that
URL is more powerful than it looks and the class will not be the moment to find that out.

---

## Before you begin

| You need | Check |
|---|---|
| The starter pack done | `bash verify.sh` from the starter pack says **Ready** |
| Class 2 running | n8n is up and your mailbox credential works |
| Class 3 with real documents | Needed for P2 — the dates come out of your own files |
| A calendar you actually use | Google, Apple iCloud, Outlook or Fastmail |

**Class 5 is optional.** If you did it, your 7am digest gains a line about today. If you
skipped it, everything here still works — you just ask on demand instead.

---

## Step 1 — Get the secret URL

Your calendar can hand out a **private, read-only address** that any program can fetch. It
is not the sharing link you would send a colleague; it is the one meant for machines.

**Google Calendar:** Settings → *Settings for my calendars* → pick the calendar →
**Secret address in iCal format** → copy.

**Apple, Outlook and Fastmail:** the paths are in [`docs/CALENDARS.md`](docs/CALENDARS.md),
because each one calls it something different and hides it somewhere different.

Write down which calendar you took it from:

```
Calendar: ______________________________
```

> **Pick the calendar with your actual commitments in it.** If you keep work and personal
> separate, take the work one. You can add a second later; start with one so that when the
> output looks wrong you know which calendar to compare against.

---

## Step 2 — Understand what you are holding

**Read this part properly. It is the only genuinely sharp edge in the class.**

That URL is **read access to your entire calendar, for anyone who has it.**

Not scoped to today. Not scoped to titles. Not expiring. Anyone with that string can fetch
every event you have — past, present and future — **without logging in as you, and without
you ever knowing they did.**

### So

- It goes into an **n8n credential**, and nowhere else
- **Never** into a node parameter, a prompt, a screenshot, or the class thread
- Not into a note-taking app you sync, either

### If it gets out

**Google has a Reset button** next to the secret address. Click it and the old URL dies
instantly. Apple and Outlook have equivalents — `TROUBLESHOOT.md` has the paths.

That is genuinely the upside of this design. There is no OAuth app to unpick, no consent to
withdraw, and **nothing that can write to your week.** Read-only is the right amount of
access for step one, and revoking it is one click.

---

## Step 3 — Check it actually returns a calendar

Do not wait until the hour to find out the URL is wrong.

```bash
curl -s "<your secret URL>" | head -5
```

You should see something beginning:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:...
```

| What you get instead | What it means |
|---|---|
| HTML, or `<!DOCTYPE` | The URL is a *web page* link, not the iCal one. Wrong copy |
| `404` or `Not Found` | The address was reset, or mistyped |
| Nothing at all | Check the quotes — the URL usually contains characters your shell will eat |

**Put quotes around it.** That is not optional advice; secret URLs commonly contain
characters a shell treats as syntax.

---

## Step 4 — Find one recurring event, and write it down

**This is the step that seems pointless and is not.**

Your calendar almost certainly has something repeating — a weekly standup, a monthly
invoice, a Tuesday school run. In the feed, that is stored as **one event plus a repeat
rule**, not as one event per week.

A parser that ignores the rule shows it **once**, on the day it first happened, and today
looks empty. Every one-off event still appears correctly, so it looks like it works.

Write down one you know repeats:

```
Recurring event: ____________________  next on: __________
```

Bring that to the hour. When P1 lists your day, **that is the line you check.**

---

## Step 5 — Note your timezone

```bash
docker compose exec -T n8n printenv GENERIC_TIMEZONE
date
```

If `GENERIC_TIMEZONE` is empty, n8n is on **UTC** — and *"what is on today"* will quietly
mean the wrong day for part of every day.

Class 5 already hit this with a 7am digest firing at 2am. Same cause, different symptom.

**n8n reads environment variables when the container starts and never again**, so changing
it needs a restart.

---

## What to have ready on the day

- [ ] The secret URL, in a safe place — **not** pasted into anything yet
- [ ] `curl` on it returned `BEGIN:VCALENDAR`
- [ ] You know which calendar it came from
- [ ] **One recurring event written down**, with the date it next occurs
- [ ] n8n's timezone is yours, not UTC
- [ ] Class 3 has real documents in it, at least one with a date in it — a lease, a
      warranty, an invoice with terms

That last one is what P2 turns into a calendar invite, live.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| No "Secret address in iCal format" in Google | Some accounts and Workspace policies hide it. `docs/CALENDARS.md` has the fallback |
| `curl` returns HTML | You copied the browser link, not the iCal one |
| `curl` returns nothing | Quote the URL |
| `401` or `403` | It is not the *secret* address — the public one needs the calendar to be public |
| It works but the calendar looks empty | You may have copied a calendar you do not actually use. Check which one |

Post the exact error in the class thread. **Never post the URL itself** — and if you do by
accident, reset it immediately rather than deleting the message.

---

*The Brain That Runs a Company — Class 7. Orbix Automation Solutions.*
