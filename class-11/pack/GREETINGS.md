# The greetings

Two files. `greeting-standard.txt` and `greeting-recorded.txt`. One difference between
them: the recorded one says the call is recorded.

## Why these are files and not a system prompt

The rule is that Clara says she is an AI before anything else happens. There are two ways
to enforce that and only one of them holds.

**As a system prompt instruction**, it is a request. A caller asking *"wait, am I talking to
a real person?"* warmly enough has talked models out of firmer instructions than this one,
and it does not take an adversary — an agreeable model deciding that reassurance is the
helpful answer gets there on its own.

**As an audio file played before the model receives a single token**, there is nothing to
talk out of. The sentence has already been said.

That is the whole argument, and it is why the pack ships transcripts and a renderer rather
than leaving this to a prompt.

## Why the pack ships text and not audio

Two reasons, and the second is the real one.

1. The voice should be yours. A pack that hands everyone the same rendered voice is a pack
   that teaches you to run somebody else's assistant.
2. A cloned brand voice in a public MIT zip is a cloned brand voice anybody can use as
   their own assistant, forever, with no way to withdraw it.

So `make-greeting.mjs` renders these two files with **your** provider and **your** key. You
end up with your own `greeting-standard.wav` and `greeting-recorded.wav`, and nobody ships
anybody a voice.

## The constraint on the wording

The AI disclosure must land inside the **first four seconds**, because that is roughly how
long a caller waits before starting to talk. Anything after that is said over them.

Both transcripts put it in the first sentence, before anything else — before the name of
the business, before an offer to help, before the recording notice in the file that has one.

If you rewrite these, keep that. Everything else in the wording is yours.

## Where the selection happens

Never here. Build prompt 07 wires it:

```js
greetingFor(recordingEnabled) -> filename
```

One function, one caller, no override parameter. Recording on with the non-disclosing
greeting has to be **unrepresentable**, not merely discouraged — if enabling recording and
changing the greeting are two separate actions, then one day they will be one action.

## Rendering them

```bash
node make-greeting.mjs --provider elevenlabs --voice <your-voice-id>
```

It reads your key from the environment. It never writes one anywhere, and it refuses to
run if the key is missing rather than falling back to something free and different.
