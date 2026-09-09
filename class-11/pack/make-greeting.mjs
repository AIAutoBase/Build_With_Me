#!/usr/bin/env node
// make-greeting.mjs -- render the two greeting transcripts into audio, with YOUR voice
// and YOUR key.
//
// The pack ships text, not audio. Two reasons, and the second is the real one:
//
//   1. The voice should be yours. A pack that hands everyone the same rendered voice
//      teaches you to run somebody else's assistant.
//   2. A cloned brand voice in a public zip is a cloned brand voice anybody can use as
//      their own assistant, forever, with no way to withdraw it.
//
// This is the ONLY file in this pack that makes a network request and the only one that
// costs money. The installer does not run it. You run it, once, before class.
//
//   node make-greeting.mjs --provider elevenlabs --voice <voice-id>
//   node make-greeting.mjs --provider openai --voice alloy
//   node make-greeting.mjs --dry-run          # prints what it would do, spends nothing
//
// It reads your key from the environment and never writes one anywhere:
//   ELEVENLABS_API_KEY   for --provider elevenlabs
//   OPENAI_API_KEY       for --provider openai

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const has = (name) => process.argv.includes(name);

const provider = arg('--provider', 'elevenlabs');
const voice = arg('--voice', null);
const outDir = path.resolve(arg('--out', HERE));
const dryRun = has('--dry-run');

const GREETINGS = [
  { src: 'greeting-standard.txt', out: 'greeting-standard.wav' },
  { src: 'greeting-recorded.txt', out: 'greeting-recorded.wav' },
];

const PROVIDERS = {
  elevenlabs: {
    envKey: 'ELEVENLABS_API_KEY',
    needsVoice: true,
    url: (v) => `https://api.elevenlabs.io/v1/text-to-speech/${v}?output_format=pcm_16000`,
    headers: (key) => ({ 'xi-api-key': key, 'Content-Type': 'application/json' }),
    body: (text) => JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    needsVoice: true,
    url: () => 'https://api.openai.com/v1/audio/speech',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    body: (text, v) => JSON.stringify({ model: 'tts-1', voice: v, input: text, response_format: 'wav' }),
  },
};

const spec = PROVIDERS[provider];
if (!spec) {
  console.error(`make-greeting: unknown provider "${provider}". Known: ${Object.keys(PROVIDERS).join(', ')}`);
  process.exit(2);
}

// Refuse rather than fall back. A silent fallback to some free default voice produces a
// greeting that works, sounds wrong, and that you will not notice until a caller hears it.
const key = process.env[spec.envKey];
if (!key && !dryRun) {
  console.error(
    `make-greeting: ${spec.envKey} is not set.\n` +
    `Set it in your environment. This script will not fall back to another provider and\n` +
    `will not write a key anywhere.`
  );
  process.exit(2);
}
if (spec.needsVoice && !voice) {
  console.error(`make-greeting: --voice is required for ${provider}.`);
  process.exit(2);
}

// The one thing this script checks about the text itself.
//
// The AI disclosure has to land inside the first four seconds, because that is roughly
// how long a caller waits before starting to talk. Anything after that gets said over
// them, and a disclosure the caller talked over is a disclosure that did not happen.
//
// This measures WORD POSITION, not sentence position, because seconds are what matters
// and words are the only proxy available here. Sentence boundaries are the wrong unit:
// "Hi, this is Clara. I'm an AI." puts the disclosure in the second sentence and inside
// three seconds, while a single forty-word sentence can bury it past ten.
//
// WORDS_PER_SECOND is an ESTIMATE and this guard cannot know your speaking rate or your
// provider's. Render the file and listen to it. If the disclosure lands late, the number
// to change is the text, not the constant.
const DISCLOSURE = /\bAI\b|\bartificial intelligence\b|\bnot a (?:real )?person\b/i;
const WORDS_PER_SECOND = 2.5;
const DISCLOSURE_DEADLINE_SECONDS = 4;

function checkDisclosure(text, file) {
  if (!DISCLOSURE.test(text)) {
    console.error(
      `make-greeting: ${file} does not identify Clara as an AI anywhere. Refusing to render it.\n` +
      `This is the one rule the greeting exists to carry.`
    );
    process.exit(1);
  }

  const words = text.trim().split(/\s+/);
  let wordIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (DISCLOSURE.test(words.slice(0, i + 1).join(' '))) { wordIndex = i + 1; break; }
  }

  const approxSeconds = wordIndex / WORDS_PER_SECOND;
  const maxWords = Math.floor(DISCLOSURE_DEADLINE_SECONDS * WORDS_PER_SECOND);

  if (wordIndex > maxWords) {
    console.error(
      `make-greeting: ${file} identifies Clara as an AI at word ${wordIndex}, roughly ` +
      `${approxSeconds.toFixed(1)}s in.\n` +
      `A caller starts talking after about ${DISCLOSURE_DEADLINE_SECONDS}s, so it has to be ` +
      `inside the first ${maxWords} words. Move it to the front.`
    );
    process.exit(1);
  }

  return { wordIndex, approxSeconds: approxSeconds.toFixed(1), maxWords };
}

for (const g of GREETINGS) {
  const srcPath = path.join(HERE, g.src);
  const text = fs.readFileSync(srcPath, 'utf8').trim();
  const { wordIndex, approxSeconds, maxWords } = checkDisclosure(text, g.src);

  console.log(`${g.src}`);
  console.log(`  disclosure at word ${wordIndex} (roughly ${approxSeconds}s in, limit is word ${maxWords})`);
  console.log(`  ${text.split(/\n+/)[0]}`);

  if (dryRun) {
    console.log(`  DRY RUN - would POST ${text.length} characters to ${provider}, writing ${g.out}`);
    console.log('');
    continue;
  }

  const res = await fetch(spec.url(voice), {
    method: 'POST',
    headers: spec.headers(key),
    body: spec.body(text, voice),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`make-greeting: ${provider} returned ${res.status}. ${detail.slice(0, 300)}`);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(outDir, g.out);
  fs.writeFileSync(outPath, buf);
  console.log(`  wrote ${outPath} (${buf.length} bytes)`);
  console.log('');
}

console.log('Done. Listen to both before class.');
console.log('');
console.log('These files are now the greeting. Not a prompt instruction -- a file. Changing');
console.log('what Clara says about being an AI is a code change from here on, which is the');
console.log('correct amount of friction.');
