# 06. Recommendations

## Keep your key safe
- The API key goes in `.dev.vars` (your computer) and Cloudflare secrets (the internet). **Nowhere else.**
- Never paste it in a chat, a screenshot, a commit, or a public repo.
- Before every commit run `git status` and confirm `.dev.vars` is not listed.
- If a key leaks, delete it at https://aistudio.google.com/apikey and create a new one.

## Why the chat goes through a server function
If the browser called Gemini directly, your key would be visible to anyone who opens the page's developer tools. The function keeps it private and also builds the bot's rules on the server, so visitors cannot rewrite them.

## Be honest with your visitors
- The assistant should say it is an AI when asked. Our prompt does this. Keep it.
- Do not give the bot facts you cannot stand behind (prices you will not honor, promises you cannot keep).
- Do not put private client data in `bot.knowledge`. Everything in it can be revealed by a determined visitor.

## Write facts the bot can use
- One fact per line, concrete and short ("Logo design: $150, ready in 3 days").
- When the answer is not in the facts, the bot should send people to your contact link. Test this every time you edit.
- Update the facts when prices or hours change, then commit and redeploy.

## Know the limits
- **Free quota:** Gemini's free tier allows only a small number of requests per day. If chat starts failing with `Model error 429`, you hit it. Wait, or use another key.
- **No rate limiting:** anyone with your link can spend your quota. Fine for class. Before promoting it widely, add a Cloudflare rate-limit rule.
- **No memory:** the bot forgets the conversation when the page reloads.
- **Not a lawyer or a doctor:** keep the facts to your business.

## Version like a pro
- Commit small and often, with a message that says what changed.
- Tag releases (`v0.1.0`, `v0.2.0`). Tag `v1.0.0` when you are happy to show it publicly.
- Never edit files by copying them to `file-old.json`. Git already remembers every version.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Page is blank or "Failed to fetch" | You opened the file by double-click. Run `npx wrangler pages dev .` and use the localhost link. |
| `Server is missing GEMINI_API_KEY` | Locally: `.dev.vars` is missing or misnamed. Online: set the secret, then deploy again. |
| `Model error 429` | Daily free quota used up. Wait or use another key. |
| `Model error 400` or `403` | Key is wrong, has spaces, or has quotes around it. Re-enter it. |
| Logo does not show | The `logo` path in `config.json` must match a real file in `assets/` (check capitals and extension). |
| Bot invents answers | Add the correct fact to `bot.knowledge` and keep the "answer only from facts" rule. |
| Port 8788 already in use | Another server is running. Close it, or run with `--port 8790`. |
| `wrangler` asks to log in again | Run `npx wrangler login` once more. |
| `git commit` says to set your identity | Run the two `git config --global` commands from `01-SETUP.md`. |
