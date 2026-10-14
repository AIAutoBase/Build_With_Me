# Site Studio — where the images come from

The free Gemini API key no longer makes images: on most free keys the image model has a limit of
zero, and the app's **Generate images** button comes back with a quota message. That is expected.
The app does not stop there. **Generate images** tries, in order: Gemini → Cloudflare Workers AI (only if
`CF_ACCOUNT_ID` and `CF_AI_TOKEN` are in `.env`) → Pollinations (free, no key, rate limited). The status line
names the provider for each image. Two more buttons: **Use Pexels photos** (real photos, your Pexels key) and
**Copy prompt for ChatGPT / Gemini** (one prompt to paste in the browser).

For anything the buttons cannot make, pick a route below, make the pictures by hand, and drop them into the site folder.

**Where the files go:** `output/<your-site>/img-1.png`, `img-2.jpg`, ... (`.png`, `.jpg` or `.webp`).
Then click **Generate site** again; the app places them.

Checked 14 October 2026. Free tiers change often. Check each provider's current page before you count on it.

---

## Pick a route

| Route | Cost | Needs | Best for |
|---|---|---|---|
| **ChatGPT in the browser** | Free account has a small daily image limit; paid plans more | An OpenAI account | Fastest by hand. Good with text-free photo styles |
| **Gemini app / Google AI Studio (browser)** | Gemini app: free with daily limits. API images: paid (billing on) | A Google account | Same model the app tried, just by hand |
| **Pexels photos** | Free, no attribution required | Nothing (or the Pexels key you already have) | Real photos. No AI at all |
| **Pollinations.ai** | Free | Nothing for basic use; a free sign-in raises limits | One URL per image. Good for testing |
| **Cloudflare Workers AI** | Free daily allowance (10,000 Neurons/day) | A free Cloudflare account + an API token | Free and scriptable. Good for doing many images |
| **Hugging Face Inference** | Free users get a very small monthly credit | A free account + an access token | Trying open models (FLUX) |
| **Higgsfield API** | Paid, prepaid balance | An account + funds + API key | Highest quality, also video. Costs money |
| **Gemini API, paid** | Paid per image | Billing turned on for your key | Makes the app's button work as written |

---

## The images a one-page site needs

Six images cover almost every niche. Make them in this order, save with these names:

| File | What | Shape |
|---|---|---|
| `img-1.png` | Main mood shot (also good as hero poster) | 16:9 |
| `img-2.png` | About / who we are | 4:3 |
| `img-3.png` | Product category 1 | 1:1 |
| `img-4.png` | Product category 2 | 1:1 |
| `img-5.png` | Product category 3 | 1:1 |
| `img-6.png` | Community / call to action | 4:3 |

Keep each under about 300 KB. Shrink with: `ffmpeg -i big.png -vf scale=1280:-1 img-1.png`

---

## Prompt for ChatGPT (browser)

Open https://chatgpt.com, start a new chat, paste this once. Then type `next` after each image.
Download each one and rename it as the table says.

```text
You are making the image set for a one-page website. Make ONE image per message, in order. After each image, wait for me to type "next".

Website: blackcatmom.com, a home for black cat lovers: fun facts, toys, food and health picks, and a community.
Style for every image: photographic, warm low-key lighting, deep charcoal and warm amber tones, gold eye highlights, elegant and cozy, not spooky. No people's faces, no brand logos, no text, no watermark.

1. 16:9 wide. Two sleek black cats playing on a warm wooden floor in a cozy living room at dusk, one mid-pounce toward a feather wand toy. Calm darker space on the left third for a headline.
2. 4:3. A black cat with glowing gold eyes on a windowsill at blue hour, warm lamp light on its fur, calm and curious.
3. 1:1 square. A young black cat on its back batting a feather toy, paws up, playful, wooden floor.
4. 1:1 square. A black cat eating from a simple cream ceramic bowl on a warm kitchen floor, morning golden light. No packaging.
5. 1:1 square. A calm black cat sitting on a soft blanket next to a plain grooming brush and a small unlabeled bottle, gentle daylight, healthy shiny coat. No pills, no labels.
6. 4:3. Three black cats of different ages relaxing together on a cozy sofa with warm string lights in the background, a feeling of family and community.

Start with image 1 now.
```

## Prompt for Gemini (gemini.google.com or Google AI Studio)

**Gemini app:** open https://gemini.google.com, start a new chat, paste the same prompt as above.
**Google AI Studio:** open https://aistudio.google.com, start a new chat, choose an image model
(the one named Nano Banana / "Gemini ... Image") in the model picker, paste the prompt below.
If AI Studio asks you to turn on billing, use the Gemini app instead.

