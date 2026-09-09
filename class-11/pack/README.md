# Class 11 — Clara Answers The Phone

**The Brain That Runs a Company, Part 11.**

Your brain gets a phone number. It answers when someone calls, it can text, and it answers
from the memory you built in Class 3 and the documents you ingested in Class 10.

---

## Read this first: the zip says DRAFT and it means it

**No call has been placed. No latency has been measured. No number has been bought.**

The five-stage latency budget in the class material is a **budget**, not a measurement. It
is labelled that way everywhere it appears. Build prompt 14 instruments all five stages and
`VERIFY.md` item 12 fills them in — and until that happens, the numbers are an estimate
written by somebody who has not yet made the call.

The DRAFT in the filename comes off when item 12 is done. There is precedent: Class 4
shipped a DRAFT zip for the same reason.

## And it costs money

First class in this series that does, every month, whether or not anybody calls:

| | |
|---|---|
| A phone number | roughly 1 to 2 US dollars a month, per number, forever |
| Inbound voice | per minute |
| Outbound voice | per minute, higher |
| SMS | per message, both directions |
| Speech to text | per minute of audio |
| Text to speech | per character |

The exact figures vary by country and you will see yours when you buy the number, in class.
If you do not want a recurring bill, the class is still worth watching and everything except
the number works from the dashboard.

---

## What is in the pack

| File | What it is |
|---|---|
| `call-scope.mjs` | The **reference call handler**, reduced to the part that matters: the zone constant and the order of operations. Makes no network call |
| `no-commitments.mjs` | The outbound commitment filter. English and Spanish |
| `commitment-tests.json` | Twenty phrases it must catch, five it must not. The five matter more |
| `check-call-scope.mjs` | The offline checker. **The only file here the installer runs.** Places no call, sends no text |
| `greeting-standard.txt` | The greeting transcript |
| `greeting-recorded.txt` | The same, plus the recording disclosure |
| `GREETINGS.md` | Why these are files and not a system prompt |
| `make-greeting.mjs` | Renders the transcripts into audio with **your** voice and **your** key. The only file that makes a network request or costs anything |
| `TROUBLESHOOT.md` | The five traps, symptom first |
| `prompts/BUILD-PROMPTS.md` | The seventeen build prompts |

## What the pack does NOT do

- It does not buy, provision or release a phone number.
- It does not open a tunnel.
- It does not place a call or send a message.
- It does not ship audio. See below.

## Why there is no audio in this zip

The greetings ship as **text plus a renderer**, not as WAV files. Two reasons, and the
second is the real one:

1. The voice should be yours. A pack that hands everyone the same rendered voice teaches
   you to run somebody else's assistant.
2. A cloned brand voice in a public zip is a cloned brand voice anybody can use as their
   own assistant, forever, with no way to withdraw it.

```bash
node make-greeting.mjs --dry-run --voice <id>     # spends nothing
node make-greeting.mjs --provider elevenlabs --voice <id>
```

It reads your key from the environment, refuses to run without it rather than falling back
to something free and different, and never writes a key anywhere.

## The one rule that is not negotiable

**Clara says she is an AI in the first sentence, and it is a recorded file.**

Not a system-prompt instruction. A prompt instruction is a request, and a caller asking
*"wait, am I talking to a real person?"* warmly enough has talked models out of firmer
instructions than this one. It does not take an adversary — an agreeable model deciding
that reassurance is the helpful answer gets there on its own.

The greeting plays before the model receives a single token. There is nothing to talk out of,
because the sentence has already been said.

`make-greeting.mjs` **refuses to render a transcript** that does not identify Clara as an AI,
or that buries it past the first ten words. Roughly four seconds is how long a caller waits
before starting to talk, and a disclosure the caller talked over is a disclosure that did
not happen.

## Run the checker now

```bash
node check-call-scope.mjs
```

Expected: seven checks, zero failures. It proves four things about the handler and two about
the filter:

1. The phone zone list is a hardcoded constant, not read from env or config
2. That list is exactly `general` and `business`
3. Every `searchFiles` call site passes zones — checked in the source **and** by running a
   turn with a spy
4. The commitment filter runs after the model, not before
5. The filter catches all twenty commitment phrases
6. The filter lets all five ordinary answers through

Point it at your own code once you have written it:

```bash
node check-call-scope.mjs --handler ../brain/phone/handler.mjs
```

## Why the zones matter more than anything else here

Whoever is on the phone is **unauthenticated**. Caller ID is not authentication: it is
trivially spoofed, and when honest it identifies a handset rather than a person.

A phone caller reaches `general` and `business`. Never `personal`. Never `clients`.

That list is a constant in the source, not a setting, because a configurable value has a
default and somebody widens it at 2am to test something. And Class 10's search function has
no way to express "all zones" — it throws without an explicit list — so there is no
convenient wrong answer available at the call site.

**This is what Class 10 was built for.** If you skipped it, the checker will tell you.

## What this does not protect against

- **A determined caller with a convincing story.** The filter catches phrasings. It does not
  catch a caller who talks Clara into revealing something she was allowed to know.
- **The tunnel.** Twilio needs a public webhook, and the tunnel you open for it is a door
  into the box holding eleven weeks of work. Signature validation is the lock and it is one
  line that is easy to leave for later.
- **Whisper inventing sentences.** Silence and line noise produce confident, grammatical
  text that was never said, and no component reports a failure.

---

MIT licensed. Requires Node 20 or newer and ffmpeg.
