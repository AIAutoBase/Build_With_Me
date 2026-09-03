# Upgrade — real Gmail drafts, via the API

**Read this if your IMAP `APPEND` probe failed.** For everyone else it is optional, and
the IMAP path is not a downgrade.

---

## Who this is for

Two groups:

1. **Your provider rejects `APPEND`.** Some do. Then IMAP is not a path for you, and this
   is.
2. **You are on Gmail and want it to feel native** — drafts that behave exactly like ones
   you started yourself, in the web client and on mobile.

If your `APPEND` probe passed and your drafts open properly in your mail client, **you do
not need this.** It costs a consent screen and buys polish.

---

## Why the class does not do this by default

**A Google consent screen is the single most common place beginners get stuck**, and Class
5 would be the first class in the series to need one.

Every class so far has held a line: *"one new signup, and it is the free kind"* — and Class
5 holds it harder by needing **no new signup at all.** The mailbox is the one from Class 2.

Trading that for nicer drafts is a real trade, and it should be yours to make rather than
mine to make for you.

| | IMAP `APPEND` (default) | Gmail API |
|---|---|---|
| New credential | **none** | OAuth client + consent screen |
| Works with | any IMAP provider | Gmail only |
| Setup time | minutes | an afternoon, the first time |
| Draft fidelity | good | **native** |
| Threading | you set the headers | handled for you |
| Breaks when | folder names differ | tokens expire and need refreshing |

---

## What it actually takes

Not a token you paste. In outline:

1. **A Google Cloud project.** Free, but it is a project, with a console.
2. **Enable the Gmail API** on it.
3. **Configure the OAuth consent screen.** For personal use, "External" plus yourself as
   a test user is enough. This is the step people abandon.
4. **Create an OAuth client ID** — type "Desktop app" is simplest.
5. **Authorise once, in a browser**, and store the refresh token.
6. In n8n, a **Gmail OAuth2** credential, then the Gmail node's **create draft** operation.

**Scope:** `gmail.compose` is enough to create drafts. **Do not grant `gmail.modify` or
full access** because a tutorial said to — a credential that can only draft cannot delete
your mail, and that limit is worth keeping.

---

## What changes in P2

Less than you would think. The reply text, the cap, the do-not-re-draft logic and the
"do not send" rule are all identical.

**What goes away:** building an RFC 5322 message by hand, the `\Draft` flag, and folder
names. The API takes a message and threading is handled for you.

**What arrives:** token refresh. An OAuth credential expires and has to renew. When it
fails, it fails **quietly** — which in this class, of all classes, is the failure mode you
are already fighting.

> Your heartbeat digest now has a second job: if the drafts stop appearing but the digest
> still arrives, the token is the first thing to check.

---

## The honest summary

The Gmail API produces better drafts. It also adds a consent screen, a token that expires,
and a hard tie to one provider.

**If IMAP works on your account, use IMAP.** It is fewer moving parts, it works with
whatever mail you have, and the drafts are perfectly good.

Come here when `APPEND` genuinely will not work — not because this sounds more
professional.
