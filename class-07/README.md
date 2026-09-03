# Class 7 — A Clock It Can Read

**The Brain That Runs a Company, Part 7.** Your brain already knew the lease renews
on March 1st. Now it tells you on February 28th.

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-07/**
>
> That page is the show notes. It recaps Classes 1–6, carries the one-line install, and is
> what you follow along with during the hour.

Wednesday 23 September 2026, 11:00 AM ET · Skool live room ·
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106)

---

## The sentence the class is about

**Your brain has known since Class 3 that the warehouse lease renews on March 1st. It has
never once mentioned that on February 28th.**

Not because it forgot — because nobody asked it on February 28th.

**Class 3 solved *what*. This solves *when*.**

---

## The one command

Run it **on the machine your brain runs on** — the one with Docker and n8n.

**macOS / Linux / WSL**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-07/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/class-07/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

It downloads the pack and walks you through checking your calendar feed — **without ever
seeing your secret URL.** The prompt is explicitly instructed not to ask for it, not to
echo it, and to hand you the command to run yourself.

---

## No new signup. Not even a free tier.

**The first class in the series where that is literally true.**

| Piece | What it costs |
|---|---|
| Reading your calendar | A **secret URL** your calendar already generates. No account, no OAuth, no consent screen |
| Proposing an event | An `.ics` attached to an email. It is just a file |
| Fetching, parsing, sending | Free — your existing n8n and mailbox |

---

## What you need before this class

| | |
|---|---|
| **Class 2** | required — n8n and the mailbox |
| **Class 3, with real documents** | required for P2. The dates come out of your own files |
| **Class 5** | **optional.** If you did it, your 7am digest gains a line about today |
| **A secret iCal URL** | five minutes — [the setup gate](setup-gate.html) has it for Google, Apple, Outlook and Fastmail |
| **One recurring event written down** | with the date it next occurs. See below |

---

## Read this before you paste the URL anywhere

**That URL is read access to your entire calendar, for anyone who has it.**

Not scoped to today. Not scoped to titles. Not expiring. Anyone holding the string can
fetch every event you have — past and future — without logging in as you and without you
ever knowing.

It goes in an **n8n credential and nowhere else**.

**And that is the trade, made on purpose.** In exchange: no OAuth, no consent screen, no
Cloud project, no new account — and **nothing that can write to your week**. If it leaks,
Google's **Reset** button kills it instantly. One click, no app to unpick.

---

## The two things that will lie to you

Both look like success. Neither errors.

### Recurring events

Your weekly standup is **one event plus a repeat rule** (`RRULE`), not fifty-two events. A
parser that ignores the rule shows it **once**, on the day it first happened — possibly
years ago — and today looks quiet.

**Every one-off event still appears perfectly.** That is exactly why you will believe it.

```bash
curl -s "$BRAIN_ICAL_URL" | grep -c "^RRULE"
```

That is why the pre-work asks you to write one down: **that** is the line you check.

### Timezones and all-day events

`DTSTART;VALUE=DATE` is a date. `DTSTART` with a time is a timestamp. And a time may carry
a zone, end in `Z`, or have no zone at all.

**Everything out by the same amount** → `GENERIC_TIMEZONE` is unset, so n8n is on UTC.
**Only some events out** → `TZID` versus floating times, and that one is harder.

---

## Why it emails you a file instead of writing to your calendar

**A calendar you did not agree to is worse than no calendar.** Give an automation write
access to your week and it can quietly put things in it — and you find out when you are
somewhere you never agreed to be.

An `.ics` you click is a **proposal**. You still say yes.

This is Class 5's draft-don't-send applied to time. If you want it automatic after a month
of good proposals, `docs/UPGRADE-write-access.md` is honest about the price — a Google
consent screen, and **tokens that expire after seven days if the OAuth app is left in
Testing**. On Fastmail, iCloud or Nextcloud, CalDAV gives you write access with an app
password and none of that.

---

## And the date is extracted, never generated

It is pulled out of the document text, and **the sentence it came from ships with it**.

A model that invents a plausible renewal date is *worse than no reminder*, because you will
act on it. **If it cannot show you the sentence, it does not ship** — Class 3's
extracted-versus-inferred rule, applied to time.

---

## What is here

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **The show notes.** Classes 1–6 recap, the install, both prompts, the two lies |
| [`install.txt`](install.txt) | What the one command fetches |
| [`setup-gate.html`](setup-gate.html) | Where the secret URL lives on each provider, and what it grants |
| [`downloads/`](downloads/) | The pack zip and `SHA256SUMS` |
| [`pack/`](pack/) | The pack unzipped — every file readable here without downloading |

Both HTML pages work standalone from `file://`, make **no network requests at all**, and
reference no external resources.

---

## Checksums

```bash
cd downloads && sha256sum -c SHA256SUMS
```

| File | SHA-256 |
|---|---|
| `class-07-calendar-pack.zip` | `05b9b133ed6ab8220763c2a96534ac458a997996356ad488bbbaaae6c0df56ea` |

9 files. This pack pins its zip timestamps, so the same sources always produce the same
hash — a mismatch means the sources moved, not that the clock did.

`build-pack.py` carries a **calendar-URL guard** alongside the usual credential scan: it
refuses to build if anything resembling a real secret iCal address, `webcal://` link or
CalDAV endpoint reaches the pack. Both guards were tested by planting one.

---

## The series

| Class | What it adds | Where |
|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | Aug 12 |
| 2 · Give It Senses | n8n and Postgres | Aug 19 |
| 3 · Ask Your Brain | Memory it can search | [class-03](https://aiautobase.github.io/Build_With_Me/class-03/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04](https://aiautobase.github.io/Build_With_Me/class-04/) |
| 5 · Hands and a Clock | The 7am digest, draft-don't-send | [class-05](https://aiautobase.github.io/Build_With_Me/class-05/) |
| 6 · The Graph | What connects to what | [class-06](https://aiautobase.github.io/Build_With_Me/class-06/) |
| **7 · A Clock It Can Read** | **Your real calendar, both directions** | **here** |
| **8 · Make It a Project** | History, versions, and a README | [class-08](https://aiautobase.github.io/Build_With_Me/class-08/) |
| — · Content Mate | The public voice — optional, in the classroom | [content-mate](https://aiautobase.github.io/Build_With_Me/content-mate/) |

---

## License

MIT — see [LICENSE](LICENSE).

*Orbix Automation Solutions · [getorbix.com](https://getorbix.com)*
