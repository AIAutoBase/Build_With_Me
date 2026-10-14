# Site Studio: the 4 live prompts

Open an empty folder called `site-studio` in Claude Code. Paste one prompt at a time.
After each one, open http://localhost:8787 and show the result before moving on.

## Think first (3 min, keyboard off)

- **Who uses it?** You. You are about to pitch a shop, fix your own site, or start a new one.
- **What do they need?** A real one-page site in minutes, not a blank editor.
- **Smallest thing that works?** One form, one Node file, one HTML file out. No database, no npm install.

Write this on screen: **3 fields in. AI fills the rest. One HTML file out.**

## Prompt 1: scaffold (min 3-8)

```text
STEP 0 - DESIGN SKILL (do this first)
- Check whether Anthropic's frontend-design plugin is installed: run `claude plugin list` and look for frontend-design@claude-plugins-official.
- If it is missing, install it:
    claude plugin marketplace add anthropics/claude-plugins-official   (skip if that marketplace is already added)
    claude plugin install frontend-design@claude-plugins-official --scope user
- A plugin installed now only loads in the next session. So if the frontend-design skill is not already available to you, read its SKILL.md directly: the installPath is in ~/.claude/plugins/installed_plugins.json, the file is <installPath>/skills/frontend-design/SKILL.md. Follow it for all the UI work in this build.
- Tell me in one line: already installed, or installed now.

Then build a small local web app called Site Studio.

- Zero npm dependencies. One server.mjs for Node 20+, run with `node server.mjs`, port 8787.
  It serves index.html, app.js, style.css and anything under output/.
- Read GEMINI_API_KEY from the environment or from a .env file next to server.mjs.
  Add .env.example (empty key) and a .gitignore with .env and output/.
- index.html: a form. Required: Theme, Niche, Description.
  Optional: Site name, Domain, Target audience, Tone, Color palette, Sections (checkboxes:
  hero, about, fun facts, products, social, community, contact, FAQ), Call to action,
  Amazon affiliate tag, Affiliate categories, Social platforms, Hero video prompt,
  Image prompts (textarea, one per line), Existing site URL.
- Right side: a status line and an empty iframe for the preview later.
- Clean, large text, readable on a 1080p stream, works on a phone. Light and dark mode.
- Keep the code short. Students will read it.

Port 8787 may already be taken by a placeholder page. Before starting the server, stop whatever is listening on 8787 (on Windows: Stop-Process -Id (Get-NetTCPConnection -LocalPort 8787 -State Listen).OwningProcess).
Start the server when done and tell me the URL.
```

**Show:** the line that says whether frontend-design was installed, then the form at localhost:8787.
Say: the design skill is why the form does not look like every other AI-made page.

## Prompt 2: AI suggest + fill everything (min 8-13)

```text
Add Gemini to Site Studio.

- server.mjs: a helper that calls the Gemini REST API generateContent with model
  gemini-2.5-flash and the x-goog-api-key header. Use built-in fetch. No SDK.
- POST /api/suggest {field, label, form}: ask Gemini for a value for that one field, using
  everything already in the form as context. Return {value}. Only the value, no explanation.
- POST /api/fill {form, fields}: ask for ALL empty fields in one call. Use
  responseMimeType "application/json". Return {values}.
- UI: a "Suggest" button next to every optional field (not the affiliate tag or the URL),
  and a "Fill everything" button that fills only the empty fields.
  Sections suggestions should tick the matching checkboxes.
- If there is no key, the error must say: get a free key at https://aistudio.google.com/apikey
  and put GEMINI_API_KEY in .env. Show every API error in the status line in plain words.

Restart the server.
```

**Show:** type cats / black cats / description, click Suggest on Tone, then Fill everything.

## Prompt 3: generate the site (min 13-18)

```text
Add "Generate site".

- POST /api/generate {form}: ask gemini-2.5-flash for ONE complete HTML file. Inline CSS,
  no external JavaScript, no frameworks. Use every form field.
- Save it to output/<slug>/index.html. Slug = domain without the TLD, else the name, else the niche.
- Affiliate links: the SERVER builds them, never the model. One per category:
  https://www.amazon.com/s?k=<niche + category>&tag=<amazon tag>
  Give the model those exact URLs. After generation, replace any other amazon.com product URL
  with a search link. The page must include: "As an Amazon Associate I earn from qualifying purchases."
- Tell the model: facts sections only state well-established facts. Health or medicine content
  says to ask a veterinarian (or the right professional) first. No fake reviews, no invented prices.
- Hero: if output/<slug>/hero.mp4 exists, use <video autoplay muted loop playsinline> with a poster.
  Otherwise a CSS gradient from the palette.
- If Existing site URL is filled, fetch that page on the server, strip the tags, keep the first
  6000 characters, and tell the model to keep its real facts and improve the rest.
- UI: show the result in the iframe (load /output/<slug>/index.html), plus "Open in new tab"
  and "Download HTML".

Restart the server.
```

**Show:** Generate site. It takes 30-90 seconds. Talk through the prompt while it runs.

## Prompt 4: images (min 18-22)

