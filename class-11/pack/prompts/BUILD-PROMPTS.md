# Class 11 — build prompts

**The Brain That Runs a Company, Part 11: Clara answers the phone.**

Seventeen prompts. Paste them into Claude Code one at a time, in order, from inside your
brain folder.

---

## Before you paste anything

1. **Clean git tree. Commit after each prompt that works.** Two of these prompts open your
   machine to the internet; you want to be able to see exactly when that happened.
2. **This class spends money on every test.** Every call, every text, every second of audio.
   Prompts 04 and 12 tell you the cheapest way to test each half.
3. **Nothing here is safe to leave running while you sleep** until prompt 17 passes. A phone
   number is reachable by anyone who dials it, including at 3am, including by mistake.

### The order is the exposure argument

The tunnel and the signature check are the same prompt — number 03. Not adjacent prompts, the
same one.

Every guide splits them, because getting the webhook to fire is satisfying and validating its
signature is not. The gap between those two steps is a window in which anything on the
internet can POST to your brain pretending to be Twilio, and the window stays open exactly as
long as it takes you to get bored and move on.

---

## Prompt 01 — Map the pieces I already have

```text
Do not change anything. Report:

  1. My Class 10 search function - its path, its signature, and the exact line that
     throws when zones is not passed. Quote it.
  2. My Class 3 memory query - how the brain currently answers a question, and where the
     model call happens.
  3. My n8n instance - version, how it is reached from the dashboard, and how it is
     currently exposed, if at all.
  4. Whether ffmpeg is installed, and whether it supports mulaw. Check with:
       ffmpeg -formats 2>/dev/null | grep -i mulaw
  5. What my dashboard's Express server does with an unknown POST route right now - 404,
     or something more talkative.

Then give me five lines on what adding a phone number touches, and one line naming the
single most dangerous thing about it.
```

**You know it worked when:** the answer to the last line is about the tunnel, not the model.

---

## Prompt 02 — The call tables, before any call

```text
Create a migration adding two tables.

calls:
  id             bigserial primary key
  direction      text not null check (direction in ('inbound','outbound'))
  channel        text not null check (channel in ('voice','sms'))
  from_number    text not null
  to_number      text not null
  started_at     timestamptz not null default now()
  ended_at       timestamptz null
  recorded       boolean not null default false
  greeting_file  text null            -- which greeting actually played
  zones_used     text[] not null      -- what the handler was allowed to search
  outcome        text null
  provider_sid   text null

call_turns:
  id                bigserial primary key
  call_id           bigint not null references calls(id)
  turn_index        int not null
  caller_text       text null
  clara_text        text null
  filtered          boolean not null default false   -- commitment filter fired
  ms_endpoint       int null
  ms_stt            int null
  ms_model          int null
  ms_tts_first      int null
  ms_total          int null

Two columns to explain back to me in a comment, one sentence each:
  - why zones_used is stored on every call rather than being assumed
  - why greeting_file is stored rather than assumed

Show me the SQL. Do not run it.
```

**You know it worked when:** you can look at a call from three months ago and prove which
zones it could reach and which greeting it played.

★ Insight ─────────────────────────────────────
`zones_used` and `greeting_file` are both recording a decision the code made, not data the
call produced. They exist for the day someone asks a question you cannot answer from source
control — because the source has changed since, and "it was hardcoded" is not evidence about
what ran on a Tuesday in October.

`ms_*` on the turn rather than the call is what makes the latency table in `DECISIONS.md`
fillable. Averages per call hide the one turn that took four seconds, and that turn is the
one the caller remembers.
─────────────────────────────────────────────────

---

## Prompt 03 — The tunnel and the signature check, together

```text
These are one prompt on purpose. Do not do the first half without the second.

First, the signature check. Write middleware/twilio-signature.mjs:

  - Validates the X-Twilio-Signature header against my auth token, the full request URL,
    and the raw body.
  - It needs the RAW body, before any JSON or urlencoded parsing. Show me how you made
    sure of that, because a body parser that ran first makes this check silently pass on
    nothing.
  - It rejects with 403 and logs the attempt - source IP, path, and the fact that it
    failed. It never logs the body of a rejected request.
  - If TWILIO_AUTH_TOKEN is unset, it throws at import time. There is no "skip validation
    in development" flag. If you are about to add one, add instead a comment explaining
    why you did not: the flag would be on in production within a month.

Second, the tunnel. Write tunnel.md - instructions, not a script:

  - cloudflared, pointing at the dashboard's port
  - which single path is exposed: /api/phone/* and nothing else
  - how to confirm from another machine that /api/cockpit is NOT reachable
  - how to take it down

Then tell me, in three sentences, what is reachable from the public internet the moment
this tunnel is up, and what stands between a stranger and my Class 10 documents.
```

**You know it worked when:** you can answer the last question, and the answer has exactly two
things in it.

