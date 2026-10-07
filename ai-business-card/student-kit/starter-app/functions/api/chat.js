// Cloudflare Pages Function: POST /api/chat
// The browser never sees the API key; it lives in env.GEMINI_API_KEY (a Cloudflare secret).
// The system prompt is built HERE from config.json, so visitors can't rewrite the bot's rules.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: 'Server is missing GEMINI_API_KEY' }, 500);

  let messages;
  try { ({ messages } = await request.json()); } catch { return json({ error: 'Bad JSON' }, 400); }
  if (!Array.isArray(messages) || !messages.length) return json({ error: 'No messages' }, 400);

  // Trust boundary: keep only the last 10 turns, 500 chars each, known roles only.
  const contents = messages.slice(-10).map((m) => ({
    role: m.role === 'bot' ? 'model' : 'user',
    parts: [{ text: String(m.text ?? '').slice(0, 500) }],
  }));

  const cfg = await (await env.ASSETS.fetch(new URL('/config.json', request.url))).json();
  const system = [
    `You are ${cfg.bot.name}, the AI assistant for ${cfg.name}. Always make clear you are an AI if asked.`,
    `Personality: ${cfg.bot.personality}`,
    'Answer ONLY from the facts below. If the answer is not there, say you are not sure and point to the contact info.',
    'Keep answers under 60 words.',
    'Facts:',
    ...cfg.bot.knowledge.map((k) => `- ${k}`),
  ].join('\n');

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
  });
  if (!r.ok) return json({ error: `Model error ${r.status}` }, 502);

  const data = await r.json();
  const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || 'Sorry, I have no answer.';
  return json({ reply });
}
