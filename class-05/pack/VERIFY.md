# Class 5 — does it actually work?

**This class needs a different kind of checking than the others**, and that is the whole
reason this file is worth reading rather than skimming.

Every previous class fails loudly. A webhook 404s, a voice note comes back as static, a
graph renders with placeholder names — you find out immediately.

**A digest that stops firing sends you nothing, and nothing looks exactly like a quiet
week.** So the question here is never *"did it work?"*. It is:

> **How would I know if it stopped?**

---

```bash
bash verify.sh
```

Covers levels 0 and 1. The rest need your eyes, and one of them needs tomorrow.

---

## Level 0 — the ground

- [ ] Containers running
- [ ] **Class 2 is still writing rows**, and the newest is recent
- [ ] `GENERIC_TIMEZONE` on the n8n container is **your** timezone
- [ ] The IMAP `APPEND` probe passed, and you know your Drafts folder's exact name

**If Class 2's newest row is weeks old, stop.** You will build a digest that reports zero
every morning and looks perfectly healthy doing it.

---

## Level 1 — the digest runs by hand

- [ ] Run the workflow manually. An email arrives.
- [ ] The counts in it **match the table**, not the model's arithmetic
- [ ] It is **one screen or less**

Then the question that decides whether you keep it:

- [ ] **Read it out loud. Would you be glad this arrived at 7am?**

If it is noise with a timestamp, fix it now. A digest you delete unread is worse than no
digest, because you are training yourself to ignore something your own brain sends you.

---

## Level 2 — the empty case, which is the important one

Force the query to return nothing — narrow the window, or run it on a genuinely quiet
morning.

- [ ] **An email still arrives**, saying in plain words that nothing came in

> **This is the single most important check in the class.**
>
> If your digest only speaks when it has news, you cannot tell the difference between a
> quiet week and a workflow that died three weeks ago. The empty digest is the heartbeat.

If it sent nothing, go back to P1 and add the branch. Do not talk yourself out of it
because empty emails are annoying — annoying beats ambiguous.

---

## Level 3 — the draft is really a draft

Not in n8n. Not in a log. **In a real mail client, on your phone or your laptop.**

- [ ] It is in **Drafts**, not the inbox
- [ ] It opens as an **editable** draft
- [ ] It **threads** under the original message
- [ ] The `To:` address is correct
- [ ] Pressing send would actually send it

> **If it appears as received mail**, the `\Draft` flag was not set. If it does not
> thread, `In-Reply-To` is missing — it is a new email that happens to say "Re:", which
> looks almost right, and almost right is worse than wrong.

Then judge it:

- [ ] **Would you have sent it as written?**

Write down what you would have changed. That feedback is the actual product — the workflow
takes an hour, getting the drafts good takes weeks.

---

## Level 4 — nothing was sent

- [ ] **Check your Sent folder. It is empty of anything this wrote.**

Do this deliberately, once, rather than assuming. There is no send node and there should
not be — but the whole promise of this class is that a human presses send, and a promise
you have not checked is a hope.

---

## The check that actually proves it: prove it fires tomorrow

Everything above proves it ran **today, because you ran it**. That is not the same thing
at all.

- [ ] The workflow shows **Active**, not merely saved
- [ ] n8n shows a **next execution time**, and it is the hour you intended
- [ ] That hour is right **in your timezone**, not the container's

Then, tomorrow:

- [ ] **An email arrived without you doing anything**

And the one people skip:

- [ ] **Deactivate it and look at your inbox.** Confirm that from where you sit, a dead
      workflow and a quiet morning are identical.
- [ ] Turn it back on.

You want to have seen that, because it is the thing you are actually guarding against.

---

## Level 5 — a week later

Come back to this. Genuinely.

- [ ] It has run **every day**, and you can show that — executions, or seven emails
- [ ] You have **read** them, not just received them
- [ ] At least one draft was good enough to send after a small edit
- [ ] You still want it

If you stopped reading it after three days, the digest is wrong, not you. Change what is
in it, or change the time, or accept that it was not worth building and say so out loud in
the thread. That is a useful result too.

---

## What this does not verify

- **That the drafts are good.** Only you can judge that, and it takes weeks of reading.
- **That Class 2's classification is correct.** This summarises those rows faithfully. If
  the classifier is wrong, you get a faithful summary of wrong data.
- **That it will keep running.** Nothing here can prove that. The empty-digest heartbeat
  is the closest you get, which is exactly why it is not optional.
