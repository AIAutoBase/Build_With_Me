# Class 8 — do this before the hour

**Time: about five minutes. Cost: nothing — no account, no service, no card.**

This is the cheapest pre-work in the series. Two commands and one honest look at what you
have.

---

## Step 1 — Is git installed?

```bash
git --version
```

Most boxes already have it. If not:

| | |
|---|---|
| Debian / Ubuntu | `sudo apt update && sudo apt install git` |
| macOS | `xcode-select --install` |
| Windows | you want this on the **brain machine**, not the laptop |

---

## Step 2 — Does git know who you are?

```bash
git config user.name
git config user.email
```

If either is blank, your first commit fails with *"Please tell me who you are"*:

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

**These go into every commit permanently**, so use the ones you want on the record.

---

## Step 3 — Run the preflight

From the pack:

```bash
bash verify.sh ~/brain      # or wherever your brain folder actually is
```

It checks git, looks at what you have, and — **if the folder is already a repo** — searches
its **history** for secrets.

> ### That last check is the one to pay attention to
>
> If you have ever committed a `.env`, **`git status` will never mention it again.** You
> can delete the file, add it to `.gitignore`, commit, and have a completely clean working
> tree — while every earlier commit still contains the key.
>
> `verify.sh` looks for exactly that. If it finds something, read section 4 of
> `TROUBLESHOOT.md` before class rather than during it.

---

## Step 4 — Look at what you actually have

Not a command. Two minutes of looking.

Open your brain folder and ask:

- **What is in here that I could not rebuild?** The exported workflows, the dashboard, the
  prompts. That is what version control is for.
- **What is in here that has a value in it?** `.env` first. Any credentials JSON, any note
  with a token pasted into it.
- **What is enormous?** Video renders, database directories. Git is bad at these and they
  are not source.

Bring one answer to the hour:

```
The thing I would most hate to lose: ______________________
```

---

## Step 5 — Know what you are walking into

Read this now so the class makes sense.

**The whole hour rests on one uncomfortable fact:** four times across Classes 2, 3 and 4,
this series told you never to *overwrite* `.env`, because it holds the key that decrypts
every credential n8n has saved.

**It never once told you not to commit it.**

That is the gap this class closes, and it closes it *before* Class 9 puts an agent with
shell access into your dashboard.

---

## What to have ready on the day

- [ ] `git --version` prints something
- [ ] `git config user.name` and `user.email` are set
- [ ] `bash verify.sh ~/brain` run, and you have read the output
- [ ] You know whether your folder is **already** a repo — and if so, whether `.env` is in
      its history
- [ ] An answer to *"the thing I would most hate to lose"*

---

## If something goes wrong

| What you see | What it means |
|---|---|
| `git: command not found` | Not installed. See step 1 |
| `Please tell me who you are` | Step 2 |
| `verify.sh` says `.env` is in history | Read `TROUBLESHOOT.md` section 4 **before** class. The answer is to rotate, not to rewrite |
| `verify.sh` says the folder is not a repo | Perfect. That is the normal starting point |
| You are not sure which folder is "the brain" | The one with `docker-compose.yml` and your workflows in it |

Post the exact error in the class thread. **Never paste a key, a token or your `.env`** —
and if you do, rotate it rather than deleting the message.

---

*The Brain That Runs a Company — Class 8. Orbix Automation Solutions.*
