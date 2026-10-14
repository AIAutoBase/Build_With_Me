// Site Studio: node server.mjs  ->  http://localhost:8787
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'output');
const PORT = Number(process.env.PORT) || 8787;
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

// Load .env next to this file (KEY=value lines). Real env vars win.
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const NO_KEY = 'No Gemini key found. Get a free key at https://aistudio.google.com/apikey, ' +
  'then put GEMINI_API_KEY=your-key in a .env file next to server.mjs and restart.';

async function gemini(model, parts, config = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error(NO_KEY);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: config }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) throw new Error('Gemini quota used up, or this model is not in your free tier (HTTP 429). Wait, or check billing at aistudio.google.com.');
  if (!res.ok) throw new Error(`Gemini said: ${(data.error?.message || res.statusText).split('\n')[0].slice(0, 200)} (HTTP ${res.status})`);
  return data.candidates?.[0]?.content?.parts || [];
}

const ask = async (prompt, config) =>
  (await gemini(TEXT_MODEL, [{ text: prompt }], config)).map(p => p.text || '').join('').trim();

const describe = form => Object.entries(form)
  .filter(([, v]) => v && String(v).trim())
  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');

const slugOf = f => (String(f.domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]
  || f.name || f.niche || 'site').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';

const list = v => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/)).map(s => s.trim()).filter(Boolean);

// Amazon links are built here, never by the model.
const affiliateLinks = f => {
  const tag = String(f.amazonTag || '').trim();
  return list(f.affiliateCategories).map(cat => {
    const q = encodeURIComponent(`${f.niche || f.theme || ''} ${cat}`.trim()).replace(/%20/g, '+');
    return { category: cat, url: `https://www.amazon.com/s?k=${q}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}` };
  });
};

async function pageText(url) {
  if (!/^https?:\/\//i.test(url)) throw new Error('Existing site URL must start with http:// or https://');
  const res = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 SiteStudio' } });
  if (!res.ok) throw new Error(`Could not read ${url} (HTTP ${res.status})`);
  return (await res.text())
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
    .trim().slice(0, 6000);
}

// Image providers, tried in order. Gemini needs billing on most keys; Cloudflare needs CF_ACCOUNT_ID + CF_AI_TOKEN;
// Pollinations is free with no key (rate limited).
async function geminiImage(prompt) {
  const img = (await gemini(IMAGE_MODEL, [{ text: prompt }])).find(p => p.inlineData)?.inlineData;
  if (!img) throw new Error('no image came back');
  return { ext: 'png', buf: Buffer.from(img.data, 'base64') };
}

async function cloudflareImage(prompt) {
  const { CF_ACCOUNT_ID: id, CF_AI_TOKEN: token } = process.env;
  if (!id || !token) throw new Error('CF_ACCOUNT_ID / CF_AI_TOKEN not set');
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, steps: 8 }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.result?.image) throw new Error(`HTTP ${res.status}`);
  return { ext: 'jpg', buf: Buffer.from(data.result.image, 'base64') };
}

