# blackcatmom - image prompts

Where to run them:
- **Gemini app** (gemini.google.com or the phone app). Ask for an image, paste the prompt. Image generation there is "Nano Banana". State the aspect ratio in the prompt, as written below. If the shape comes out wrong, say "make it 16:9" (or the ratio you need) in the next message.
- **Free Gemini API key** (Google AI Studio). Image model quotas on the free tier change. If you get a quota or billing error, use the Gemini app instead. Do not spend time fixing it this morning.

Save every file into `blackcatmom-site/assets/` with the exact name shown. Export as JPG. Keep each image under ~300 KB (see the resize line at the end).

Shared style line (already inside each prompt): *photographic, warm low-key lighting, deep charcoal and warm amber tones, gold eye highlights, elegant and cozy, not spooky, no text, no watermark.*

Note: Gemini images carry an invisible SynthID mark. That is fine for a site.

---

## 1. Hero poster - `hero-poster.jpg` - 16:9 (1920x1080 or 1280x720)

Best option: take a frame from the finished hero video (ffmpeg line is in `03-HERO-VIDEO-PROMPTS.md`). The poster then matches the video. Use this prompt only if you have no video yet.

```
Photographic wide shot, 16:9. Two sleek black cats playing on a warm wooden floor in a cozy living room at dusk. One cat is mid-pounce toward a feather wand toy, the other watches with bright gold eyes. Warm amber lamp light from the side, deep charcoal shadows, soft background blur. Leave calm, darker space on the left third of the frame for a headline. Elegant and cozy, not spooky. No people, no text, no watermark.
```

## 2. Fun facts - `img/facts.jpg` - 4:3

```
Photographic portrait, 4:3. A black cat with glowing gold eyes sitting on a windowsill at blue hour, city lights softly blurred outside, warm amber lamp light on its fur showing a faint sheen. Calm, curious expression. Deep charcoal and warm gold palette, elegant, not spooky. No text, no watermark.
```

## 3. Toys - `img/toys.jpg` - 4:3

```
Photographic, 4:3. A young black cat on its back batting at a feather wand toy, paws up, whiskers forward, playful. Warm living room light, wooden floor, soft focus background with a cat tunnel. Charcoal and amber tones, gold eyes. No people, no hands visible, no brand logos, no text, no watermark.
```

## 4. Food - `img/food.jpg` - 4:3

```
Photographic, 4:3. A black cat eating from a simple cream ceramic bowl on a warm kitchen floor, morning golden light through a window, a small water fountain nearby out of focus. Clean, calm, homey. No packaging, no brand logos, no text, no watermark.
```

## 5. Health and care - `img/health.jpg` - 4:3

```
Photographic, 4:3. A relaxed black cat lying on a soft cream blanket while being gently brushed with a grooming brush, only the brush and a bit of sleeve visible, no face of any person. Warm soft light, calm mood, shiny black coat. No pills, no syringes, no medical setting, no brand logos, no text, no watermark.
```

## 6. Community - `img/community.jpg` - 3:2

```
Photographic, 3:2. Two black kittens curled up together asleep on a chunky knit blanket, warm lamp light, cozy evening mood, shallow depth of field. Charcoal, cream and amber palette. No text, no watermark.
```

## 7. Open Graph - `og-image.jpg` - 1200x630 (about 1.91:1, ask for 16:9 and crop)

Generate the photo without text. Add the words yourself later (Canva free, or ask Claude Code to make an HTML card and screenshot it), because image models still misspell words.

```
Photographic wide banner, 16:9. A single elegant black cat in profile sitting on a dark charcoal velvet surface, gold eyes catching warm light, a soft gold rim light along its back. Large empty dark area on the right half for a title to be added later. Minimal, premium, warm, not spooky. No text, no watermark.
```

Crop to 1200x630 (centered):

```powershell
ffmpeg -y -i og-raw.png -vf "scale=1200:-2,crop=1200:630" -q:v 3 og-image.jpg
```

Text to add on top (if you add it): **Black Cat Mom** / "Fun facts, toys and care for black cats".

## 8. Favicon and logo idea

The master prompt has Claude Code draw `favicon.svg` by hand (a black cat silhouette with two gold eyes). SVG stays sharp at 16 px and costs a few hundred bytes. Use the Gemini prompt below only to explore logo ideas. Do not ship a generated PNG as the favicon.

```
Minimal flat logo mark, 1:1. A sitting black cat silhouette, seen from the front, with two small gold almond-shaped eyes and a gentle curved tail. Solid black shape on a warm cream background, no gradients, no outline effects, bold simple shapes that still read at 16 pixels. No text, no watermark.
```

If you like one, ask Claude Code: "Redraw this idea as a clean SVG path in assets/favicon.svg, black body #141317 on transparent, gold eyes #d9a441."

---

## Free alternative: Pexels or Unsplash photos

Both are free to use under their own licenses, no attribution required. Check each photo: no people's faces you would need a release for, no visible brand logos.

| File | Search terms |
|---|---|
| hero-poster.jpg | `black cat playing`, `black cat living room`, `black cat feather toy` |
| img/facts.jpg | `black cat window`, `black cat gold eyes`, `black cat portrait` |
| img/toys.jpg | `cat playing toy`, `black kitten playing`, `cat feather wand` |
| img/food.jpg | `cat eating bowl`, `black cat kitchen`, `cat food bowl` |
| img/health.jpg | `cat brushing`, `cat grooming`, `black cat blanket` |
| img/community.jpg | `black kittens sleeping`, `two black kittens`, `kittens blanket` |
| og-image.jpg | `black cat dark background`, `black cat profile` |

Links: https://www.pexels.com/search/black%20cat/ and https://unsplash.com/s/photos/black-cat

## Resize everything before it goes on the site

One line per image (PowerShell, run inside `blackcatmom-site\assets\`):

```powershell
ffmpeg -y -i facts-raw.png -vf "scale=1200:-2" -q:v 4 img\facts.jpg
```

Section images: 1200 px wide is plenty. Poster: 1280 or 1920 wide. Aim for under 300 KB each. If a file is too big, raise `-q:v` to 5 or 6.
