# Swap — Telegram out, Slack in

**Who this is for:** you live in Slack all day and want to talk to your brain there.

**What you replace:** the trigger, the audio download, and the two replies. **The middle
stays as it is:** Transcribe, `Ask the brain`, Speak it, ffmpeg, cleanup.

> **Read this first.** Slack, like Telegram, has to call n8n at a **public HTTPS URL**. If
> your Telegram bot drops because the **tunnel** drops (`getWebhookInfo` shows
> `last_error_message` and `pending_update_count` rising), Slack drops for the same reason.
> In that case, fix the tunnel, or use `SWAP-whatsapp.md`, which needs no public URL.

---

## Before the prompt: create the Slack app (5 minutes, by hand)

1. https://api.slack.com/apps → **Create New App** → From scratch → name `My Brain`, your
   workspace.
2. **OAuth & Permissions → Bot Token Scopes:** `chat:write`, `files:read`, `files:write`,
   `im:history`, `im:read`.
3. **App Home →** turn on **Messages Tab** and check *Allow users to send messages*.
4. **Install to Workspace.** Copy the **Bot User OAuth Token** (`xoxb-…`) and, from
   **Basic Information**, the **Signing Secret**. Do it off camera.
5. Your Slack user ID: your profile → ⋯ → **Copy member ID** (`U0…`).

Do not set up Event Subscriptions yet. The prompt does it once the URL exists.

---

## The prompt

```text
I have a working n8n workflow `09 - Voice ask` (Class 4): a Telegram voice note goes in,
gets transcribed, I ask /webhook/ask, the answer is spoken, and it replies with text plus
a voice note. I want the same thing in a Slack DM with my app `My Brain`. Do not touch
`Transcribe`, `Ask the brain`, `Speak it`, `Reassemble the audio` or `Clean up`.

Phase 1, secrets (never print them):
1. Add SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET and SLACK_OWNER_ID to `.class-04-private.env`
   (mode 600, gitignored). Read them with echo off, the same way setup-telegram-private.sh
   does. Pass them into the n8n container through the same Compose override and recreate n8n.
2. In n8n, create a Slack API credential named exactly `Brain Bot (Slack)` with the bot
   token. Put the token on the clipboard without showing it, the same as --copy-token.

Phase 2, the workflow:
3. Duplicate `09 - Voice ask` as `09 - Voice ask (Slack)`. The original stays inactive.
4. Trigger: a Slack Trigger node with the `Brain Bot (Slack)` credential, event
   "Any Event", watching the bot's DMs. Give me the webhook's PRODUCTION URL so I can paste
   it into Slack → Event Subscriptions → Request URL, subscribed to the bot event
   `message.im`. Wait for me while Slack verifies it.
5. Guard `Is this you?`: drop the event if it has `bot_id` or `subtype` other than
   `file_share` (otherwise it answers itself), or if `event.user` is not
   $env.SLACK_OWNER_ID. Also deduplicate by `event_id`: Slack retries if it does not get
   a 200 within 3 seconds, and every retry would create a second execution.
   DO NOT GUESS THE SHAPE: activate with only the trigger, send a voice clip from the
   Slack app, and read the real payload in the execution log first.
6. Audio: a Slack voice clip arrives in `event.files[0]`, usually as audio/mp4 or webm,
   NOT ogg. Download `url_private_download` with
   `Authorization: Bearer {{ $env.SLACK_BOT_TOKEN }}`. Save it with its real extension
   and adjust only the input of `ogg to mp3`; ffmpeg accepts any input.
7. If there is no file, reply "Send me a voice note and I'll answer out loud."
8. Text reply: the Slack node, `message` → `post`, to the DM's channel (`event.channel`),
   with the answer and its source.
9. Voice reply: upload the ogg from `To a voice note` as a file to the same channel with
   the Slack node (file upload, which uses files.getUploadURLExternal +
   completeUploadExternal). Slack has no "voice note" type like Telegram; it shows up as a
   playable audio file, and that is expected.
10. No token, secret or ID typed into a node. All of it from $env or the credential.

Phase 3, prove it:
11. A voice clip from me in the DM → text + audio.
12. Another workspace member writes to the bot → zero replies, the guard refuses it.
13. Export the JSON and grep for xoxb-, the secret and my U0 ID: zero hits.

At the end, a table: node | type | what it does.
```

---

## When it goes wrong

| What you see | It means | Fix |
|---|---|---|
| Slack: *Your URL didn't respond with the challenge* | The workflow is not active, or you used the **test** URL | Activate and use the **production** URL |
| Two answers per question | Slack retried; there is no `event_id` dedupe | Step 5 |
| The bot answers itself | The guard does not filter `bot_id` | Deactivate, fix step 5 |
| `not_in_channel` / `channel_not_found` | Messages Tab is off, or `im:*` scopes are missing | Steps 2–3 of the app setup, then **reinstall** the app |
| `missing_scope` on the download | Missing `files:read` | Add it and reinstall |
| ffmpeg fails on the audio | It assumed ogg | Step 6: save it with its real extension |

*The Brain That Runs a Company — Class 4, optional upgrade. Orbix Automation Solutions.*