```text
Add images, with free routes first.

- POST /api/images {form}: for each Image prompt line (max 4), try these providers in order and keep the first that returns an image:
    1. Gemini gemini-2.5-flash-image (generateContent, image in inlineData base64). Free keys usually get 429 here; that is expected.
    2. Cloudflare Workers AI, only if CF_ACCOUNT_ID and CF_AI_TOKEN are set: POST https://api.cloudflare.com/client/v4/accounts/<id>/ai/run/@cf/black-forest-labs/flux-1-schnell with Bearer token, body {prompt, steps: 8}; image is base64 in result.image (jpg).
    3. Pollinations (free, no key): GET https://image.pollinations.ai/prompt/<url-encoded prompt>?nologo=true&seed=<n>&width=1280&height=720. If POLLINATIONS_TOKEN is set, send it as a Bearer token. Anonymous use answers 402 or 429 when you go too fast: wait 16 seconds and retry at width=768&height=432, up to 3 tries.
  Save as output/<slug>/img-N.png or .jpg (delete an older img-N with the other extension). Report which provider made each image.
- If every provider fails for an image, do not crash. Say how many were made and tell the user to click "Copy prompt for ChatGPT / Gemini" for the rest. More routes are in IMAGES.md.
- Button "Use Pexels photos" -> POST /api/photos {form}: GET https://api.pexels.com/v1/search?query=<niche>&orientation=landscape&per_page=<number of image prompts, max 6> with header Authorization: <PEXELS_API_KEY>. Save each photo's src.landscape as img-N.jpg and [{author, url}] as photo-credits.json. In /api/generate, put "Photos by <authors, linked> on Pexels" in the footer.
- Button "Copy prompt for ChatGPT / Gemini" (browser only, no server call): copy to the clipboard one prompt that says "Make ONE image per message, in order. After each image, wait for me to type next", then the website name and description, one style line from Tone and Color palette ending "No people's faces, no brand logos, no text, no watermark", then the image prompts numbered, then "Start with image 1 now." Status line: paste it into chatgpt.com or gemini.google.com and save the results as img-1.png, img-2.png... in output/<slug>/.
- Add CF_ACCOUNT_ID, CF_AI_TOKEN and POLLINATIONS_TOKEN (all optional) to .env.example.
- Read PORT from the environment, default 8787.
- In /api/generate: if img-N files (.png, .jpg or .webp) exist in the folder, tell the model to use them with
  relative paths. If none exist, no <img> tags at all.

Restart the server.
```

**Show:** Generate images. Gemini says 429 (free keys get zero images), then Pollinations makes them for free.
Read the status line out loud: it names the provider for each image. If Pollinations runs out (it is rate
limited), click **Copy prompt for ChatGPT / Gemini**, paste it into chatgpt.com, save the pictures into the
folder, generate again. Or click **Use Pexels photos** for real photos. All routes: `IMAGES.md`.

## Prompt 5 (optional): hero video from Pexels

Needs a free Pexels key. Before class, tell everyone: create it at https://www.pexels.com/api/
(Get started, short form, copy the key from "Your API key") and add `PEXELS_API_KEY=` to `.env`.

```text
Add "Find hero video (Pexels)".

- Read PEXELS_API_KEY like GEMINI_API_KEY. If it is missing, the error must say: free key at
  https://www.pexels.com/api/ , click "Your API key", put PEXELS_API_KEY in .env and restart.
- POST /api/video {form, pick}: GET https://api.pexels.com/videos/search?query=<niche>&orientation=landscape
  with header Authorization: <key>. Keep clips of 30 seconds or less that have a video file 1280-1920 px wide
  (take the smallest). Use result number `pick` (each click asks for the next one).
- Download that file to output/<slug>/hero.mp4 and the video's `image` to hero-poster.jpg.
  Save {author, url} to hero-credit.json.
- In /api/generate, use hero-poster.jpg as the video poster, and put
  "Video by <author> on Pexels" (linked) in the footer.
- Status line: "Hero video N of M: <seconds>s by <author>. Click again for another, then Generate site."

Restart the server.
```

**Show:** click Find hero video, then Generate site. The hero now moves. Say: the search matches words,
not pictures, so look at the clip before you ship it.

## Min 22-25: run it on blackcatmom

| Field | Value |
|---|---|
| Theme | cats |
| Niche | black cats |
| Description | blackcatmom.com — a home for black cat lovers: fun facts, toys, food and health picks, and a community |
| Domain | blackcatmom.com |
| Amazon affiliate tag | YOURTAG-20 |
| Affiliate categories | toys, food, health |

Fill everything, then Generate site. Point at the three things: Amazon disclosure, "ask your vet" line, search links with the tag.

## If it breaks

| What you see | Fix |
|---|---|
| `No Gemini key found` | Create `.env` next to server.mjs with `GEMINI_API_KEY=...`, then restart the server. The server reads .env only at start. |
| `HTTP 429` / quota used up | Free tier limit hit. On the Gemini image model the free limit is zero; the app moves on to Pollinations. |
| `Pollinations: HTTP 402` | Anonymous Pollinations is rate limited. Wait a minute, or use Copy prompt for ChatGPT / Gemini, or Use Pexels photos. A free token from auth.pollinations.ai lifts it. |
| `No Pexels key found` | Create the free key at https://www.pexels.com/api/ , add `PEXELS_API_KEY=` to `.env`, restart. |
| `EADDRINUSE :8787` | An old server is still running. Stop it (Ctrl+C in that terminal) or ask Claude Code to stop whatever is on port 8787. |
| Preview is blank or shows raw code | The model wrapped the HTML in a ``` fence. Ask Claude Code to strip code fences before saving. |
| `Unexpected token` on Fill everything | Gemini sent text around the JSON. Make sure `responseMimeType: "application/json"` is in generationConfig. |

More than two minutes on one error: stop, `cd reference-app`, copy your `.env` in, `node server.mjs`, keep going.

Created by Hector Diaz, founder of Orbix Automation Solutions.
