# P7 — Let it read your mail

**What it builds:** a workflow that reads a mailbox, decides what each message is, and
files it — and the API the Inbox tab reads.

**Before you run it:** P5 is done, and you have an IMAP credential in n8n for a mailbox
you do not mind watching on screen.

---

## The table already exists

Class 2 created it and never filled it. `messages`, plus two views: `needs_followup` and
`category_counts_7d`. This is the workflow that was supposed to fill them.

```bash
docker compose exec -T postgres psql -U brain -d brain -c '\d messages'
```

If that comes back empty, run `schema.sql` from the Class 2 pack first.

---

## Read this before you point it at a mailbox

The workflow marks mail as read as it processes it. That is deliberate — it is how it
avoids doing the same message twice — and it means **pointing this at your main inbox
will march through everything unread in there.**

Use a spare mailbox. Make one if you have to. You want to be able to delete everything
in it and start again without thinking about it, and you want to be able to show your
screen without covering half of it with your hand.

---

## The prompt

```text
I have n8n in Docker with Postgres. In the `brain` database there is a table
`messages` with columns: account, message_id (UNIQUE), from_email, from_name,
subject, body_excerpt, received_at, category, reason, needs_reply, replied. There
are two views, needs_followup and category_counts_7d.

I have an IMAP credential in n8n called `Demo Mailbox`.

Build me two workflows.

WORKFLOW 1: `03 - Email sort`

  IMAP Email trigger -> normalise -> classify with a model -> file it in Postgres.

  1. IMAP trigger on INBOX, mark messages as read after processing, simple format.

  2. Normalise into the table's columns in a Code node. The IMAP node's field names
     differ between formats and versions, so do NOT assume a shape - try the likely
     names, and if a field you need is missing, throw an error that PRINTS THE KEYS
     that were actually present. "Everything is null in the database" is not a
     debuggable message.

     The sender may arrive as "Name <address>", or as a parsed object, or as a bare
     address. Handle all three.

     If there is no message_id, build a stable one from sender, subject and date.
     Postgres allows many NULLs in a UNIQUE column, so a null message_id means every
     re-run inserts the same mail again.

     Trim the body to a few hundred characters. The classifier does not need the
     whole thread and the dashboard shows one line.

  3. Classify with one HTTP Request. Ask for ONLY a JSON object:
       {"category": "lead|client|invoice|other", "needs_reply": true|false,
        "reason": "six words at most"}

     lead    = not yet a customer, asking about work or pricing
     client  = an existing customer, about work already underway
     invoice = a bill, statement, receipt or payment notice
     other   = anything else, including newsletters and automated notices

     needs_reply is true ONLY when a person must actually respond. A thank-you with
     no question and an automated notice are both false.

  4. Parse the answer in a Code node. Strip a code fence first - models wrap JSON in
     one about a third of the time whatever you tell them.

     If the output will not parse, or the category is not one of the four, do NOT
     quietly fall back to "other". That files an unreadable answer next to real ones
     and it looks identical in the dashboard. File it as "unclassified" with the
     reason, so it is visible and countable and obviously wrong on sight.

  5. Insert into messages, ON CONFLICT (message_id) DO UPDATE so re-running
     re-classifies instead of duplicating.

WORKFLOW 2: `02 - Dashboard API`

  Webhook GET on path `brain`, one Postgres query, one Respond node.

  Return one object with three keys - counts, followup, latest - using json_agg with
  coalesce so an empty table gives me [] and not null. Three separate Postgres nodes
  and a merge would work too and is three times the surface area for the same answer.

  Respond node needs Access-Control-Allow-Origin: *.

Then build the Inbox tab in dashboard/inbox.html: counts across the top, a "needs a
reply" table, and a "latest" table with a coloured category pill.

Give `unclassified` its own tile, but ONLY when the count is above zero - a tile that
always says 0 is a tile people stop seeing.

When it is built, run it and show me every message with what it decided and why, so I
can check its work myself.
```

---

## Check its work, do not assume it

This is the step people skip. The workflow will run, rows will appear, and the counts
will look plausible. Read them anyway:

```bash
docker compose exec -T postgres psql -U brain -d brain -c \
  "SELECT category, needs_reply, from_name, left(subject,40), left(reason,30) FROM messages ORDER BY category;"
```

You are looking for the ones it got wrong, and there will be some. When I ran this with a
local model on eleven messages it got ten right — it filed a happy customer saying thank
you as `other` instead of `client`. Defensible, since nothing was needed from me, and
still wrong.

That number is worth knowing about your own mail. A classifier you have never checked is
a classifier you do not know the accuracy of, and the dashboard looks exactly as
confident either way.

## If it goes wrong

| What you see | What it means |
|---|---|
| Trigger never fires | Nothing unread in the mailbox. Send yourself something. |
| `A 'json' property isn't an object` | A Code node in "run once for each item" mode returned an array. It wants one object. |
| Every row `unclassified` | The model is not returning JSON. Look at the raw output before blaming the parser. |
| Rows have nulls everywhere | The normalise step guessed the wrong field names. That is what the error in point 2 is for. |
| Inbox tab empty, no error | `02 - Dashboard API` is not Active. |
