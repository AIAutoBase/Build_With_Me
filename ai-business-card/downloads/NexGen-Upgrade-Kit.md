# Upgrade Your Site: the NexGen Prompt Kit

**For the AI Automations by Hector community · Class 9, 7 October 2026**
Created by Hector Diaz, founder of Orbix Automation Solutions.

You built a small site with a chatbot in class. This kit is the next thirteen minutes, and the next thirty after that: a short sequence of prompts that turns a plain page into a polished one, with a looping video behind the hero, real service cards, a working contact path and a page that loads fast on a phone.

It is adapted from a community template called **NexGen Agency Website**, a landing page for a made-up digital agency. We kept its good idea (one clear page, one video, one call to action) and fixed what it left vague.

**What this kit will not do:** make your business look established if it isn't. Every prompt below asks the AI to use *your* words from `config.json`. If the page claims something you can't back up, delete it.

---

## What you end up with

A single landing page with five parts, in this order:

| Part | Job | The question it answers |
|---|---|---|
| Hero | A short promise, a video behind it, one button | What do you do, and what should I click? |
| Services | Three or four cards | Is this for me? |
| Work | Two or three real examples | Can you actually do it? |
| Contact | A short form | How do I start? |
| Footer | Email, links, one line about you | Who is behind this? |

Your chatbot page stays as it is. The new page links to it.

---

## Before you start (five minutes)

1. Your business card from class runs locally (`npx wrangler pages dev .`) and is committed to git. If it isn't committed, do that first. Everything below changes files, and git is how you undo a bad prompt.
2. Open `config.json`. Write down your four services, one line each, and two real examples of your work. No examples yet? Use a "how I would approach it" example and label it that way. Do not invent clients.
3. Pick **one** background picture of yours: your workspace, your product, your storefront, your tools. A clean, simple photo animates best.

**Rule for the whole kit:** run one prompt, look at the result in the browser, commit, then run the next. Never stack all of them in one go. When something breaks you will know which prompt did it.

---

## Step 1. Structure and content

Paste into Claude Code, in your site folder:

```text
Read config.json and the existing pages first.

Add a landing page section structure to index.html, in this order:
hero, services, work, contact, footer.

- Hero: headline and tagline from config.json, one primary button that scrolls to
  the contact section, one secondary link to chat.html.
- Services: 3 or 4 cards. Take the titles and one-line descriptions from a new
  "services" array in config.json. Add that array, with placeholder text I will replace.
- Work: 2 or 3 cards from a new "work" array in config.json (title, one sentence,
  optional link). Mark placeholders clearly as placeholders.
- Contact and footer: see the next prompt.

Rules: plain HTML, CSS and JavaScript, no framework, no build step. Every piece of
text comes from config.json. Keep it responsive, with the same light and dark mode
as the existing pages. Clean typography, generous spacing, subtle hover states on
cards and buttons. Do not invent claims, numbers, clients or testimonials.
```

Check: all five sections render, on a phone-width window too. Commit: `feat: landing page structure`.

---

## Step 2. A hero video that does not look broken

The original template generated its background video with Google's Whisk and Flow tools: upload a clean background image, then prompt the model to animate it. Those products change names and limits often, so check what is free today before you plan around one. Any short looping video clip works.

What matters more than the tool:

- **Short.** Five to ten seconds, looped.
- **Small.** Aim under 5 MB. Cloudflare Pages caps a single file at 25 MiB, and a phone on mobile data will not wait for more than a few.
- **Quiet motion.** Slow movement behind text is readable. Fast movement is not.
- **Yours.** Use footage or images you made or have the right to use.

**No video yet?** Use the sample loop from class (`hero.mp4` and `hero-poster.jpg`, in the community post): an abstract, slow-moving color field, 8 seconds, under 300 KB. It has no logo and no footage, so it is safe on any site, and replacing it later is one file swap.

Put the file at `assets/hero.mp4` (and a still frame at `assets/hero-poster.jpg`), then:

```text
Use assets/hero.mp4 as the background of the hero section, with
assets/hero-poster.jpg as its poster image.

- video attributes: autoplay, muted, loop, playsinline, preload="metadata".
- Cover the hero with object-fit: cover. Do not stretch or distort the video, and
  do not scale it above its native resolution.
- Put a dark gradient overlay between the video and the text, strong enough that
  the headline passes WCAG AA contrast (4.5:1) on top of the brightest frame.
- If the user has prefers-reduced-motion set, do not play the video: show the
  poster image only.
- If the video fails to load, the poster and the text must still look right.
```

