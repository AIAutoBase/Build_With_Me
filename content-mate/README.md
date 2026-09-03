# Content Mate

**An optional side class in *The Brain That Runs a Company*.** One node holds the wiring
for a hundred and six. That pattern is worth more than the workflow it came in.

> **Student front door: https://aiautobase.github.io/Build_With_Me/content-mate/**
>
> That page is the reference — the cost gate, the credits, the stack named honestly, the
> traps, and the one command. The eight lessons live in the classroom; this page is what
> you keep open beside them.

**Eight lessons, in the classroom, watched at your own pace** ·
[AI Automations by Hector](https://www.skool.com/ai-automations-by-hector-8106)

> This used to be delivered live. It moved to the classroom on 2026-08-27 — the
> outline held 95 minutes of material against a 60-minute hour, nothing else in the series
> depends on it, and a nine-provider video pipeline is a bad thing to demo live.

---

## Read this before you spend a dollar

**This class is optional.** Nothing else in the series depends on it. Classes 1 through 6
build a brain that runs a business or a home, and that brain works whether or not you ever
record a video. This one bolts a mouth onto it.

It costs **$35 to $100 a month**, every month. Take it only if you are actually publishing
short-form video on a schedule.

There is no version of this where you set it up "just to have it."

**No prerequisite.** This class stands alone — you do not need Classes 1 to 6 to take it.

---

## Content Mate is Andy Hafell's work

**Content Mate v2.0.2 was created by [Andy Hafell](https://skool.com/aimate).** The
workflow is his, the original setup guide is his, and it is taught here **with his
permission**.

**Support for the workflow itself belongs in his community** — https://skool.com/aimate.
We teach it; he maintains it. Post the actual red box there, a screenshot, and what you
already tried.

Hector Diaz co-authored the configuration layer — the Airtable Setup table and the dynamic
keys and table IDs the rest of the workflow reads from it. That is what the class teaches
hardest, because the pattern outlives the workflow.

---

## The pack is not downloadable from this site, on purpose

Classes 3 and 4 host their zip here. **This one does not, and that is deliberate.**

Andy's permission covers teaching and sharing this **in AI Auto Base**. A GitHub Pages URL
is open to anyone with the link — that is not the community. So the zip lives in the pinned
Content Mate classroom section, and the installer works from the copy you already
downloaded.

**The checksum is published**, so you can still prove your copy is the real one:

```bash
sha256sum content-mate-pack-v2.zip
```

| File | SHA-256 |
|---|---|
| `content-mate-pack-v2.zip` | `6833c67f2cdb119a775d600222e4b8e032a62d8d2c3d4a202303cde1a72580c4` |

47,774 bytes · 8 files · built 2026-08-27. Also at [`downloads/SHA256SUMS`](downloads/SHA256SUMS).

---

## The one command

Run it in a folder you do not mind it writing to. It needs Claude Code.

**macOS / Linux / WSL**

```bash
curl -fsSL -o install.txt https://aiautobase.github.io/Build_With_Me/content-mate/install.txt && claude "Read install.txt in this folder and follow it exactly, from the top."
```

**Windows PowerShell**

```powershell
Invoke-WebRequest -Uri "https://aiautobase.github.io/Build_With_Me/content-mate/install.txt" -OutFile install.txt; claude "Read install.txt in this folder and follow it exactly, from the top."
```

**The first thing it does is try to talk you out of it.** It asks the three questions above
and stops if you answer no. The last cheap moment to walk away is before you open nine
accounts.

Then it verifies your download, and **proves your n8n can actually run this workflow** —
which is the check that saves the most time, because n8n Cloud cannot.

### Why it fetches a file instead of pasting the prompt inline

The prompt is 10,031 characters and `cmd.exe` caps a command line at 8,191. The inline
form works on Mac and Linux and truncates silently on Windows.

---

## What is here

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **The reference page.** The cost gate, the credits, the stack named honestly, what breaks |
| [`install.txt`](install.txt) | What the one command fetches |
| [`setup-gate.html`](setup-gate.html) | The nine accounts in order, with costs, the two slow ones, and the traps |
| [`downloads/SHA256SUMS`](downloads/SHA256SUMS) | The checksum. **The zip itself is in the Skool post** |

Both HTML pages work standalone from `file://`, make **no network requests at all**, and
reference no external resources.

---

## Where I make money on this, and where I don't

**Four of the links on the class pages are my affiliate links. The rest are not.**

| Provider | My link | What it costs you |
|---|---|---|
| **[Hostinger](https://www.hostinger.com?REFERRALCODE=DI1ROUGHBIMS)** — the VPS | **affiliate** | Nothing extra. Same price with or without my code |
| **[HostGator](https://hostgator.pvxt.net/JK3QKE)** — alternative VPS | **affiliate** | Nothing extra. *Not what this class was tested on* |
| **[Blotato](https://blotato.com/?ref=hectoret)** | **affiliate** | Nothing extra. 7-day free trial either way |
| **[ElevenLabs](https://try.elevenlabs.io/wnvu5zc9tcly)** | **affiliate** | Nothing extra. The free tier still applies |
| Airtable · Replicate · OpenAI · twitterapi.io · Google Drive · Telegram | plain links | I earn nothing |

An affiliate link tags the sign-up so the provider knows it came from me, and they pay me
a share. **You pay exactly the same price** — there is no version of these that costs you
more, and none of them unlock anything special. The plain domain is printed next to every
one of them on the setup gate.

**What an affiliate link should never do is talk you into a class you should skip.** This
one costs $35–100 every month and most people should not take it — which is why the cost
gate is the first thing on the page and the first thing the installer asks about. If the
honest answer is *"I don't publish video on a schedule"*, close the page.

Andy's own setup guide carries his Hostinger referral link. Members following his guide
directly will use his. Neither of us hides it.

---

## What you need before you start

| | |
|---|---|
| **Nine accounts** | All of them, open. [`setup-gate.html`](setup-gate.html) has them in order |
| **Two started early** | **Blotato** runs a separate approval per social account; **OpenAI** credit has to clear |
| **Self-hosted n8n** | With ffmpeg and Execute Command. **n8n Cloud cannot run this** |
| **The Airtable base** | Duplicated into *your own workspace* — an account alone is not enough |
| **The Blotato node** | Installed **from the n8n interface, before importing the workflow** |
| **A laptop** | This is a follow-along, not a webinar |

---

## The thing worth taking even if you never run this

`⚙️ Setup` is the only Airtable node with a base ID typed into it. Every other one —
twenty-five of them — resolves its base and table from that node's output:

```
$('⚙️ Setup').item.json['Airtable Base ID']
```

And the Airtable credential's access token is itself an expression:

```
{{$('⚙️ Setup').first().json['Airtable Personal Token']}}
```

The credential reads the token out of the table rather than storing it. twitterapi.io and
both ElevenLabs calls go further — their keys come straight from Setup as header
expressions, with no n8n credential at all.

**Configuration is data, not settings.** A hundred and six nodes, one place to repoint.
You move to your own Airtable by editing one node; you rotate a key by editing one cell.

That also means **the Setup table is as sensitive as a password manager.** Anyone with
access to that base has your keys.

---

## Everything here can change without warning

Nine outside companies. Each sets its own prices, API, terms and access. The social
platforms decide independently what automated posting they permit, and any of them can
close that door. Models get retired and the node returns a 404.

**This is the operating condition, not a footnote.** This pack is a snapshot of what nine
companies allowed on the day it was built. When a node goes red, the provider moved — read
their docs before you change the workflow.

---

## The series

| Class | What it adds | Where |
|---|---|---|
| 1 · Install the Brain | Claude Code, Codex, twelve skills | Aug 12 |
| 2 · Give It Senses | n8n and Postgres | Aug 19 |
| 3 · Ask Your Brain | Memory it can search | [class-03](https://aiautobase.github.io/Build_With_Me/class-03/) |
| 4 · Ears and a Voice | Telegram in, spoken answers out | [class-04](https://aiautobase.github.io/Build_With_Me/class-04/) |
| 5 · Hands and a Clock | The 7am digest, draft-don't-send | [class-05](https://aiautobase.github.io/Build_With_Me/class-05/) |
| 6 · The Graph | What connects to what | [class-06](https://aiautobase.github.io/Build_With_Me/class-06/) |
| 7 · A Clock It Can Read | Your real calendar, both directions | [class-07](https://aiautobase.github.io/Build_With_Me/class-07/) |
| **8 · Make It a Project** | History, versions, and a README | [class-08](https://aiautobase.github.io/Build_With_Me/class-08/) |
| **— · Content Mate** | **The public voice — optional, unnumbered** | **here** |

---

## License and attribution

The class material here is MIT — see [LICENSE](LICENSE).

**Content Mate v2.0.2 itself is Andy Hafell's and is not covered by that licence.** It is
shared with AI Auto Base by his permission, which is not a transfer of ownership and is not
a licence for members to resell it. `CREDITS.md` inside the pack carries the full terms.

*Class material by Hector Diaz, founder of Orbix Automation Solutions ·
[getorbix.com](https://getorbix.com)*
