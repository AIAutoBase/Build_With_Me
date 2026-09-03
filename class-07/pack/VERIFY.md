# Class 7 — does it actually work?

```bash
bash verify.sh
```

That covers levels 0 and 1. **The rest need your eyes, and one of them needs your own
calendar open beside it.**

---

## What a working parse looks like when it is broken

Every class in this series has a version of this. Here is Class 7's, and it is the
sneakiest one yet:

> **Your one-off events appear perfectly. Your recurring ones do not appear at all.**
>
> Today shows two meetings instead of five. Nothing errors. Nothing looks wrong. The two
> that showed up are correct, on the right day, at the right time.
>
> You will believe it, and you will miss the standup.

That is the same family as Class 3's base64 stored as text, Class 4's audio file full of
static, Class 5's digest that only speaks when it has news, and Class 6's `Community 1`.
**A plausible artifact from a broken step.**

---

## Level 0 — the feed is real

```bash
export BRAIN_ICAL_URL='<your secret URL>'   # keep the quotes
bash verify.sh
unset BRAIN_ICAL_URL
```

- [ ] HTTP 200, and the first line is `BEGIN:VCALENDAR`
- [ ] The event count is roughly what you would expect
- [ ] You have been told **how many events repeat**
- [ ] You have been told whether there are all-day events and whether times carry a zone
- [ ] n8n's `GENERIC_TIMEZONE` is **your** timezone, not UTC

**Write down the recurring count.** It is the number the next level is about.

---

## Level 1 — it answers "what is on today"

- [ ] P1 returns today's events in time order, readably
- [ ] Each one shows whether it repeats

---

## Level 2 — the check that catches the lie

**This is the level people skip, and it is the reason this file exists.**

In the pre-work you wrote down one recurring event and the date it next occurs.

- [ ] **That event appears, on that date.**

If it does not: the recurrence rule is not being expanded. **Stop and fix it, or write the
limitation down where you will see it again.** Do not accept "mostly working" — a calendar
that shows two thirds of your day is worse than one you know is broken, because you will
plan around it.

Then the reverse:

- [ ] Pick a day with **no** events. It says so, rather than showing you yesterday's.

---

## Level 3 — compare against your real calendar, side by side

Open your actual calendar next to the output. **This is not optional and no amount of
green output replaces it.**

- [ ] Nothing is missing
- [ ] Nothing is on the wrong day
- [ ] Nothing is at the wrong hour
- [ ] All-day events read as all-day, not as midnight

> **The hour check is the timezone check.** If everything is consistently out by the same
> number of hours, that is `GENERIC_TIMEZONE`. If only *some* events are out, that is
> `TZID` versus floating times, and it is the harder bug.

---

## Level 4 — the proposal is real, and it is only a proposal

- [ ] An email arrives with an `.ics` attachment
- [ ] **Opened in a real mail client**, it offers to add an event — it does not open as text
- [ ] The date is correct
- [ ] The title still makes sense read cold in four months
- [ ] The description carries **the sentence from the document, and the filename**

Then the two that matter most:

- [ ] **Nothing was added to your calendar before you clicked.** Check the calendar first,
      then click.
- [ ] **The date exists in the document.** Open the file and find it. If the brain produced
      a date the document does not contain, something is generating rather than extracting
      — stop and fix that before you trust any of it.

That second one is Class 3's extracted-versus-inferred rule applied to time, and it is the
difference between a reminder and a fabrication.

---

## Level 5 — it does not repeat itself

- [ ] Run the proposal workflow again. **No duplicate email** for the same date
- [ ] Or if it does re-send, the `UID` matches, so your calendar updates rather than twinning

A workflow that emails you the same reminder every week is one you will switch off within a
fortnight, and then you have nothing.

---

## The check that proves it was worth building

Everything above proves the plumbing. This proves the point:

- [ ] **Something appeared in your day that you had forgotten about**, and it came out of a
      document you uploaded weeks ago.

That is the whole class. If it never happens, either the documents have no dates in them or
you already had perfect recall — and one of those is much more likely.

---

## Reference

Nothing here has been measured against the teaching box yet. `verify.sh`'s own detection
was tested against a real 317-event public feed and a crafted feed containing a recurring
event, an all-day event and timezone-carrying events — it found all four correctly.

**Everything about your own calendar is unmeasured until you run it.**

---

## What this does not verify

- **That the recurrence expansion is correct in general.** It checks the one event you
  chose. Monthly-by-weekday rules, exceptions (`EXDATE`) and moved occurrences are harder
  still.
- **That your calendar is complete.** If you took the URL from the wrong calendar, all of
  this passes and describes the wrong week.
- **Class 3's correctness.** The dates come out of your documents. If a document is wrong,
  you get an accurate reminder of the wrong thing.