```text
Generate one image only, then stop. Aspect ratio 16:9.
Photographic, warm low-key lighting, deep charcoal and warm amber tones, gold eye highlights, elegant and cozy, not spooky. No people's faces, no brand logos, no text, no watermark.
Two sleek black cats playing on a warm wooden floor in a cozy living room at dusk, one mid-pounce toward a feather wand toy. Calm darker space on the left third for a headline.
```

Then send one message per image, changing only the last two lines (shape and scene) to items 2-6 from
the ChatGPT prompt. Gemini images carry an invisible SynthID mark; fine for a website.

### Any other niche

Ask ChatGPT or Gemini to write the list for you first:

```text
I am building a one-page website. Theme: <theme>. Niche: <niche>. Description: <description>.
Write 6 image prompts for it, numbered, with these shapes: 1) 16:9 main mood shot with calm space on the left for a headline, 2) 4:3 about, 3-5) 1:1 one per product category: <categories>, 6) 4:3 community.
One shared style line at the top that fits the brand. Every prompt ends with: no people's faces, no brand logos, no text, no watermark.
```

Then paste the result into the ChatGPT prompt above in place of the blackcatmom list.

---

## How to set up each route

### Pexels photos (free, no AI)

1. Go to https://www.pexels.com, search your niche ("black cat"), filter **Orientation**.
2. Open a photo, **Free download**, pick a size around 1280 px wide.
3. Rename to `img-1.jpg`.
Pexels license: free to use, attribution not required but appreciated.

### Pollinations.ai (free)

No account needed for basic use. Paste this in the browser, change the words after `/prompt/`:

```text
https://image.pollinations.ai/prompt/black%20cat%20playing%20with%20a%20feather%20toy,%20warm%20light,%20photographic?width=1280&height=720&nologo=true&seed=7
```

Right-click, save as `img-1.jpg`. The app's **Generate images** button does this for you when Gemini and
Cloudflare are not available. Anonymous use is rate limited: in our test on 14 October it made 2 of 3 images,
then answered HTTP 402 until we waited. A free token from https://auth.pollinations.ai raises the limits;
put it in `.env` as `POLLINATIONS_TOKEN=...`.
Change `seed` to get a different picture.

### Cloudflare Workers AI (free daily allowance)

1. Sign up free at https://dash.cloudflare.com.
2. Copy your **Account ID** (right side of the account home page).
3. Go to **AI** → **Workers AI** → **Use REST API** → **Create a Workers AI API Token**. Copy the token.
4. Add both to `.env`: `CF_ACCOUNT_ID=...` and `CF_AI_TOKEN=...`. Never paste them into chat.
5. Test from a terminal (PowerShell or bash; on Windows use Git Bash for this line):

```bash
curl -s https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/ai/run/@cf/black-forest-labs/flux-1-schnell \
  -H "Authorization: Bearer $CF_AI_TOKEN" \
  -d '{"prompt":"black cat playing with a feather toy, warm light, photographic","steps":8}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>require('fs').writeFileSync('img-1.jpg',Buffer.from(JSON.parse(s).result.image,'base64')))"
```

Free allowance: 10,000 Neurons a day, reset at 00:00 UTC — enough for many images at default size.
Over that, calls fail on the free plan. With both values in `.env`, restart the server: **Generate images**
uses Cloudflare automatically after Gemini.

### Hugging Face Inference (very small free credit)

1. Sign up at https://huggingface.co.
2. **Settings** → **Access Tokens** → **Create new token** → fine-grained, tick
   **Make calls to Inference Providers**. Copy it into `.env` as `HF_TOKEN=...`.
3. Open a model page such as `black-forest-labs/FLUX.1-schnell`, click **Deploy** → **Inference Providers**,
   and copy the code sample it shows (it is kept current there).

Free users get a very small monthly credit (listed as $0.10 per month, subject to change), so expect only
a handful of images. Good for trying models, not for a whole site.

### Higgsfield (paid)

1. Create an account at https://higgsfield.ai?fpr=hector-97b94d
   *(affiliate link: Hector may earn a commission if you buy, at no extra cost to you)*.
2. By hand: use the image tools on the website with your plan's credits. Download, rename.
3. By API: the API is a separate prepaid balance (no subscription). Add funds, create an API key in the
   API section, and follow Higgsfield's API docs for the endpoint. Check current per-image prices first.

### Gemini API, paid

Turn on billing for the Google Cloud project behind your AI Studio key (AI Studio → **Get API key** →
your key → set up billing). The app's **Generate images** button then works as written. You pay per
image; check Google's current pricing before you run a batch.

### ChatGPT and Gemini, by hand

Use the two prompts above. Free accounts have daily image limits; when you hit one, switch tools or
wait for the reset.
