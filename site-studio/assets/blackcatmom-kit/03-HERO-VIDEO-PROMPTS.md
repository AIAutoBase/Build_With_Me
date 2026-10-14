# blackcatmom - hero video

Target: `blackcatmom-site/assets/hero.mp4` (looping, muted, 12-20 s, under ~4 MB) and `hero-poster.jpg`.

## Honest note on Veo

Veo video generation in the Gemini app depends on your Gemini plan and its daily quota. Some plans have none, some have a few clips per day. **Check yours before counting on it.** Do not tell the class Veo is free on every plan.

Gemini app clips are short (about 8 s), may include sound, and may carry a visible watermark plus the invisible SynthID mark. We strip the sound. If a visible watermark bothers you, use Pexels instead; do not crop it out.

If Veo is not available or the quota runs out: go straight to the Pexels fallback below. It is faster anyway.

## Scene prompts for Veo (paste one per message in the Gemini app)

Ask for 16:9 in each. Generate 3-4 of them, keep the best.

**1. Feather wand chase**
```
Video, 8 seconds, 16:9, photographic. A sleek black cat chases a feather wand toy across a warm wooden floor in a cozy living room at dusk, quick paws, gold eyes tracking the feathers. Warm amber lamp light, deep charcoal shadows, smooth slow camera pan following the cat. Only the feathers and the end of the wand are visible, no hands, no people. No text, no captions, no logos. Calm ambient sound or silence.
```

**2. Toy mouse pounce**
```
Video, 8 seconds, 16:9, photographic. A black cat crouches low behind a sofa edge, wiggles, then pounces on a small grey toy mouse on a cream rug. Low camera at cat eye level, warm evening light, shallow depth of field. No people, no text, no logos.
```

**3. Kittens wrestling**
```
Video, 8 seconds, 16:9, photographic. Two fluffy black kittens play-wrestle gently on a chunky knit blanket, rolling and batting at each other, then pausing to look at the camera with gold eyes. Soft warm lamp light, cozy and cute, static camera. No people, no text, no logos.
```

**4. Sunbeam ball**
```
Video, 8 seconds, 16:9, photographic. A black cat lies in a warm sunbeam on a wooden floor and lazily bats a small jingle ball, the ball rolls away and the cat watches it. Golden afternoon light, dust in the light, slow gentle movement, static camera. No people, no text, no logos.
```

**5. Slow-motion leap**
```
Video, 8 seconds, 16:9, photographic, slow motion. A black cat leaps from the floor onto a cat tree platform, body stretched in mid-air, landing softly. Warm interior light, dark charcoal background, crisp detail on the fur. No people, no text, no logos.
```

**6. Calm closer (good last clip for the loop)**
```
Video, 8 seconds, 16:9, photographic. Close-up of a black cat's face in warm low light, slow blink, gold eyes, whiskers moving slightly, soft dark background. Very calm, almost still. No people, no text, no logos.
```

## Free fallback: Pexels videos

Pexels license: free to use, no attribution required. Still check each clip: no people's faces, no logos, no watermark.

Search terms:
- `black cat playing`
- `black kitten playing`
- `cat feather toy`
- `cat pouncing`
- `kittens playing`
- `black cat slow motion`
- `cat in sunlight`

Link: https://www.pexels.com/search/videos/black%20cat%20playing/

Download the **HD 1280x720** or **Full HD 1920x1080** version. Not 4K: it is slow to process and you do not need it.

## Stitch the clips into one loop (ffmpeg, PowerShell)

ffmpeg is already installed. Work in a scratch folder, for example `D:\blackcatmom-video\`. Rename your picks `c1.mp4`, `c2.mp4`, `c3.mp4`, `c4.mp4`.

**Step 1. Normalize each clip** (same size, same frame rate, no audio, 5 s each). Change `-ss 1` to start at the best second of each clip.

```powershell
cd D:\blackcatmom-video
foreach ($i in 1..4) {
  ffmpeg -y -ss 1 -t 5 -i "c$i.mp4" -an -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30,format=yuv420p" -c:v libx264 -crf 18 -preset fast "n$i.mp4"
}
```

**Step 2. Crossfade them into one file** (0.6 s fades, total about 18 s, H.264, no audio, faststart for the web).

```powershell
ffmpeg -y -i n1.mp4 -i n2.mp4 -i n3.mp4 -i n4.mp4 -filter_complex "[0][1]xfade=transition=fade:duration=0.6:offset=4.4[a];[a][2]xfade=transition=fade:duration=0.6:offset=8.8[b];[b][3]xfade=transition=fade:duration=0.6:offset=13.2,format=yuv420p[v]" -map "[v]" -an -c:v libx264 -preset slow -crf 27 -maxrate 1800k -bufsize 3600k -profile:v high -movflags +faststart hero.mp4
```

Offsets: each one is the previous offset + 5 - 0.6. With 3 clips, drop the last input and the `[b][3]` part, and end the `[a][2]` step with `,format=yuv420p[v]`.

**Step 3. Check the size.**

```powershell
"{0:N2} MB" -f ((Get-Item hero.mp4).Length / 1MB)
```

Over 4 MB: run Step 2 again with `-crf 29` and `-maxrate 1400k -bufsize 2800k`. Still too big: use 4 s clips (`-t 4` in Step 1, offsets 3.4, 6.8, 10.2).

Want 1080p instead? Change `1280:720` to `1920:1080` in Step 1 and raise `-maxrate` to `2500k`. It will be harder to stay under 4 MB. 720p is fine for a background.

**Step 4. Poster frame** (take a frame 2 s in; change the time to pick a better one).

```powershell
ffmpeg -y -ss 2 -i hero.mp4 -frames:v 1 -q:v 3 hero-poster.jpg
```

**Step 5. Copy both files into the site.**

```powershell
Copy-Item hero.mp4, hero-poster.jpg -Destination "<path to>\blackcatmom-site\assets\"
```

Loop seam: the video jumps from the last clip back to the first. Put the calm close-up (scene 6) last and a calm clip first, and the jump looks like a normal cut.
