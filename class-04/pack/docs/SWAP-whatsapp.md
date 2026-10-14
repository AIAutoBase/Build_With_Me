# Swap — Telegram out, WhatsApp in (Evolution API)

**Who this is for:** your Telegram bot keeps dropping, or the people you work with live on
WhatsApp, not Telegram.

**What you replace:** the three nodes that touch Telegram — the trigger, the voice-note
download, and the two replies. **Everything in the middle stays exactly as it is:** the
guard's idea, ffmpeg, Transcribe, `Ask the brain`, Speak it, the cleanup.

**What it costs:** a second WhatsApp number, about 300 MB of RAM for Evolution, and one
risk Telegram does not have (read the box below).

---

## First: find out why Telegram is dropping

Run this before you rebuild anything. Paste it in a browser off camera:

```
https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

| You see | It means | Does WhatsApp fix it? |
|---|---|---|
| `last_error_message` like `Connection timed out` or `502 Bad Gateway`, `pending_update_count` rising | Telegram cannot reach your **public URL**. The tunnel is what drops, not Telegram | **Yes.** Evolution runs next to n8n and calls it over the internal Docker network. No public URL at all |
| `url` is `""` after a while | The webhook got removed: n8n restarted with a different `WEBHOOK_URL`, or the same bot is active on a second n8n | Partly. Fix `WEBHOOK_URL` first; it is a one-line fix |
| Everything clean, messages still lost | Two Telegram Triggers on one bot (BUILD-THE-BOT §1) | No. Give each workflow its own bot |

If the cause is the tunnel, this swap fixes it at the root, because Evolution does not need
the internet to reach n8n.

> **The WhatsApp risk.** Evolution uses WhatsApp Web, not an official API. Use a
> **dedicated number** (a cheap second SIM or a WhatsApp Business number), never your
> personal one. A brand-new number that sends a lot on day one can get banned. This bot only
> replies to you, so the risk is low, but it is not zero.

---

## The prompt

Paste into Claude Code from your stack folder (`~/brain`):

```text
I have a working n8n workflow `09 - Voice ask` (Class 4). Today it receives a Telegram
voice note, transcribes it, asks my brain at /webhook/ask, speaks the answer, and replies
with text plus a voice note. I want to replace Telegram with WhatsApp through Evolution API
v2, self-hosted in this same Docker stack. Do not touch the middle of the pipeline:
`ogg to mp3`, `Transcribe`, `Ask the brain`, `Speak it`, `Reassemble the audio`,
`To a voice note` and `Clean up` stay as they are.

Phase 1, install Evolution. Stop and show me before you change anything:
1. Read docker-compose.yml and .env. Tell me which network n8n is on and whether Postgres
   and Redis already exist.
2. Add an `evolution` service with the image `evoapicloud/evolution-api` pinned to a v2.3.x
   tag (never `latest`). It goes on the same network as n8n. Publish its port ONLY on
   127.0.0.1:8080, never 0.0.0.0. Give it its own database (`evolution`) in the existing
   Postgres if there is one, otherwise its own Postgres container. Redis: use the existing
   one with its own prefix, or turn the Redis cache off.
3. Generate a random AUTHENTICATION_API_KEY and write it to `.class-04-private.env` (mode
   600, already gitignored) as EVOLUTION_API_KEY. Never print it. Pass EVOLUTION_API_KEY,
   EVOLUTION_URL=http://evolution:8080, EVOLUTION_INSTANCE=brain and
   BRAIN_OWNER_WA (my number, digits only, country code, no +) into the n8n container the
   same way the setup script already passes BRAIN_BOT_TOKEN.
4. Bring it up, create the instance `brain` through the API, and give me the URL for the
   QR code (http://127.0.0.1:8080/manager). I scan it from the DEDICATED phone
   (WhatsApp > Linked devices). Wait for me.
5. Confirm the instance state is `open`.

Phase 2, wire the webhook (inside Docker, no public URL):
6. Point the instance webhook at n8n's internal address,
   http://n8n:5678/webhook/brain-whatsapp, with only the MESSAGES_UPSERT event and
   webhook_base64 = true, so the audio arrives inside the event.
7. In n8n, duplicate `09 - Voice ask` as `09 - Voice ask (WhatsApp)`. Leave the original
   alone and inactive.

Phase 3, replace the Telegram nodes:
8. Trigger: a Webhook node, POST, path `brain-whatsapp`, respond immediately.
9. Guard `Is this you?` as a Code node. Drop the event if: event is not
   `messages.upsert`, or `data.key.fromMe` is true (otherwise the bot answers itself in a
   loop), or the sender is not $env.BRAIN_OWNER_WA. WhatsApp may send the sender as
   `<digits>@s.whatsapp.net` OR as an `@lid` id; also check `data.key.remoteJidAlt` and
   `data.key.senderPn`. DO NOT GUESS THE SHAPE: first activate the workflow with only the
   trigger, send yourself a message, and read the real payload in the execution log.
   Then write the guard against what you saw.
10. Voice note: if `data.message.audioMessage` exists, take the base64 from
    `data.message.base64`. If it is not there, call
    POST $env.EVOLUTION_URL/chat/getBase64FromMediaMessage/$env.EVOLUTION_INSTANCE
    with the message `key`. Write it to /tmp/voice-{{ $execution.id }}.ogg and connect it to
    the existing `ogg to mp3`. WhatsApp voice notes are already ogg/opus, the same as
    Telegram.
11. If it is text and not audio, reply with "Send me a voice note and I'll answer out
    loud." the same as today.
12. Text reply: HTTP Request POST $env.EVOLUTION_URL/message/sendText/$env.EVOLUTION_INSTANCE,
    header `apikey: {{ $env.EVOLUTION_API_KEY }}`, body {number, text}.
13. Voice reply: replace `sendVoice` with POST
    $env.EVOLUTION_URL/message/sendWhatsAppAudio/$env.EVOLUTION_INSTANCE, same header,
    body {number, audio: <base64 of the ogg from `To a voice note`>}. That endpoint sends
    it as a voice note (PTT), not as an audio file.
14. No key, token, or phone number typed into any node. Everything comes from $env, so the
    exported JSON carries only variable names.

Phase 4, prove it:
15. From my personal phone, send a voice note to the dedicated number: I should get the
    text and then a voice note.
16. From another number: zero replies, and the execution shows the guard refused it.
17. Export the workflow and grep the JSON for my number and the key. There must be zero
    hits.

When you finish, give me a table: node | type | what it does, as in BUILD-THE-BOT §10.
```

---

## When it goes wrong

| What you see | It means | Fix |
|---|---|---|
| Instance state `close` or `connecting` | The phone unlinked or went offline for days | Manager → reconnect → scan the QR again |
| The bot replies to itself in a loop | The guard does not filter `fromMe` | Deactivate **now**, fix step 9 |
| No execution in n8n | The webhook points at `localhost` | Inside Docker it has to be `http://n8n:5678`, not localhost |
| `401` from Evolution | Missing `apikey` header or wrong key | Compare the variable in the container with the one in `.class-04-private.env` |
| The voice arrives as an audio file, not a voice note | `sendMedia` was used | It has to be `sendWhatsAppAudio` |
| The guard rejects **you** | Your number arrives as `@lid` | Read the real payload and compare against `remoteJidAlt` / `senderPn` |

*The Brain That Runs a Company — Class 4, optional upgrade. Orbix Automation Solutions.*
