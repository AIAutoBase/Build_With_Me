# Class 5 — Hands and a Clock

**The Brain That Runs a Company, Part 5.** Your brain stops waiting for you to ask:
a digest at 7am, and replies it writes but does not send.

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-05/**
>
> That page is the show notes. It recaps Classes 1–4, carries the one-line install, and is
> what you follow along with during the hour.

Wednesday 9 September 2026, 11:00 AM ET · Skool live room ·
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106)

---

## The one command

Run it **on the machine your brain runs on** — the one with Docker and n8n.

**macOS / Linux / WSL**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/class-05/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/class-05/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

It downloads the pack, verifies the checksum, and runs the one probe that decides whether
half this class is even possible on your mail provider.

**No new signup.** The mailbox is the one from Class 2; the model key is the one from
Class 1.

---

## The probe found a bug in itself before it found an answer

`prompts/P2-draft.md` writes a reply into your Drafts folder using an IMAP `APPEND`. That
is the right approach — no new account, no consent screen, reuses your Class 2 mailbox.

This pack shipped as `class-05-hands-pack-DRAFT.zip` until **5 September 2026**, because
nobody had run that `APPEND` against a real mail server. It has now been run: accepted
into `INBOX.Drafts` on a cPanel/Dovecot mailbox, found in the folder by a search, and
deleted again.

**The first run failed, and the fault was ours, not the mail server's.** `verify.sh` read
the folder name wrong — it assumed a `LIST` response quotes the mailbox name, which Gmail
does and Dovecot does not — and sent a malformed `APPEND`. The server answered `BAD`,
which reads exactly like a provider refusing you. It would have sent people to the Gmail
API to work around a bug in our own script. Fixed, and covered by a test carrying the
real server response.

**Gmail was run the same day, and it passes too.** `APPEND` into `[Gmail]/Drafts`,
accepted, confirmed and cleaned up — on an account that had never been connected to
anything. That is the provider Class 2's `.env.example` configures, so it is the one that
mattered. It also corroborated the fix: the test carried a Gmail fixture as a
*prediction*, and the live server returned exactly that shape.

**The one thing that trips people on Gmail is not `APPEND`.** Google shows an app password
as four groups of four — `abcd efgh ijkl mnop` — and IMAP rejects it with the spaces in.
Strip them: 16 characters.

**`prompts/P1-digest.md` — the whole clock half — does not touch any of this.** If `APPEND`
does not work for you, you still have a working morning digest, which was always the more
useful of the two, and `docs/UPGRADE-gmail-api.md` is the path if you want P2 anyway.

> The build script **refuses** to produce a non-draft pack until someone records a real
> probe result — and a file created just to silence the guard does not count.

---

## This class fails differently, and that is the point

Every other class in this series fails **loudly**. A webhook 404s, a voice note comes back
as static, a graph renders with placeholder names.

**A digest that stops firing sends you nothing. And nothing looks exactly like a quiet
Tuesday.**

So it is built to **always send**, even when the answer is *"nothing came in overnight."*
That is not noise — it is the heartbeat. A digest that only speaks when it has news is
indistinguishable from a broken one.

Which also changes what verification means here. The question is never *"did it work?"* —
it is **"how would I know if it stopped?"**

---

## What is here

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **The show notes.** Classes 1–4 recap, the install, both prompts, the silent-failure problem |
| [`install.txt`](install.txt) | What the one command fetches |
| [`setup-gate.html`](setup-gate.html) | The mailbox probe, your Drafts folder name, the timezone check |
| [`downloads/`](downloads/) | The pack zip and `SHA256SUMS` |
| [`pack/`](pack/) | The pack unzipped — every file readable here without downloading |

Both HTML pages work standalone from `file://`, make **no network requests at all**, and
reference no external resources.

---

## What you need before this class

| | How to check |
|---|---|
| **Class 2 writing rows** | `SELECT COUNT(*), MAX(created_at)` — and the newest must be recent |
| **IMAP `APPEND` probed** | `bash verify.sh` with the three `BRAIN_IMAP_*` variables set for one run |
| **Your Drafts folder name** | `Drafts`, `INBOX.Drafts`, `[Gmail]/Drafts` — there is no universal one |
| **n8n's timezone is yours** | `docker compose exec -T n8n printenv GENERIC_TIMEZONE` |
| **A real mail client** | You have to open the draft somewhere other than n8n |
| **An answer to "what do I want at 7am?"** | We build it around yours |

**If Class 2's newest row is weeks old, fix that first.** You will otherwise build a digest
that reports zero every morning and looks perfectly healthy doing it.

---

## Why it drafts instead of sending

**The first thing your brain does *to* the world rather than *for* you should not be able
to embarrass you.**

Not because the model writes badly — it writes fine. Because you have not earned the right
to trust it yet, and neither has it. Draft-don't-send is how you find out whether it would
have been right, at zero risk, for as long as you need.

Moving to auto-send is a decision to make **with evidence**, after reading a hundred
drafts on your own account. It is not a default, and this pack will not make it one for
you — there is no send node in P2.

---

## Checksums

```bash
cd downloads && sha256sum -c SHA256SUMS
```

| File | SHA-256 |
|---|---|
| `class-05-hands-pack.zip` | `3260e3fd4864982889945d901c64171559d7b2b6324e72b0088b58a1d503afc4` |

25,144 bytes · 9 files. This pack pins its zip timestamps, so the same sources always
produce the same hash — a mismatch means the sources moved, not that the clock did.

---

## The series

| Class | What it adds | Where |
|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | Aug 12 |
| 2 · Give It Senses | n8n and Postgres | Aug 19 |
| 3 · Ask Your Brain | Memory it can search | [class-03](https://aiautobase.github.io/Build_With_Me/class-03/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04](https://aiautobase.github.io/Build_With_Me/class-04/) |
| **5 · Hands and a Clock** | **The digest, and draft-don't-send** | **here** |
| 6 · The Graph | What connects to what | [class-06](https://aiautobase.github.io/Build_With_Me/class-06/) |
| 7 · A Clock It Can Read | Your real calendar, both directions | [class-07](https://aiautobase.github.io/Build_With_Me/class-07/) |
| **8 · Make It a Project** | History, versions, and a README | [class-08](https://aiautobase.github.io/Build_With_Me/class-08/) |
| — · Content Mate | The public voice — optional, in the classroom | [content-mate](https://aiautobase.github.io/Build_With_Me/content-mate/) |

---

## License

MIT — see [LICENSE](LICENSE).

*Orbix Automation Solutions · [getorbix.com](https://getorbix.com)*