Check in the browser:

- Zoom the hero to 200% and to a phone width. **Look for pixel breaks, banding and stretched edges.** If you see them, the video is lower resolution than the space it fills. Re-export it larger, or reduce the area it covers.
- Open DevTools, Network tab, and look at `hero.mp4`. Is it under 5 MB?
- Turn on "reduce motion" in your operating system. The video should stop.

Commit: `feat: hero video`.

### If the video looks flat or muddy

Say what you see, not what you want in the abstract:

```text
The hero text is hard to read over the bright part of the video. Increase the
overlay contrast until the headline is clearly readable, without making the video
look dead. Show me the CSS values you changed.
```

---

## Step 3. A contact form that actually delivers

A form that goes nowhere is worse than no form. You have two honest options.

**Option A, no backend (recommended for today):** replace the form with a button that opens `mailto:` with a subject line, plus your phone or booking link from `config.json`. It works on day one and can't silently lose a lead.

**Option B, a real form:** a Cloudflare Pages Function that validates the fields and sends you an email through a mail service you already have an account with.

```text
Add a contact form to the contact section: name, email, message.

- Labels on every field, visible validation messages, and aria-live on the
  status text.
- Post to /api/contact, written as a Cloudflare Pages Function in
  functions/api/contact.js.
- The function validates: name up to 100 characters, email shape, message up to
  1000 characters. Reject anything else with a clear 400 message.
- Add a hidden honeypot field that real people never fill in; drop those
  submissions quietly.
- Send the email with the mail service I name, using a secret in
  env.CONTACT_API_KEY. Never put the key in the browser code or in git. Add the
  name of the variable to .dev.vars.example with no value.
- On success show a thank-you message. On failure show the mailto link as a fallback.
```

**Test it with a real message to yourself before you publish.** Then test it with the key missing and check that you see the fallback and not a blank page.

Commit: `feat: contact form`.

---

## Step 4. Speed and polish

```text
Audit index.html for load speed and fix what you find:

- Images: set width and height, use loading="lazy" below the hero, convert large
  images to WebP.
- Load nothing render-blocking that the hero does not need.
- Add a scroll-triggered fade-in for the services and work cards using
  IntersectionObserver, disabled under prefers-reduced-motion.
- Add hover states to cards and buttons that are visible but quiet.
List every change you made and why.
```

Then run Lighthouse in Chrome DevTools (Lighthouse tab, mobile). Write down the Performance and Accessibility scores *before* and *after*. Your own two numbers are the proof; nobody else's matter here.

Commit: `perf: lazy images, scroll transitions`.

---

## Step 5. Accessibility pass

```text
Check the whole site for accessibility and fix it:

- Every interactive element reachable and usable by keyboard, with a visible focus ring.
- Skip link to main content.
- One h1 per page, headings in order.
- Alt text on every meaningful image, empty alt on decorative ones.
- Form errors announced to screen readers.
- Color contrast AA for all text, in light and dark mode.
List what you changed.
```

Test it yourself: put the mouse aside and use only Tab, Shift+Tab, Enter and Space across the whole page.

Commit: `fix: accessibility pass`. Tag it `v0.3.0`, then deploy.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Video never plays on iPhone | Missing `muted` or `playsinline` | Both attributes are required for autoplay |
| Video looks blocky or "pixel broken" | Source resolution smaller than the area it fills | Re-export larger, or crop the hero area smaller |
| Text unreadable over video | Overlay too light | Step 2 contrast prompt; test on the brightest frame |
| Deploy fails on the video | File over the Pages per-file limit | Compress it; keep under 5 MB |
| Form says sent but no email arrives | Secret not set on Cloudflare, or sender not verified | Set the secret, redeploy, test again |
| The AI rewrote something you liked | One prompt changed too much | `git diff`, then `git checkout -- <file>` and re-prompt smaller |

---

## Honest limits

- Lighthouse scores vary by device and network. Compare your own before and after, on the same machine.
- A looping video helps a first impression and hurts a slow connection. If your customers are mostly on phones, the poster-only version is a legitimate final choice.
- The chatbot still answers only from your facts, and your free model quota is small. The page works if the bot is down; keep it that way.
- These prompts were written before class and have not been run end to end on a student site yet. If one fails on yours, post what the AI did and we will fix the prompt.

---

## Share it

Post your before and after in the community, with one sentence on what you changed first. If something broke, post that too, along with the prompt that did it. That's the useful post.

Hector Diaz · AI Auto Base · Orbix Automation Solutions
