# P4 — Put it on the dashboard

**What it builds:** an ask box on the Class 2 dashboard. Type a question, get the answer
and the documents it came from.

**Before you run it:** P3 is active and answering on `curl`.

**Video:** *Put it in the dashboard* (~3 min)

---

## The prompt

```text
I have a single-file dashboard, dashboard.html, from an earlier class. It polls an
n8n webhook every 30 seconds and renders tiles plus two tables. It has a dark theme
with CSS variables at the top, an error box that appears when the webhook can't be
reached, and an `esc()` helper for escaping.

I now have a second n8n webhook that answers questions about my documents:

  POST http://localhost:5678/webhook/ask
  body:     { "question": "..." }
  response: { "answered": true|false, "answer": "...", "sources": ["file.md"] }

Add an ask box to this dashboard. Requirements:

- Put it directly under the tiles, above "Needs a reply". It is the headline
  feature now, not an afterthought at the bottom.
- A text input and a button. Enter submits. Empty input does nothing.
- While waiting, disable the button and say something honest like "thinking…" —
  the round trip is a second or two and a dead-looking page reads as broken.
- Render the answer, and under it the source filenames as small pills.
- When `answered` is false, style it differently from a real answer — muted, not
  alarming. It is not an error. The system working correctly and telling me it
  doesn't know is a good outcome and it should not look like a failure.
- If the fetch itself fails, that IS an error — show it the way the existing error
  box shows errors, with the likely cause.
- Escape everything that comes back with the existing esc() helper before putting
  it in the DOM. It is my own document text, but it has been round-tripped through
  a model, and I am not injecting whatever comes back into innerHTML unescaped.
- Match the existing theme exactly. Use the CSS variables that are already there.
  Do not add a framework, do not add a build step, do not add a CDN link. It stays
  one file I can open by double-clicking it.
- Do not break the existing 30-second poll or the tables.

Show me the diff, not the whole file.
```

---

## What you should end up with

A box under the tiles. Ask it something from your documents, get the answer plus a pill
saying which file it came from. Ask it something else and get a quiet *"I don't have that
in your documents."*

The pack ships a finished version of exactly this — `assets/dashboard.html` — so you can
compare, or just use it.

## Why "answered: false" must not look like an error

This is the design decision worth arguing about, so argue about it.

A red box means *something is broken, go fix it*. But nothing is broken — the system was
asked something outside what it knows and said so. If that renders as an error, people
learn to treat the refusal as a malfunction, and the very next thing they do is go tune
the threshold down until it stops "failing."

Which is to say: styling the refusal as an error will, eventually, train you to break your
own system. Make it look calm. It's the machine being trustworthy.

## If it goes wrong

| What you see | What it means |
|---|---|
| Nothing happens on submit, console says CORS | The `ask` webhook's Respond node is missing `Access-Control-Allow-Origin: *`. The tiles keep working because that's a different webhook. |
| `404` in the network tab | The `06 — KB ask` workflow isn't Active. |
| Answer appears with visible `&quot;` or `&amp;` | You escaped twice. Escape once, on the way into the DOM. |
| The tiles stopped updating | The new code threw before `setInterval` was reached. Check the console. |