---

## Prompt 04 — SMS in, and nothing else

```text
Add POST /api/phone/sms - the Twilio inbound SMS webhook.

For now it does ONE thing: validate the signature, write a calls row and a call_turns
row, and reply with a fixed string:

  "Clara here - I am an AI assistant. I got your message and I am not answering
  properly yet."

No model. No search. No cleverness.

Reason, and put it in a comment: this proves the number, the tunnel, the signature check
and the database in one text message that costs less than a cent. Every bug found here is
a bug not being debugged later with a latency budget on top of it.

Then tell me the cheapest way to test it. If the answer involves texting the number from
my own phone, say what that costs.
```

**You know it worked when:** you text your own number and get a robot answer back, and there
is a row in `calls` to prove it.

---

## Prompt 05 — SMS out, zone-scoped

```text
Now make the SMS handler actually answer, using the brain.

  - Call the Class 10 searchFiles with zones ['general','business']. That array is a
    CONSTANT at the top of the call handler file, named PHONE_ZONES, with a comment above
    it saying that whoever is on this channel is unauthenticated and that caller ID is not
    authentication.
  - Never read that list from env, from config, or from the database. If you are about to
    make it configurable, do not, and write a comment saying why: a configurable value has
    a default, and somebody sets it to all four at 2am to test something.
  - Also query the Class 3 memory, with the same zone restriction.
  - Feed both into the model with the existing Class 4 prompt style.
  - Store caller_text and clara_text on the turn. Store zones_used on the call.
  - Keep the reply under 320 characters. Two SMS segments. Say so in a comment - each
    segment costs money and a chatty model writes six of them.

Then write the one test that matters: seed a document in the personal zone containing a
distinctive string, text the number a question that only that document answers, and
assert the reply does not contain the string and that the model was never handed it.
```

**You know it worked when:** the test passes — and note that it asserts on what the model was
*handed*, not only on what it said. A model that never saw the document cannot leak it under
any prompt.

---

## Prompt 06 — The commitment filter

```text
Clara takes messages. She does not commit. Build the filter that enforces it.

Write filters/no-commitments.mjs, exporting:

  filterOutbound(text) -> { text, filtered, matched }

It runs on everything Clara says, AFTER the model, on both SMS and voice.

It catches, at minimum: agreeing a price or discount, confirming or booking an
appointment or date, promising a delivery or completion time, accepting or agreeing to a
scope of work, and anything phrased as a guarantee or a promise. Handle English and
Spanish - this brand is bilingual and a filter that only covers English is a filter with
a documented bypass.

When it fires, it does not edit the sentence. It REPLACES the whole reply with the
take-a-message line, and sets filtered true so the turn row records it.

Two things I want you to be honest about in comments:
  - this is pattern matching and it will miss things
  - it exists because the system prompt rule will be talked out of eventually, and a
    filter on the way out will not

Then write me twenty test phrases - ten English, ten Spanish - that must be caught, and
five that must NOT be caught because they are ordinary helpful answers.
```

**You know it worked when:** the five that must pass, pass. A filter that catches everything
is a system that says nothing.

---

## Prompt 07 — The greeting files

```text
Generate the two greeting files, and wire them so they cannot come apart.

  greeting-standard.wav   - identifies Clara as an AI, does not mention recording
  greeting-recorded.wav   - identifies Clara as an AI AND says the call is recorded

Requirements:
  - Render both with the TTS voice, once, and commit them as files. They are not
    generated at call time. Add a comment: a file cannot be talked out of what it says.
  - Ship a .txt beside each with the exact transcript.
  - The greeting is played BEFORE the media stream is handed to the model. Show me the
    line where the model first becomes involved, and confirm it is after the greeting has
    finished.
  - Selection is a pure function of the recording flag:
        greetingFor(recordingEnabled) -> filename
    There is no other caller. There is no override parameter. Recording on and the
    non-disclosing greeting must be unrepresentable, not merely discouraged.
  - Write the chosen filename into calls.greeting_file every time.

Then tell me what a caller hears in the first four seconds, word for word, and how many
code changes it would take to remove the AI disclosure. If the answer is fewer than two,
tell me how to make it two.
```

**You know it worked when:** removing the disclosure requires editing a committed audio file.

---

## Prompt 08 — The media stream

```text
Add the Twilio Media Streams websocket at /api/phone/stream.

  - Validate the signature on the initial HTTP upgrade. Same middleware.
  - Inbound audio is 8 kHz mu-law, base64, in 20 ms frames. Decode to 16 kHz PCM for the
    STT. Use ffmpeg or a mu-law table - tell me which you chose and why.
  - Outbound is the reverse, and Twilio expects the same 20 ms framing. Sending larger
    chunks works right up until it does not.
  - Track a per-call sequence number and log any gap. A dropped frame is a syllable, and
    a run of them is why a caller was misunderstood - you want that in the record rather
    than blaming the STT.
  - Timestamp every frame on arrival. Prompt 14 needs those.

Do not connect the model yet. For now, echo the caller's audio back to them with a 500 ms
delay, so I can hear that the round trip works and hear what 500 ms actually sounds like.
```

