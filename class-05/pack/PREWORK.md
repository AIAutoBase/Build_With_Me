# Class 5 — do this before the hour

**Time: about ten minutes. Cost: nothing, and no new account.**

Class 5 gives your brain a clock and a pair of hands: a digest at 7am, and replies it
writes but does not send.

There is only one thing to set up in advance, and it is a **probe you have to actually
run**. Everything else you already have from Class 2.

---

## Before you begin

| You need | Check |
|---|---|
| The starter pack done | `bash verify.sh` says **Ready** |
| **Class 2 actually classifying mail** | There are rows from the last few days |
| Your Class 2 mailbox credentials | The same ones — for reading *and* writing |
| A real mail client on your phone or laptop | You have to open the draft somewhere other than n8n |

**Class 2 has to be writing rows.** This class summarises them. If nothing is writing,
you will build a digest that reports zero every morning and looks perfectly healthy doing
it.

Check you have something to summarise:

```sql
SELECT COUNT(*), MAX(created_at) FROM <your class 2 table>;
```

If the newest row is from three weeks ago, fix Class 2 before Wednesday.

---

## Step 1 — Confirm the mailbox is reachable both ways

You have been **reading** mail since Class 2. This class also **writes** to it, and those
are different permissions on some servers.

Find your IMAP settings — the same ones your Class 2 workflow uses:

- host, e.g. `imap.yourprovider.com`
- port, usually `993` with SSL
- username and password

**Do not put them anywhere new.** They already live in an n8n credential; that is where
they stay.

---

## Step 2 — The probe you actually have to run

This is the one thing that cannot be assumed, and the whole second half of the class
depends on it.

**Can your mail server accept an `APPEND`?** That is the IMAP command that puts a message
*into* a folder — the difference between reading your mail and writing a draft into it.

The pack ships `verify.sh`, which probes it properly:

```bash
bash verify.sh
```

It connects, lists your folders, and tries a real `APPEND` of a throwaway message into
your Drafts folder — **then deletes it again.**

### Why a probe and not a checklist

Because *"my mail provider supports IMAP"* tells you nothing about whether `APPEND` works
on your account, into that folder, with that flag. Three things have to be true at once
and only one of them is on any provider's feature page.

> **A check that cannot fail is not a check.** If your verification of "can I write a
> draft?" is reading a support article, you have not checked anything.

### What the probe tells you

| Result | What it means |
|---|---|
| **`APPEND` succeeded, message appeared, then deleted** | You are ready |
| **Folder not found** | Your Drafts folder is called something else — write down the real name |
| **`APPEND` rejected** | Your provider does not allow it. See `docs/UPGRADE-gmail-api.md` |
| **It appeared as received mail, not a draft** | The `\Draft` flag was not set. That is fixable and the class covers it |

---

## Step 3 — Find out what your Drafts folder is really called

This costs people twenty minutes and it is one command.

There is no universal name. It is `Drafts` on some servers, `INBOX.Drafts` on others, and
localised on a few — `Borradores`, `Entwürfe`.

`verify.sh` lists them. Write down the exact string, including capitals:

```
My Drafts folder is called: ______________________
```

If your workflow writes to `Drafts` and your server calls it `INBOX.Drafts`, you get a
folder-not-found error, or worse, **a brand new folder called `Drafts` that your mail
client never shows you.** Your drafts go somewhere real, and you never see them.

---

## Step 4 — Decide what you actually want at 7am

Not a technical step, and the one that decides whether you keep using this.

**A digest you delete unread is worse than no digest**, because you taught yourself to
ignore something your brain sends you.

Before the hour, decide:

- What would make you glad it arrived? *"Three new leads, one invoice, one thing that
  needs a reply today."*
- What would make you start ignoring it? *"Forty-one items processed."*
- What time do you actually read email? If it is 9am, do not send it at 7am.

Bring an answer. We build it around yours, not mine.

---

## Step 5 — Know what "working" will look like tomorrow

Read this now so it is not a surprise later.

**This class fails silently.** A digest that stops firing sends you nothing, and nothing
looks exactly like a quiet week.

So when we build it, we build it to **always send** — even when the answer is *"nothing
came in overnight."*

That sounds like noise and it is not. **A digest that only speaks when it has news is
indistinguishable from a dead one.** The empty digest is the heartbeat.

---

## What to have ready on the day

- [ ] Class 2 is writing rows, and the newest is recent
- [ ] `bash verify.sh` passes, including the **`APPEND` probe**
- [ ] You know the **exact name** of your Drafts folder
- [ ] A mail client where you can open a draft — phone or laptop
- [ ] An answer to *"what would make you glad this arrived at 7am?"*

---

## If something goes wrong

| What you see | What it means |
|---|---|
| `NO [AUTHENTICATIONFAILED]` | Wrong username or password — or your provider needs an app-specific password, not your login one |
| `Mailbox doesn't exist` | The folder name is wrong. Use the exact string from `verify.sh` |
| `APPEND` returns `NO` | Your provider does not permit it on this account. See `docs/UPGRADE-gmail-api.md` |
| The test message appears as **received mail** | The `\Draft` flag was not set |
| Connection times out | Port or SSL wrong. `993` with SSL is the usual pair |

Post the exact error text in the class thread. Never post your password.

---

*The Brain That Runs a Company — Class 5. Orbix Automation Solutions.*
