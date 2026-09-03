# Upgrade — letting it write to your calendar

**Optional, and the class default is not a downgrade.**

The build emails you an `.ics` and you click it. This doc is for when you have read a
month of those and decided you would rather it just did it.

---

## Read this before you decide

**The proposal step is not a limitation. It is the design.**

> A calendar you did not agree to is worse than no calendar. An automation with write
> access to your week can quietly put things in it — and you find out when you are
> somewhere you never agreed to be.

Moving to write access is a decision to make **with evidence**: a month of proposals you
actually read, and a narrow category rather than everything. It is not a convenience
upgrade and this pack will not treat it as one.

**A good rule:** if you would not let a new assistant put things in your calendar
unsupervised in week one, do not let this either.

---

## What it costs

| | Reading (the class) | Writing (this doc) |
|---|---|---|
| Account | none | Google Cloud project |
| Auth | a URL | OAuth consent screen |
| Setup | 5 minutes | 20–30 minutes, one-off |
| Breaks after 7 days if misconfigured | no | **yes** — see below |
| Blast radius if leaked | reads that calendar | **writes your week** |

---

## Google Calendar API

The full walkthrough is the same one Content Mate uses — Cloud project, enable the API,
consent screen, OAuth client, redirect URL copied out of n8n, credential. If you have that
pack, `GOOGLE-AUTH.md` in it applies almost unchanged; enable **Google Calendar API**
instead of Drive.

The short version:

1. **Google Cloud console** → new project
2. **APIs & Services → Library** → enable **Google Calendar API**
3. **OAuth consent screen** → *Internal* if you have Workspace, otherwise *External* and
   add yourself as a test user
4. **Credentials → OAuth client ID → Web application**
5. **Copy the OAuth Redirect URL out of n8n** — do not retype it. It must match exactly,
   protocol and port included, or you get `redirect_uri_mismatch`
6. In n8n: **Google Calendar OAuth2 API** credential, paste client ID and secret, sign in

### The trap that bites a week later

> **Leave the OAuth app in "Testing" with External user type and Google expires your
> consent and refresh tokens after seven days.**
>
> Your workflow runs on a schedule, so it simply stops about a week after you set it up,
> quietly, pointing at nothing.

**Publish the app to "In production."** It is free, it does not make anything public, and
it is the difference between a setup that lasts and one that dies next Tuesday. You will
see an "unverified app" warning once and click through it — that is expected for your own
app.

**If you chose Internal, this does not apply.**

---

## CalDAV — the option without a consent screen

If your calendar is **Apple iCloud, Fastmail or Nextcloud**, you probably do not need
Google's OAuth dance at all.

CalDAV gives read **and** write with an **app-specific password** — no consent screen, no
Cloud project, no seven-day expiry.

| Provider | Works | Notes |
|---|---|---|
| Fastmail | **yes** | App password. The cleanest of the lot |
| Apple iCloud | **yes** | App-specific password from your Apple ID |
| Nextcloud | **yes** | You already own the server |
| Google | technically | but it still wants OAuth, so there is no saving |

**If you self-host or use Fastmail, take this path.** It is less work than the Google one
and gives you more.

---

## Whichever you pick, keep three things

**Write to a separate calendar.** Not your main one. A calendar the brain owns, which you
can toggle off in one click when it gets something wrong — and it will.

**Keep the source sentence in the description.** When an event fires in four months you
will not remember why it exists. *"Because your lease says so, and here is the line"* is
the difference between trusting it and deleting it.

**Keep the `UID` stable.** Same document plus same date must produce the same `UID`, or
every run adds another copy. With write access that is not an annoying email — it is your
calendar filling up with duplicates.

---

## What does not change

**The date is still extracted, never generated.** Write access makes a fabricated date
worse, not better — it goes straight into your week without you reading it first.

If anything, the extraction rule matters more here. The proposal step was also a review
step, and you are removing it.
