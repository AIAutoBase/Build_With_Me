# Where the secret URL is, on each calendar

Every provider has one. Every provider calls it something different and hides it somewhere
different.

**What you want in every case:** a private URL ending in `.ics` whose first line is
`BEGIN:VCALENDAR`. Not the "share with a colleague" link, not the "add by email" one.

---

## Google Calendar

**Settings** (gear, top right) → *Settings for my calendars* → click the calendar name →
scroll to **Integrate calendar** → **Secret address in iCal format**.

There is a **Reset** button beside it. That is your revocation, and it works instantly.

> ### If it is not there
>
> A fair number of accounts do not show it — Workspace admins can disable it, and some
> personal accounts simply lack it.
>
> **Fallbacks, in order:**
>
> 1. **Check you are in the calendar's own settings**, not the global ones. It only appears
>    under a specific calendar.
> 2. **Make a new calendar**, put the events you want visible into it, and take that one's
>    address. Often the cleanest answer anyway — the brain does not need your whole life.
> 3. **Ask your Workspace admin** — it is a policy toggle, not a missing feature.
> 4. **Public address instead**, only if that calendar is genuinely fine to be public. Most
>    are not.
> 5. **`docs/UPGRADE-write-access.md`** — the API path reads as well as writes.
>
> **Untested:** none of these have been run against an account where the secret address is
> actually absent. If you hit it, post what worked.

---

## Apple iCloud

Apple does not expose a private per-calendar URL the way Google does. What it has is
**sharing**.

**iCloud.com → Calendar →** the share icon beside a calendar → **Public Calendar** → copy
the link.

Two things to know:

- **It arrives as `webcal://`.** Change that to `https://` for `curl` and for n8n. Same
  address, different scheme — `webcal` is just a hint to open a calendar app.
- **"Public" means public.** Anyone with the link reads it. There is no secret-but-private
  middle option here, so put only what you need the brain to see into that calendar.

Revoking is turning the public share off, which invalidates the link.

---

## Outlook / Microsoft 365

**Settings → Calendar → Shared calendars → Publish a calendar.**

Pick the calendar, choose a permission level, publish. You get **two** links: an HTML one
and an **ICS** one. **Take the ICS.**

The permission level matters: *"Can view all details"* gives titles and descriptions,
*"Can view when I'm busy"* gives you blocks with no titles — which makes the digest useless
for anything except "you are busy at 2".

Revoke with **Unpublish**.

---

## Fastmail

**Settings → Calendars →** the calendar → **Sharing** → *Publish this calendar* → copy the
ICS URL.

Fastmail also speaks **CalDAV** properly, which is the better option if you later want
write access without a Google consent screen. See `docs/UPGRADE-write-access.md`.

---

## Nextcloud / self-hosted

Calendar app → the `...` beside a calendar → **Copy subscription link**.

If you self-host, you already have the best version of this: CalDAV with an app password,
read **and** write, no third party involved, nothing published publicly.

---

## Which calendar should you point it at

**Not "all of them".** Start with one.

| | |
|---|---|
| **Work calendar** | Usually right. It is what the digest is for |
| A dedicated "brain" calendar | The most private option — you decide exactly what it sees |
| Everything, merged | Tempting, and it makes "what is on today" noisy enough to ignore |

You can add a second feed later once the first is behaving. Starting with one means that
when the output looks wrong, you know which calendar to compare it against.

---

## What they all have in common

- A URL that is **read-only** — none of these let anything write to your week
- A URL that is **a credential** — whoever holds it reads everything in that calendar
- A way to **revoke** it, which is one click on every provider above

That combination is why this class needs no account, no OAuth and no consent screen. It is
also why the URL never goes anywhere except an n8n credential.
