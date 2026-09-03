# Class 5 — when it goes wrong

Ordered by how long it takes you to notice. **The first one you may not notice at all.**

---

# 1. The silent failure — read this even if nothing is wrong

## Your digest stopped arriving and you did not notice

Every other class in this series fails loudly. This one fails by going quiet, and **quiet
looks exactly like a week where nothing came in.**

| Cause | How to tell |
|---|---|
| The workflow was deactivated | n8n shows it inactive. Nothing else does. |
| n8n restarted and the workflow did not come back | Check Active state, not the last execution |
| The query returns nothing and the workflow only sends when it has news | **This is the design error.** Fix it below |
| Class 2 stopped writing rows | The digest is fine; its source died |
| The container's clock is wrong | It is firing, at the wrong hour, and you sleep through it |

### The fix, and it is a design decision not a patch

**Make the digest always send, even when there is nothing to report.**

An email that says *"nothing came in overnight"* is a heartbeat. Without it, silence is
ambiguous — and ambiguous silence is indistinguishable from a dead workflow.

> **A digest that only speaks when it has news is indistinguishable from a broken one.**

If empty emails annoy you, that is a real objection with a real answer: send a weekly
"your digest ran 7 times" line instead. What is not an answer is having no signal at all.

---

# 2. Timezone — it is firing, just not when you think

## The email arrives at 2am

n8n's schedule is interpreted in the container's timezone, and a container with no
timezone set is on UTC.

```bash
docker compose exec -T n8n printenv GENERIC_TIMEZONE
date
```

If `GENERIC_TIMEZONE` is empty, set it, and restart the container. **n8n reads environment
variables at start and never again** — same trap as Class 4's bot token.

This one is nasty because nothing is broken. The workflow runs, the email sends, the logs
are green. It just happens while you are asleep.

---

# 3. IMAP and drafts

## `APPEND` returns `NO`

Your provider does not permit it on this account. Not something you can work around —
see `docs/UPGRADE-gmail-api.md`.

**Do not substitute a Postgres row for a draft.** A draft in a database is a row. Nobody
sends from a database, and the whole point of the class is that a human presses send.

## `Mailbox doesn't exist`

The folder name is wrong. There is no universal name:

| Server | Usually |
|---|---|
| Many IMAP servers | `Drafts` |
| Courier / some cPanel hosts | `INBOX.Drafts` |
| Gmail via IMAP | `[Gmail]/Drafts` |
| Localised servers | `Borradores`, `Entwürfe`, … |

`verify.sh` lists yours and prefers the server's own `\Drafts` special-use flag, which is
the only answer that is not a guess.

## A `Drafts` folder appeared that your mail client never shows

**You created it** by appending to a name your server does not use. The drafts are real
and they are going somewhere you will never look.

Delete the folder you created, find the real name, and append there.

## The message appears as received mail, not a draft

**The `\Draft` flag was not set.**

Without it the message is just a message that happens to live in the Drafts folder. It
looks like something a person sent you. Some clients will not even offer to edit it.

This is the most confusing five minutes in the class, and the fix is one flag.

## The draft does not thread under the original

`In-Reply-To` and `References` are missing. Without them it is a **new** email that
happens to start with `Re:` — which looks almost right, and almost right is worse than
wrong because you will not question it.

Both headers take the original message's `Message-ID`.

## The draft renders strangely, or the date is wrong

`APPEND` takes a complete RFC 5322 message, not a body string. It needs at minimum
`From:`, `To:`, `Subject:`, `Date:` and a blank line before the body.

A missing `Date:` makes some clients show today, some show 1970, and some show nothing.

## `NO [AUTHENTICATIONFAILED]`

The username or password is wrong — **or your provider needs an app-specific password**
rather than your account password. Gmail and several others do.

If reading has been working since Class 2 and writing suddenly fails, it is unlikely to be
the password. Check the folder name first.

---

# 4. The digest content

## It says "0 items" every morning

The digest is working. **Its source is not.** Class 2 has stopped writing rows.

```sql
SELECT COUNT(*), MAX(created_at) FROM <your class 2 table>;
```

If the newest row is weeks old, fix Class 2. Nothing in this class can help.

## The counts in the text disagree with the table

**You let the model count.** Models are bad at counting and confidently wrong about it.

Counts come from the SQL. Pass the model the numbers and let it write prose around them —
never ask it to tally.

## The summary invents urgency that is not in the data

Tighten the prompt: summarise only what is in the rows, do not infer, and say so when a
row is ambiguous rather than picking a side.

This is Class 3's refusal lesson again. A digest that dramatises a quiet night is a digest
you will stop trusting, and then stop reading.

## It is too long and you have stopped reading it

Cap it hard. **A digest longer than one screen is a digest you skim**, and a digest you
skim is one you will eventually delete unread.

That matters more than it sounds: you are training yourself to ignore something your own
brain sends you.

---

# 5. Drafting

## Ninety drafts appeared one morning

No cap on the loop. It met a busy night and wrote one for everything.

Cap the number per run. You will delete ninety drafts without reading one, and you will
stop trusting the whole thing.

## It re-drafted things it already drafted

Nothing marks a row as handled. Track what has been drafted — a column, a flag, a
timestamp — and skip those. Whatever you use, it must survive a restart.

## The drafts are bad

Expected, at first. That is exactly why they are drafts.

Read ten and write down what is wrong: tone, length, invented facts, or that it should not
have replied at all. Feed that back into the prompt.

**Getting the drafts good takes weeks. The workflow takes an hour.** Anyone who tells you
otherwise has not run one on their own mail.

---

# 6. Do not do this

## "Can I make it send automatically once the drafts are good?"

You can. Think about it properly first.

**The first thing your brain does *to* the world rather than *for* you should not be able
to embarrass you.** Not because the model writes badly — it writes fine. Because you have
not earned the right to trust it yet, and neither has it.

If you go there, go with evidence: a hundred drafts you have read, on your own account,
and a narrow category rather than everything. And keep a way to see what it sent.

It is a decision to make on purpose. It is not a convenience feature.

---

## Posting for help

Post the **exact error text**, not a description. Include what you ran, the full error,
and whether the workflow was Active.

**Never post your mailbox password.** If you paste one by accident, change it immediately.
