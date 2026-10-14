const FIELDS = [
  { id: 'name', label: 'Site or business name' },
  { id: 'domain', label: 'Domain', hint: 'example.com' },
  { id: 'audience', label: 'Target audience' },
  { id: 'tone', label: 'Tone', hint: 'e.g. warm, playful, expert' },
  { id: 'palette', label: 'Color palette', hint: '3-4 colors as hex codes with names' },
  { id: 'sections', label: 'Sections', type: 'checks',
    options: ['hero', 'about', 'fun facts', 'products', 'social', 'community', 'contact', 'FAQ'] },
  { id: 'cta', label: 'Call to action' },
  { id: 'amazonTag', label: 'Amazon affiliate tag', hint: 'yourtag-20', noSuggest: true },
  { id: 'affiliateCategories', label: 'Affiliate categories', hint: 'comma-separated, e.g. toys, food, health' },
  { id: 'social', label: 'Social platforms', hint: 'comma-separated' },
  { id: 'heroVideoPrompt', label: 'Hero video prompt', hint: 'for Veo in the Gemini app, 8 seconds, no text' },
  { id: 'imagePrompts', label: 'Image prompts', type: 'area', hint: 'one per line, max 4' },
  { id: 'existingUrl', label: 'Existing site URL', hint: 'to improve a site that already exists', noSuggest: true },
];

const form = document.getElementById('form');
const status = document.getElementById('status');
const say = (msg, bad) => { status.textContent = msg; status.className = bad ? 'bad' : ''; };

for (const f of FIELDS) {
  const row = document.createElement('div');
  row.className = 'row';
  let input;
  if (f.type === 'checks') {
    input = `<fieldset><legend>${f.label}</legend>` + f.options.map(o =>
      `<label class="check"><input type="checkbox" name="sections" value="${o}"> ${o}</label>`).join('') + `</fieldset>`;
  } else if (f.type === 'area') {
    input = `<label>${f.label}<textarea name="${f.id}" rows="3" placeholder="${f.hint || ''}"></textarea></label>`;
  } else {
    input = `<label>${f.label}<input name="${f.id}" placeholder="${f.hint || ''}"></label>`;
  }
  row.innerHTML = input + (f.noSuggest ? '' : `<button type="button" data-suggest="${f.id}">Suggest</button>`);
  document.getElementById('optional').append(row);
}

function readForm() {
  const data = Object.fromEntries(new FormData(form));
  data.sections = [...form.querySelectorAll('[name=sections]:checked')].map(c => c.value);
  return data;
}

function setField(id, value) {
  if (id === 'sections') {
    const wanted = String(value).toLowerCase();
    form.querySelectorAll('[name=sections]').forEach(c => { c.checked = wanted.includes(c.value.toLowerCase()); });
  } else if (form.elements[id]) {
    form.elements[id].value = value;
  }
}

async function api(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

function requireBasics() {
  const f = readForm();
  if (f.theme && f.niche && f.description) return f;
  say('Theme, Niche and Description come first.', true);
}

async function run(button, label, fn) {
  button.disabled = true;
  say(label);
  try { await fn(); } catch (e) { say(e.message, true); }
  button.disabled = false;
}

form.addEventListener('click', e => {
  const id = e.target.dataset?.suggest;
  if (!id) return;
  const f = requireBasics();
  if (!f) return;
  const field = FIELDS.find(x => x.id === id);
  run(e.target, `Asking Gemini for ${field.label}...`, async () => {
    const { value } = await api('suggest', { field: id, label: field.label + (field.hint ? ` (${field.hint})` : ''), form: f });
    setField(id, value);
    say(`${field.label}: done.`);
  });
});

document.getElementById('fill').onclick = e => {
  const f = requireBasics();
  if (!f) return;
  const fields = FIELDS.filter(x => !x.noSuggest && !(Array.isArray(f[x.id]) ? f[x.id].length : f[x.id]));
  run(e.target, 'Filling every empty field...', async () => {
    const { values } = await api('fill', { form: f, fields });
    for (const [k, v] of Object.entries(values)) setField(k, Array.isArray(v) ? v.join(', ') : v);
    say(`Filled ${Object.keys(values).length} fields. Edit anything, then Generate site.`);
  });
};

document.getElementById('generate').onclick = e => {
  const f = requireBasics();
  if (!f) return;
  run(e.target, 'Writing your site. This takes 30-90 seconds...', async () => {
    const r = await api('generate', { form: f });
    const src = `${r.url}?t=${Date.now()}`;
    document.getElementById('preview').src = src;
    document.getElementById('open').href = src;
    document.getElementById('download').href = r.url;
    document.getElementById('previewBar').hidden = false;
    say(`Saved to output/${r.slug}/index.html (${r.images.length} images, ${r.hasVideo ? 'video hero' : 'gradient hero'}).`);
  });
};

document.getElementById('images').onclick = e => {
  const f = requireBasics();
  if (!f) return;
  run(e.target, 'Making images: Gemini, then Cloudflare, then Pollinations. Up to a minute each...', async () => {
    const r = await api('images', { form: f });
    say(r.message, r.failed.length > 0);
  });
};

document.getElementById('photos').onclick = e => {
  const f = requireBasics();
  if (!f) return;
  run(e.target, 'Getting photos from Pexels...', async () => say((await api('photos', { form: f })).message));
};

// One prompt for ChatGPT or the Gemini app: one image per message, type "next" for the following one.
document.getElementById('copyPrompt').onclick = async () => {
  const f = requireBasics();
  if (!f) return;
  const list = String(f.imagePrompts || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!list.length) return say('Fill Image prompts first (Suggest or Fill everything).', true);
  const text = `You are making the image set for a one-page website. Make ONE image per message, in order. ` +
    `After each image, wait for me to type "next".\n\n` +
    `Website: ${f.name || f.domain || f.niche}. ${f.description}\n` +
    `Style for every image: ${f.tone || 'warm, photographic'}; colors: ${f.palette || 'from the brand'}. ` +
    `No people's faces, no brand logos, no text, no watermark.\n\n` +
    list.map((p, i) => `${i + 1}. ${p}`).join('\n') + `\n\nStart with image 1 now.`;
  await navigator.clipboard.writeText(text);
  say(`Copied. Paste it into chatgpt.com or gemini.google.com, save the results as img-1.png, img-2.png... in output/<your-site>/.`);
};

let videoPick = 0;
document.getElementById('video').onclick = e => {
  const f = requireBasics();
  if (!f) return;
  run(e.target, 'Searching Pexels for a hero video...', async () => {
    const r = await api('video', { form: f, pick: videoPick++ });
    say(r.message);
  });
};
