# Site Studio: a one-page website from three fields

Site Studio is a small web app that runs on your computer. You type a **theme**, a **niche** and a
**description**. Gemini suggests the rest: name, audience, tone, colors, sections, call to action,
affiliate categories, social platforms, image prompts and a hero video prompt. Then you click
**Generate site** and get one HTML file you can open, download and hand to a client.

## Three ways to use it

1. **Pitch a local business.** Paste the URL of a shop near you. Site Studio reads their current page
   and writes a cleaner one with their real facts. Show it to them before you ask for anything.
2. **Improve your own site.** Same thing, with your URL.
3. **Start from zero.** Theme, niche, description, Fill everything, Generate.

## What's in this kit

| File | Use it for |
|---|---|
| `PROMPTS.md` | The 4 prompts from class. Paste them into Claude Code one at a time. |
| `reference-app/` | The finished app. Use it if your build breaks. |

## Setup (10 minutes)

1. **Node 20 or newer.** Check with `node -v`. Get it at https://nodejs.org.
2. **Claude Code**, open in an empty folder. The first prompt checks for Anthropic's **frontend-design**
   plugin and installs it if it is missing (`claude plugin install frontend-design@claude-plugins-official`).
3. **A free Gemini API key** at https://aistudio.google.com/apikey.
   Free tier limits are small and Google changes them. Expect to hit a limit if you click a lot.
4. Create a file called `.env` next to `server.mjs`:
   ```
   GEMINI_API_KEY=your-key-here
   ```
   Never paste your key into chat, a screenshot or git. The `.gitignore` already skips `.env`.
5. **A free Pexels API key** (for the "Find hero video" button). Create it yourself, it takes 2 minutes:
   1. Go to https://www.pexels.com/api/ and click **Get started**. Sign up or log in (free).
   2. Fill the short form: project name (e.g. "Site Studio"), what it is for, and your site URL if you have one.
   3. Your key shows on the **Your API key** page. Copy it.
   4. Add a second line to `.env`: `PEXELS_API_KEY=your-pexels-key`, then restart the server.

   Free limits: Pexels sets a request quota per hour and per month (enough for this app); check the
   current numbers on your API page. Pexels asks API users to show a link to Pexels and credit the
   creator, so the app puts "Video by ... on Pexels" in the footer. No key? The button tells you how to
   get one, and you can still download a clip by hand.
6. Run `node server.mjs` and open http://localhost:8787.

To run the finished version: `cd reference-app`, copy `.env.example` to `.env`, add your key, `node server.mjs`.

## Images and video, free options

- **Images.** The app tries the Gemini image model with your key. On many free keys that model has
  a limit of zero, so it will fail with a quota message. That is expected. The app then gives you the
  prompts: paste them into the Gemini app, save the pictures as `img-1.png`, `img-2.png`... in
  `output/<your-site>/`, and click Generate site again. All the routes (ChatGPT, Gemini, Pexels,
  Pollinations, Cloudflare Workers AI, Hugging Face, Higgsfield) and ready prompts are in `IMAGES.md`.
- **Hero video.** Click **Find hero video (Pexels)**. With your Pexels key, the app searches short
  landscape clips for your niche and saves `hero.mp4` and `hero-poster.jpg` in `output/<your-site>/`.
  Click again for the next clip, then Generate site. Look at the clip before you use it: the search
  matches words, not what is in the picture.
  Other routes: download a clip from https://www.pexels.com/videos/ by hand (Pexels license: free to
  use), or paste the hero video prompt into Veo in the Gemini app (availability depends on your plan,
  check yours).

## Honest limits

- The site is a first draft. Read every line before you publish it. AI gets facts wrong.
- Fun facts are told to stick to well-established facts. Check them anyway.
- Affiliate links are Amazon **search** links with your tag, built by the server. They are not
  specific products. The page includes the line "As an Amazon Associate I earn from qualifying purchases."
- Health and medicine sections tell readers to ask a vet or the right professional first. Keep that line.
- Rebuilding someone's site for a pitch is fine. Publishing it as theirs without permission is not.
- Generation takes 30 to 90 seconds. Some sites block the page reader, so the URL mode may not work on every site.
- This tool writes a page. It does not host it, bring traffic or make sales.

Created by Hector Diaz, founder of Orbix Automation Solutions.
