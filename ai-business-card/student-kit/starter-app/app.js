// Loads config.json and fills every page. Students edit config.json, not this file.
const cfg = await (await fetch('/config.json')).json();
const $ = (s) => document.querySelector(s);
const page = location.pathname.split('/').pop().replace('.html', '') || 'index';

document.documentElement.style.setProperty('--accent', cfg.accent);
document.title = `${cfg.name} | ${page === 'index' ? 'Home' : page}`;

$('#site-header').innerHTML = `
  <img src="${cfg.logo}" alt="${cfg.name} logo">
  <strong>${cfg.name}</strong>
  <nav>
    <a href="/" ${page === 'index' ? 'aria-current' : ''}>Home</a>
    <a href="/chat.html" ${page === 'chat' ? 'aria-current' : ''}>Chat</a>
    <a href="/about.html" ${page === 'about' ? 'aria-current' : ''}>About</a>
  </nav>`;
$('#site-footer').textContent = `© ${new Date().getFullYear()} ${cfg.name}`;

// textContent everywhere config text is shown: no HTML injection from edited config
if ($('#tagline')) {
  $('#name').textContent = cfg.name;
  $('#tagline').textContent = cfg.tagline;
  $('#links').replaceChildren(...cfg.links.map((l) => Object.assign(document.createElement('a'),
    { className: 'btn alt', href: l.url, textContent: l.label })));
}
if ($('#about-text')) {
  $('#about-title').textContent = cfg.about.title;
  $('#about-text').textContent = cfg.about.text;
  $('#facts').replaceChildren(...cfg.about.facts.map((f) => Object.assign(document.createElement('li'), { textContent: f })));
}

if ($('#log')) {
  const history = [];
  const add = (role, text) => {
    const d = Object.assign(document.createElement('div'), { className: `msg ${role}`, textContent: text });
    $('#log').append(d);
    $('#log').scrollTop = $('#log').scrollHeight;
    return d;
  };
  add('bot', cfg.bot.greeting);
  $('#bot-name').textContent = cfg.bot.name;

  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = $('#input').value.trim();
    if (!text) return;
    $('#input').value = '';
    add('user', text);
    history.push({ role: 'user', text });
    const pending = add('bot', '…');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || r.status);
      pending.textContent = data.reply;
      history.push({ role: 'bot', text: data.reply });
    } catch (err) {
      pending.textContent = `Sorry, something went wrong (${err.message}).`;
      history.pop(); // drop the unanswered question so the next try stays clean
    }
  });
}
