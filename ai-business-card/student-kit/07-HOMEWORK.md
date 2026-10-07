# 07. Homework: make it truly yours

Do these in order. Commit after each one and bump the version.

## Level 1: polish (30 min)
- Replace the placeholder logo with your real one.
- Rewrite the About page in your own voice.
- Add 3 more facts to the bot. Test questions a real customer would ask.
- Tag `v0.3.0`.

## Level 2: grow it (1 to 2 hours)
- Add a **second language** (for example `config.es.json` and a toggle).
- Add a **Services** section to the Home page, driven by a list in `config.json`.
- Add a **"Book a call"** button that links to your calendar, and teach the bot the link.

Prompt idea for Claude Code:
```
Add a Services section to index.html driven by a "services" array in config.json
(title, price, one-line description). Keep everything in config.json. No new libraries.
```

## Level 3: make it a real tool (weekend)
- A **contact form** that sends you an email from a Cloudflare function.
- A **rate limit** so strangers cannot burn your quota.
- Your own **domain** (Cloudflare Pages → Custom domains).
- Tag `v1.0.0` and share the link with a real customer.

## Ideas for other versions of this app
- A restaurant menu bot
- A freelancer rate-and-availability bot
- A class or event FAQ bot
- A product-support bot for a small shop

## Share it
Post your link and one thing you learned in the class community. Include the version tag you reached.