**You know it worked when:** you call the number and hear yourself, late. Listen to it. That
delay is the budget you are about to spend.

---

## Prompt 09 — Endpointing

```text
Decide when the caller has stopped talking.

Give me both options first, then implement the one I pick:

  A. Twilio's own speech detection - free, no extra latency of ours, coarse, and we do
     not control the threshold.
  B. A VAD on our side of the stream - we control the silence threshold, we add our own
     processing time, and it is one more thing that can be wrong.

For each: what it adds to the budget, what it gets wrong, and how it fails on a caller
who pauses mid-sentence to think.

Then implement my choice with:
  - the silence threshold as a named constant with a comment on what raising and lowering
    it each feel like to a caller
  - a hard maximum utterance length, so a caller in a noisy car does not hold the turn open
    forever
  - ms_endpoint written to the turn row - the time from the last speech frame to the
    decision

This is the stage where half a second goes missing without anybody noticing. Instrument
it first, tune it second.
```

**You know it worked when:** `ms_endpoint` has real numbers in it before you have tuned
anything.

---

## Prompt 10 — Streaming speech to text

```text
Wire streaming STT into the media stream.

  - Streaming. Send audio as it arrives; do not accumulate an utterance and then post it.
    Add a comment stating what the non-streaming version costs in the budget - roughly a
    second - and that it is the single easiest place to lose the whole class.
  - Write ms_stt: from the endpointing decision to the final transcript.
  - Store caller_text on the turn, exactly as returned. Do not clean it up. The mess is
    evidence.

Then the honesty requirement. Whisper-family models hallucinate fluent, grammatical
sentences from silence and line noise, and they report no error when they do.

  - If the STT provides a confidence or no-speech probability, store it and log a warning
    when a transcript arrives from an utterance that was mostly silence.
  - If it provides nothing, say so plainly in a comment rather than inventing a number.
  - Write me the three-sentence version of this trap that I can read out loud in class.
```

**You know it worked when:** you call the number, say nothing for four seconds, and find out
what your STT invents. Do this before class. It is the demo.

---

## Prompt 11 — Streaming text to speech, with barge-in

```text
Wire streaming TTS back into the call, and make it interruptible.

  - Streaming: start sending audio on the first chunk, not on completion. Write
    ms_tts_first - request sent to first audio frame out.
  - BARGE-IN. When inbound speech is detected while Clara is speaking: stop sending
    immediately, discard the rest of the buffered audio, and cancel the TTS request so we
    stop paying for audio nobody will hear.
  - Barge-in must also stop the MODEL, not only the audio. A model still generating a
    reply to a question the caller has abandoned will deliver it as the answer to their
    next one, which is the most confusing possible failure.
  - Record on the turn that it was interrupted.

Then tell me why barge-in never shows up in testing. The answer is that I will politely
wait for Clara to finish every time, and the first real caller will not.
```

**You know it worked when:** you interrupt her mid-sentence and she stops inside a syllable.

---

## Prompt 12 — The voice turn, end to end

```text
Connect the pieces into one turn: endpoint, transcribe, search zone-scoped, model,
filter, speak.

  - Same PHONE_ZONES constant as SMS. Import it; do not redeclare it. If you find
    yourself typing the array a second time, stop and tell me - two copies of a security
    boundary is one copy of a security boundary.
  - Same commitment filter, on the way out, before TTS.
  - Write all five ms_* columns and ms_total on every turn.
  - The model gets a system prompt that says it is on a phone call, that answers must be
    two sentences or fewer because nobody listens to a paragraph, that it must not
    commit to anything, and that it is Clara and is an AI.
  - On any component failing: Clara says one fixed sentence asking them to try again, and
    the turn records the failure. She never says "I'm having trouble with my systems" -
    say what happened in ordinary words or say nothing.

Then tell me the cheapest way to test a full turn, and what it costs each time.
```

**You know it worked when:** you have a conversation with your own brain, and it costs you a
few cents to find out how it feels.

---

## Prompt 13 — The refusal, out loud

```text
Make the zone boundary audible - this is a class segment, not just a safeguard.

When a caller asks something that would be answered by a document in the personal or
clients zone, Clara does not say "I don't know". She says something true:

  "I can't get to that from the phone - that one's in a part of the brain this number
  doesn't reach. I can take a message."

Requirements:
  - Do NOT implement this by searching the restricted zones and then declining. The search
    must never touch them. Show me how the handler knows to say this WITHOUT having looked.
  - Store the outcome on the call.

That constraint is the whole exercise. If the easy implementation is to look and then
refuse, then the documents were loaded into the process, and the only thing standing
between them and the caller is a string comparison. Tell me what you did instead.
```