// Anonymous Pollinations answers HTTP 402/429 when you go too fast (about one image every 15 s),
// and is stricter on large sizes. So: wait, retry smaller. A free token (POLLINATIONS_TOKEN,
// from https://auth.pollinations.ai) lifts the limits.
async function pollinationsImage(prompt, i) {
  const base = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${i + 1}`;
  const token = process.env.POLLINATIONS_TOKEN;
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  let status;
  for (const size of ['&width=1280&height=720', '&width=768&height=432', '&width=768&height=432']) {
    const res = await fetch(base + size, { headers, signal: AbortSignal.timeout(120000) });
    if (res.ok && res.headers.get('content-type')?.startsWith('image/')) return { ext: 'jpg', buf: Buffer.from(await res.arrayBuffer()) };
    status = res.status;
    if (status !== 402 && status !== 429) break;
    await new Promise(r => setTimeout(r, 16000));
  }
  throw new Error(`HTTP ${status}`);
}

const IMAGE_PROVIDERS = [['Gemini', geminiImage], ['Cloudflare Workers AI', cloudflareImage], ['Pollinations', pollinationsImage]];

const NO_PEXELS = 'No Pexels key found. It is free: sign up at https://www.pexels.com/api/ , click "Your API key", ' +
  'then put PEXELS_API_KEY=your-key in .env next to server.mjs and restart. Or download a clip by hand and save it as hero.mp4.';

const handlers = {
  async suggest({ field, label, form }) {
    const value = await ask(
      `You help plan a one-page website.\nWhat we know so far:\n${describe(form)}\n\n` +
      `Suggest a value for the field "${label || field}". Reply with ONLY the value, no quotes, no explanation. ` +
      `For lists, use comma-separated items. For image prompts, one prompt per line, 3 lines max.`,
      { thinkingConfig: { thinkingBudget: 0 } });
    return { value };
  },

  async fill({ form, fields }) {
    const empty = fields.filter(f => !String(form[f.id] || '').trim());
    if (!empty.length) return { values: {} };
    const text = await ask(
      `You help plan a one-page website.\nWhat we know so far:\n${describe(form)}\n\n` +
      `Return a JSON object with a value for each of these keys:\n` +
      empty.map(f => `- ${f.id}: ${f.label}${f.hint ? ` (${f.hint})` : ''}`).join('\n') +
      `\nAll values are strings. Lists are comma-separated. imagePrompts: one prompt per line, 3 lines max.`,
      { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } });
    return { values: JSON.parse(text) };
  },

  async generate({ form }) {
    if (!form.theme || !form.niche || !form.description) throw new Error('Theme, Niche and Description are required.');
    const slug = slugOf(form);
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const files = fs.readdirSync(dir);
    const images = files.filter(f => /^img-\d+\.(png|jpe?g|webp)$/i.test(f)).sort();
    const hasVideo = files.includes('hero.mp4');
    const photoCredits = files.includes('photo-credits.json') ? JSON.parse(fs.readFileSync(path.join(dir, 'photo-credits.json'), 'utf8')) : [];
    const credit = files.includes('hero-credit.json') ? JSON.parse(fs.readFileSync(path.join(dir, 'hero-credit.json'), 'utf8')) : null;
    const links = affiliateLinks(form);
    const existing = form.existingUrl ? await pageText(form.existingUrl) : '';

    let html = await ask(
      `Write ONE complete, self-contained HTML file for this website. Inline CSS only. No external JavaScript, ` +
      `no frameworks, no external fonts. Mobile-friendly, accessible, good contrast.\n\n` +
      `Site details:\n${describe({ ...form, existingUrl: '' })}\n\n` +
      (existing ? `This is the text of the CURRENT site. Keep its real facts (name, address, hours, services), ` +
        `improve the structure and copy:\n"""${existing}"""\n\n` : '') +
      `Hero: ` + (hasVideo
        ? `use <video autoplay muted loop playsinline poster="${files.includes('hero-poster.jpg') ? 'hero-poster.jpg' : images[0] || ''}"><source src="hero.mp4" type="video/mp4"></video> as a full-width background with the headline over it.\n`
        : `a bold CSS gradient background built from the color palette, headline on top.\n`) +
      (images.length ? `Use these images (same folder, relative paths) in sensible sections: ${images.join(', ')}.\n` : `Do not use any <img> tags.\n`) +
      (links.length ? `Affiliate section: one card per category with a button. Use EXACTLY these URLs, do not invent any other product links:\n` +
        links.map(l => `- ${l.category}: ${l.url}`).join('\n') +
        `\nAdd rel="sponsored noopener" target="_blank" to these links. ` +
        `Near them, show exactly: "As an Amazon Associate I earn from qualifying purchases."\n` : '') +
      (credit ? `In the footer, credit the video: "Video by <a href="${credit.url}">${credit.author}</a> on Pexels".\n` : '') +
      (photoCredits.length ? `In the footer, credit the photos: "Photos by ${photoCredits.map(c => `<a href="${c.url}">${c.author}</a>`).join(', ')} on Pexels".\n` : '') +
      `Rules:\n- Fun facts / facts sections: only well-established facts. No statistics you are not sure of.\n` +
      `- Any health, medicine or supplement content must tell the reader to ask a veterinarian (for pets) ` +
      `or the relevant professional first.\n- No fake testimonials, no fake reviews, no invented prices, no income claims.\n` +
      `- Contact/social: use placeholders like "@yourhandle" unless real handles were given.\n\n` +
      `Reply with only the HTML, starting with <!doctype html>.`);

    html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '').trim();
    if (links.length) {
      html = html.replace(/https?:\/\/(www\.)?(amazon\.[a-z.]+|amzn\.to)\/(?!s\?k=)[^"'\s>]*/gi, links[0].url);
      if (!html.includes('As an Amazon Associate I earn from qualifying purchases'))
        html = html.replace(/<\/body>/i, '<p style="text-align:center;font-size:.85rem;padding:1rem">As an Amazon Associate I earn from qualifying purchases.</p></body>');
    }
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    return { slug, url: `/output/${slug}/index.html`, images, hasVideo };
  },

  async video({ form, pick = 0 }) {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error(NO_PEXELS);
    const q = String(form.niche || form.theme).trim();
    const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=15`,
      { headers: { authorization: key } });
    if (!res.ok) throw new Error(`Pexels said HTTP ${res.status}. Check PEXELS_API_KEY.`);
    // Short clips with a 1280-1920 px file keep the hero small.
    const hits = (await res.json()).videos.filter(v => v.duration <= 30)
      .map(v => ({ v, file: v.video_files.filter(f => f.width >= 1280 && f.width <= 1920).sort((a, b) => a.width - b.width)[0] }))
      .filter(x => x.file);
    if (!hits.length) throw new Error(`No short landscape clips on Pexels for "${q}". Try a broader Niche.`);
    const { v, file } = hits[pick % hits.length];
    const slug = slugOf(form);
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const get = async u => Buffer.from(await (await fetch(u)).arrayBuffer());
    fs.writeFileSync(path.join(dir, 'hero.mp4'), await get(file.link));
    fs.writeFileSync(path.join(dir, 'hero-poster.jpg'), await get(v.image));
    const credit = { author: v.user.name, url: v.url };
    fs.writeFileSync(path.join(dir, 'hero-credit.json'), JSON.stringify(credit));
    return { slug, credit, of: hits.length, message: `Hero video ${pick % hits.length + 1} of ${hits.length}: ${v.duration}s by ${v.user.name}. Click again for another, then Generate site.` };
  },

  async images({ form }) {
    const prompts = String(form.imagePrompts || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 4);
    if (!prompts.length) throw new Error('Add at least one image prompt (one per line).');
    const slug = slugOf(form);
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const saved = [], failed = [];
    for (const [i, prompt] of prompts.entries()) {
      const errors = [];
      for (const [name, make] of IMAGE_PROVIDERS) {
        try {
          const { ext, buf } = await make(prompt, i);
          for (const f of fs.readdirSync(dir)) if (f.startsWith(`img-${i + 1}.`)) fs.unlinkSync(path.join(dir, f));
          const file = `img-${i + 1}.${ext}`;
          fs.writeFileSync(path.join(dir, file), buf);
          saved.push({ file: `/output/${slug}/${file}`, provider: name });
          break;
        } catch (e) { errors.push(`${name}: ${e.message}`); }
      }
      if (errors.length === IMAGE_PROVIDERS.length) failed.push({ prompt, error: errors.join(' | ') });
    }
    const used = [...new Set(saved.map(x => x.provider))].join(', ');
    const message = failed.length
      ? `${saved.length} made${used ? ` with ${used}` : ''}, ${failed.length} failed. Click "Copy prompt for ChatGPT / Gemini", ` +
        `make the rest by hand, save them as img-N.png or .jpg in output/${slug}/, then Generate site again. More routes: IMAGES.md.`
      : `${saved.length} images made with ${used}. Click Generate site again to place them in the page.`;
    return { slug, saved, failed, message };
  },

  async photos({ form }) {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error(NO_PEXELS);
    const count = Math.min(6, String(form.imagePrompts || '').split('\n').filter(s => s.trim()).length || 6);
    const q = String(form.niche || form.theme).trim();
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=${count}`,
      { headers: { authorization: key } });
    if (!res.ok) throw new Error(`Pexels said HTTP ${res.status}. Check PEXELS_API_KEY.`);
    const photos = (await res.json()).photos;
    if (!photos.length) throw new Error(`No Pexels photos for "${q}". Try a broader Niche.`);
    const slug = slugOf(form);
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const credits = [];
    for (const [i, ph] of photos.entries()) {
      for (const f of fs.readdirSync(dir)) if (f.startsWith(`img-${i + 1}.`)) fs.unlinkSync(path.join(dir, f));
      fs.writeFileSync(path.join(dir, `img-${i + 1}.jpg`), Buffer.from(await (await fetch(ph.src.landscape)).arrayBuffer()));
      credits.push({ author: ph.photographer, url: ph.url });
    }
    fs.writeFileSync(path.join(dir, 'photo-credits.json'), JSON.stringify(credits));
    return { slug, count: photos.length, message: `${photos.length} Pexels photos saved. Look at them, then Generate site.` };
  },
};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
    const fn = handlers[url.pathname.slice(5)];
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      if (!fn) throw new Error('Unknown endpoint');
      const result = await fn(JSON.parse(body || '{}'));
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(result));
    } catch (e) {
      console.error(url.pathname, e.message);
      res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)));
  const allowed = file.startsWith(OUT + path.sep) || ['index.html', 'app.js', 'style.css'].includes(path.relative(ROOT, file));
  if (!allowed || !fs.existsSync(file)) return res.writeHead(404).end('Not found');
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Site Studio on http://localhost:${PORT}` +
  (process.env.GEMINI_API_KEY ? '' : `\n${NO_KEY}`)));
