# Class 7 — when it goes wrong

Ordered by how long it takes you to notice. **The first two do not error.**

---

# 1. The ones that look like success

## Today is emptier than your actual day

**Recurring events are not being expanded.**

A weekly standup is stored in the feed as **one event plus an `RRULE`**, not as one event
per week. A parser that reads events but ignores the rule shows it on the day it *first*
happened — possibly years ago — so today looks quiet.

**Your one-off events all appear correctly**, which is exactly why you will trust it.

```bash
# how many of your events repeat
curl -s "$BRAIN_ICAL_URL" | grep -c "^RRULE"
```

If that number is greater than zero and none of them show up today, that is the bug.

| Fix | Cost |
|---|---|
| Expand the `RRULE` properly in the Code node | the real answer |
| Use an iCal library inside the container | easier, if one is available |
| **Document the limit and show only non-recurring events** | honest, and disappointing |

**Any of those is acceptable. Doing the third while implying the first is not.**

## Everything is an hour or a day out

Timezones, and there are two different versions:

**All of it out by the same amount** → `GENERIC_TIMEZONE` is unset, so n8n is on UTC.

```bash
docker compose exec -T n8n printenv GENERIC_TIMEZONE
```

Set it, then **restart the container** — n8n reads environment variables at start and
never again. Class 5 hit exactly this with a 7am digest firing at 2am.

**Only some events out** → the harder one. A `DTSTART` can carry a `TZID`, or end in `Z`
for UTC, or have neither — a *floating* time, which means "local, wherever you are". Three
shapes, three behaviours.

```bash
curl -s "$BRAIN_ICAL_URL" | grep -c "TZID="
```

## All-day events show at midnight and sort oddly

`DTSTART;VALUE=DATE:20260923` is a **date**. `DTSTART:20260923T140000` is a **timestamp**.
Treat the first as the second and every all-day event lands at 00:00 and sorts before your
early meeting.

They need different handling and different display — "all day", not "12:00 AM".

---

# 2. The feed itself

## `curl` returns HTML

You copied the **browser link**, not the iCal one. The secret address ends in `.ics` and
the first line of the response is `BEGIN:VCALENDAR`.

## `curl` returns nothing at all

**Quote the URL.** Secret calendar addresses routinely contain characters your shell treats
as syntax, and the failure looks like an empty variable rather than an error.

```bash
export BRAIN_ICAL_URL='https://...'    # quotes
```

## `401` or `403`

That is the **public** address, which only works if the calendar is public. You want the
**secret** one.

## `404`

The address was reset — by you, or by an admin — or it is mistyped. Get a fresh one; the
old string is dead permanently once reset.

## There is no "Secret address in iCal format" in Google Calendar

Real, and it affects a fair number of accounts. Workspace administrators can disable it,
and some personal accounts do not show it.

`docs/CALENDARS.md` has the fallbacks. **This has not been tested against an account where
it is absent** — if you hit it, say so in the thread, because it makes the pack better.

## The feed has far fewer events than your calendar

Some providers limit the feed by date range. Check what actually came back before you
assume the parser dropped them:

```bash
curl -s "$BRAIN_ICAL_URL" | grep -c "^BEGIN:VEVENT"
```

## The right feed, but the wrong life

You took the URL from a calendar you do not actually use. Everything passes and describes
somebody else's week — usually an empty "Personal" calendar sitting beside the real one.

---

# 3. The proposal

## The `.ics` opens as plain text

Either the attachment's MIME type is wrong (`text/calendar`), or the file is malformed —
`.ics` needs **CRLF** line endings, and long lines are folded.

## You get the same reminder every run

**The `UID` is not stable.** Same document plus same date must produce the same `UID`
every time, or your calendar treats each one as a new event.

This is the single fastest way to make somebody switch the whole thing off.

## The date is wrong by one day

All-day handling again. A date-only value has no time and no zone; converting it through a
timezone can move it.

## A date appeared that is not in the document

**Stop.** Something is generating rather than extracting.

The date must be pulled from the document text, with the sentence it came from shown
alongside. A model that invents a plausible renewal date is worse than no reminder, because
you will act on it.

That is Class 3's refusal lesson applied to time: **if it cannot show you the sentence, it
does not ship.**

## Nothing is found at all

Your documents may genuinely have no dates in them. Look at what is actually in the
knowledge base before blaming the extraction.

---

# 4. Security

## You pasted the secret URL somewhere public

**Reset it immediately** — do not simply delete the message.

| | Where |
|---|---|
| Google | Settings → the calendar → **Reset** beside the secret address |
| Apple iCloud | stop sharing the calendar, then re-share to get a new URL |
| Outlook | remove the published link, publish again |

Resetting invalidates the old address instantly. Anything using it — including your own
workflow — needs the new one.

## Who can read it

Anyone holding that string, forever, without logging in and without you knowing. Every
event title, past and future.

**That is the trade this class made on purpose**, in exchange for no OAuth, no consent
screen, no new account, and nothing that can *write* to your week. Read-only, one click to
revoke.

---

## Posting for help

The **exact error text**, what you ran, and whether the workflow was active.

**Never post the URL.** If you do by accident, reset it first and mention that you have —
the message being deleted does not help.