**You know it worked when:** the honest answer to "did the process ever hold that document in
memory?" is no.

---

## Prompt 14 — The latency table

```text
Build the thing that fills in the table in DECISIONS.md.

  1. A SQL view, call_latency, giving per stage: median, p90, worst, and count. Overall
     and per call.
  2. A Latency panel in the dashboard's phone tab showing it, with the BUDGET from
     DECISIONS.md next to each measured number, and the difference. Colour the difference,
     not the measurement.
  3. A script scripts/latency-report.mjs that prints the same table to a terminal, so I
     can put it in the class notes.

Then, from whatever data I have so far, tell me which stage is furthest over budget and
what the two cheapest ways to fix it would be.

Do not smooth the numbers. If one call took nine seconds I want to see the nine.
```

**You know it worked when:** you can replace the budget table in `DECISIONS.md` with measured
numbers, and the document stops saying "unmeasured".

---

## Prompt 15 — Recording, wired to consent

```text
Add call recording, off by default, and make it impossible to enable quietly.

  - One flag, RECORDING_ENABLED, default false.
  - It selects the greeting file, through greetingFor() from prompt 07. There is no other
    path to a greeting.
  - When on: recordings go to the Class 10 MinIO bucket, in the personal zone, with a
    files row. They are audio, so status is unsupported - no markdown, no embedding.
    A recording of a call is not searchable text and pretending otherwise would put a
    transcript of a customer call into the brain's memory.
  - When off: no audio is written anywhere. Also no transcript is persisted beyond
    caller_text on the turn - and tell me plainly whether storing caller_text while
    telling the caller they are not being recorded is defensible. Give me your actual
    opinion, then let me decide.
  - Write a retention script that deletes recordings older than N days, N in one place,
    that does not run automatically.

Then tell me which US states and which other countries make two-party consent the rule,
and say clearly that you are not a lawyer and this is not advice.
```

**You know it worked when:** you have made a decision about `caller_text` on purpose, and it
is written down.

---

## Prompt 16 — The phone tab

```text
Add a Phone tab to the dashboard.

  - The number, and whether the tunnel is currently up. Check it, do not assume it.
  - Recording state, large and unambiguous, with the greeting transcript that is currently
    in force printed underneath it. Not the filename - the words.
  - Call log: time, direction, channel, from, duration, outcome, and the zones that call
    was allowed to reach.
  - Open a call to see its turns: what the caller said, what Clara said, whether the
    filter fired, and the five timings.
  - Turns where the filter fired are marked, and show BOTH what the model wanted to say
    and what was actually said. That comparison is the most useful thing in this tab.
  - The latency panel from prompt 14.

Do not add a control to change PHONE_ZONES. Add a read-only line showing what it is, and
a note saying it is a code change on purpose.
```

**You know it worked when:** you can read a filtered turn and see the promise Clara nearly
made.

---

## Prompt 17 — Adversarial verify

```text
Write VERIFY.md for the phone, and run it with me.

Prove all twelve against the running system:

   1. The greeting plays before the model is involved; the caller hears the AI disclosure
      inside the first four seconds
   2. calls.greeting_file matches what actually played
   3. With recording off, no audio object exists after a call
   4. Turning recording on changes the greeting, without any other change
   5. An unsigned POST to the webhook gets 403, and the body is not logged
   6. From another machine, the tunnel exposes /api/phone/* and nothing else - try
      /api/cockpit and record the result
   7. A question answerable only from the personal zone gets the honest refusal, and the
      document was never loaded into the process
   8. A question answerable only from the clients zone - same
   9. A caller asking Clara to confirm a price gets the take-a-message line, and the turn
      shows filtered true with the model's original text stored
  10. Barge-in stops audio within 200 ms, and stops the model too
  11. Four seconds of silence produces either no transcript or a flagged one - record
      exactly what your STT invented
  12. The latency view has real numbers for all five stages, and DECISIONS.md has been
      rewritten to match

For each: the exact steps, what counts as a pass, and a blank result line.

Then tell me the three things this design does not protect against. One is about the
tunnel and one is about what a determined caller can do with a convincing story. Be
specific and do not reassure me.
```

**You know it worked when:** item 12 is done, which means `DECISIONS.md` no longer opens by
saying nothing has been measured.

---

## What you have at the end

A phone number that answers, says it is an AI before anything else happens, answers from two
of your four document zones and cannot reach the other two, refuses to promise anything on
your behalf, stops talking when you interrupt it, and records every turn with five timings so
you can see exactly where the time went.

And a written list of the three ways it can still be beaten.

**Next class:** you now have five tabs and a plan for eleven more. Class 12 stops adding tabs.
