# P2 — The hands

**Paste this whole file into Claude Code.**

**You end with:** a reply your brain wrote, sitting in your Drafts folder, **unsent**.

---

## Before you start

**Run the `APPEND` probe first.** `verify.sh` does it, and `PREWORK.md` explains why.

If your server will not accept an `APPEND`, this prompt cannot work and you want to know
that before you build eight nodes. `docs/UPGRADE-gmail-api.md` is the path for you.

---

```text
Build me a workflow in n8n that writes a reply to an incoming message and puts it in my
Drafts folder WITHOUT sending it.

I am a beginner. Explain each step before you take it, and stop rather than guess.

## Step 0 - Prove APPEND works before building anything

Do not write eight nodes against an assumption.

Connect to my IMAP server and:
  1. list my folders, and tell me the EXACT name of the drafts folder
  2. APPEND a throwaway message into it, with the \Draft flag set
  3. confirm it appears
  4. delete it again

If APPEND is rejected, STOP. Tell me plainly that my provider does not allow it, and
point me at docs/UPGRADE-gmail-api.md. Do not work around it and do not fall back to
writing the draft into Postgres - a draft in a database is not a draft, it is a row.

Tell me the exact folder name you found. Write it down somewhere I can see it.

## Step 1 - Pick ONE message to reply to

Not a batch. One.

From my Class 2 rows, find something that plausibly needs a human reply - a lead, a
question, an enquiry. Show it to me and let me confirm before you draft anything.

I want to see what it is replying to, because I am about to judge the reply.

## Step 2 - Draft the reply

One model call. Rules for the prompt you write:

  - It is a DRAFT for me to edit, not a finished email. Write it that way.
  - Do not invent facts. Do not promise a price, a date, an availability or a capability
    that is not in the original message or in my documents.
  - If something is needed to answer properly and is not available, leave an obvious
    placeholder rather than guessing. I would rather fill a blank than find a lie.
  - Match the length of what it is replying to. A three-line question does not need
    eight paragraphs.
  - Plain, direct, no filler openings.

Show me the draft text before you put it anywhere.

## Step 3 - Build a real email, not a body string

An IMAP APPEND takes a complete RFC 5322 message. Not a body.

It needs at minimum:
  From:      me
  To:        whoever I am replying to
  Subject:   Re: <their subject>
  Date:      a properly formatted date
  In-Reply-To: and References: - their Message-ID, so it threads

Explain to me what happens if In-Reply-To is missing: the draft is a NEW email that
happens to say "Re:", and it will not thread in my mail client. It looks almost right,
which is worse than looking wrong.

Show me the raw message you built before you append it.

## Step 4 - APPEND it, with the flag

Append to the exact folder name from Step 0, and SET THE \Draft FLAG.

Tell me what happens if that flag is missing: the message appears in the folder as
RECEIVED MAIL. It sits there looking like something a person sent me. Some clients will
not even offer to edit it.

That is the most confusing five minutes in this class and I want to be warned before,
not after.

## Step 5 - Open it in a REAL mail client

Not in n8n. Not in a log. On my phone or in my laptop's mail app.

Then tell me what to check:
  - it is in Drafts, not the inbox
  - it opens as an editable draft
  - it threads under the original message
  - the To: address is right
  - pressing send would actually send it

Wait for me to confirm. If it is wrong in the client, it is wrong, no matter what n8n
reported.

## Step 6 - Now let me judge it

Ask me straight:

  "Would you have sent that, as written?"

Then, depending on my answer:
  - if yes, ask what I would have changed anyway
  - if no, ask what is wrong with it - tone, facts, length, or that it should not have
    replied at all

Whatever I say, write it down as notes for improving the prompt. That feedback loop is
the actual product here. The workflow is easy; getting the drafts good takes weeks.

## Step 7 - Do NOT offer to auto-send

Do not add a send node. Do not suggest one. Do not add a "if confidence is high, send"
branch.

If I ask for one, tell me this first, and then do what I decide:

  The first thing my brain does TO the world rather than FOR me should not be able to
  embarrass me. Not because the model writes badly - it writes fine. Because I have not
  earned the right to trust it yet, and neither has it. Draft-don't-send is how I find
  out whether it would have been right, at zero risk, for as long as I need.

  Moving to auto-send is a decision to make with evidence, after reading a hundred
  drafts on my own account. It is not a default and it is not a convenience feature.

## Step 8 - Wire it to the schedule, carefully

Only once the drafts are good.

  - it draws from the same overnight window as the digest
  - it does not re-draft something it already drafted - show me how you prevent that
  - there is a CAP on how many drafts it writes per run

That cap matters. A loop with no limit meets a busy night and writes ninety drafts into
my Drafts folder, and I will delete all of them without reading one.

## Ground rules

- Never claim something worked without output showing it worked. "n8n says success" is
  not the same as "the draft is in my Drafts folder" - check the folder.
- Never send an email. Not once, not as a test.
- Never write my mailbox password into a file. It belongs in the n8n credential.
- Do not modify my Class 2 workflow, my schema, or my tables.
- If APPEND fails, stop and say so. Do not substitute a database row for a draft.
```

---

## The argument, in one paragraph

**The first thing your brain does *to* the world rather than *for* you should not be able
to embarrass you.** Not because the model writes badly — it writes fine. Because you have
not earned the right to trust it yet, and neither has it. Draft-don't-send is how you find
out whether it would have been right, at zero risk, for as long as you need.

## The two that cost the most time

**No `\Draft` flag** → the message shows up as *received mail*. It looks like someone sent
it to you. Some clients will not even let you edit it.

**No `In-Reply-To`** → the draft does not thread. It is a new email that happens to start
with "Re:", which looks almost right, and almost right is worse than wrong.

## If it goes wrong

| What you see | What it means |
|---|---|
| `Mailbox doesn't exist` | Wrong folder name. `Drafts` versus `INBOX.Drafts`. |
| A new `Drafts` folder your client never shows | You created one by writing to the wrong name. Your drafts are real and invisible. |
| It appears as received mail | The `\Draft` flag was not set. |
| The draft does not thread | `In-Reply-To` and `References` are missing. |
| `APPEND` returns `NO` | Your provider does not permit it. See `docs/UPGRADE-gmail-api.md`. |
| Ninety drafts one morning | No cap on the loop. |
