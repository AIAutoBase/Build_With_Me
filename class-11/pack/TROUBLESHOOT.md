# Class 11 — troubleshooting

Symptom first, because the symptom is what you have at 11pm.

---

## Clara talks over the caller and will not stop

**Symptom:** the caller starts speaking, Clara keeps going for another eleven seconds, and
the call is unusable. Nothing errors. Every log looks healthy.

**Cause:** no barge-in. You are streaming text-to-speech and nothing cancels it when
inbound speech arrives.

**And the reason you did not catch this:** in testing you politely wait for Clara to finish
every single time. The first real caller does not. This trap cannot be found by being a
good tester — only by being a rude one.

**Fix:** build prompt 11. On inbound speech while Clara is speaking, stop sending audio,
discard the buffer, and cancel the TTS request so you stop paying for audio nobody hears.

**Then the half that is easy to miss:** barge-in must also stop the **model**. A model still
generating a reply to an abandoned question will deliver it as the answer to the next one,
which is the most confusing failure this system can produce.

---

## Calls are slow, sometimes, and there is no error anywhere

**Symptom:** most calls feel fine. Some have two-second gaps. Nothing in any log is
different between them.

**Cause, if you are on the local text-to-speech path:** the GPU is doing something else. An
image job or a video render in another window triples your latency for as long as it runs,
and it finished twenty minutes ago as far as you remember.

**A GPU box runs one workload at a time.** That is the constraint, and it is why the class
defaults to a hosted provider — it takes the GPU out of the requirements.

**Cause, if you are on the hosted path:** check the latency table (build prompt 14) rather
than guessing. It stores five timings per turn. One of them will be the answer, and it is
usually endpointing or the model's first token, not the piece you suspect.

**Fix:** read the numbers before changing anything. The budget in the class notes is a
budget, not a measurement — yours may legitimately differ.

---

## Clara answered a question nobody asked

**Symptom:** the caller said nothing, or coughed, and Clara answered a fluent, grammatical
question that was never spoken.

**Cause:** Whisper-family models hallucinate on silence and line noise. They produce
confident text and report no error, because from the model's side nothing went wrong.

This is the same shape as every trap in Class 8: **a silent failure that produces a
plausible artifact.**

**Fix:** there is no fix, only handling. Build prompt 10:
- store the no-speech probability or confidence if your provider gives one
- log a warning when a transcript arrives from an utterance that was mostly silence
- if your provider gives nothing, say so in a comment rather than inventing a number

**Try it before class:** call the number, say nothing for four seconds, and read what your
STT invented. That is the demo, and it is more persuasive than the explanation.

---

## The webhook returns 403 and Twilio shows failures

**Symptom:** Twilio's console shows the webhook failing. Your server logs a rejected
signature.

**Cause, most likely:** a body parser ran before the signature middleware. Validation needs
the **raw** body; once JSON has parsed and re-serialised it, the signature is computed over
different bytes and will never match.

**Fix:** mount the raw-body capture before any parser on that route. Build prompt 03 shows
where.

**Do not fix it by skipping validation in development.** If you are about to add that flag,
add a comment instead saying why you did not: the flag will be on in production within a
month, and the whole tunnel is unlocked behind it.

---

## Something on the internet is hitting my box

**Symptom:** requests in your logs from addresses that are not Twilio.

**Cause:** the tunnel. It is doing exactly what you opened it to do. The internet finds
things.

**Fix, in order:**

1. Confirm the tunnel exposes `/api/phone/*` **and nothing else**. Test from another
   machine: try `/api/cockpit` and record what you get. If it answers, take the tunnel down
   now.
2. Confirm signature validation is on and rejecting. Unsigned requests should be 403, and
   their bodies should not be in your logs.
3. Only then look at who is knocking.

The order matters. Closing the door beats identifying the visitor.

---

## The number rang at 3am

**Symptom:** exactly that.

**Cause:** a phone number is reachable by anyone who dials it, including by mistake,
including by autodialers.

**Fix:** this is a product decision, not a bug. Options, in increasing effort: silence the
device the number forwards to; add an hours check that plays a different greeting outside
business hours; keep it and accept it. What you should not do is find out about this from a
family member.

---

## The bill was bigger than expected

**Symptom:** the monthly charge is more than the number rental.

**Cause:** it is per minute and per character, and testing is calls. Every full turn you
tried during the build cost speech-to-text, a model call, and text-to-speech.

**Fix:** nothing to fix, but two habits worth having:
- test the SMS half first. It exercises the number, the tunnel, the signature check, the
  zone scoping and the brain, for less than a cent, with no clock on it.
- `--dry-run` on `make-greeting.mjs` before you render for real.

---

## `check-call-scope.mjs` fails on my own handler

**Symptom:** one of the four assertions says FAIL against your code.

| It says | It means |
|---|---|
| zone list is not a hardcoded constant | Your `PHONE_ZONES` reads from env, config or the database. A configurable security boundary has a default, and somebody sets it wide |
| zone list is not exactly `[general, business]` | Read the list it printed. If you widened it on purpose, that is a decision — write down why |
| a searchFiles call site does not pass zones | Find it. One forgotten call is a caller reaching your personal documents |
| the filter runs before the model | The commitment filter has to be on the way **out**. Filtering the input filters the wrong thing |

The checker strips comments before analysing, so a JSDoc mention of `searchFiles` will not
trip it and will not satisfy it either.
