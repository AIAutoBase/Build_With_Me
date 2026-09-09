#!/usr/bin/env node
// check-call-scope.mjs -- the offline scope checker.
//
// THIS FILE PLACES NO CALL, SENDS NO TEXT AND MAKES NO NETWORK REQUEST. It reads source
// text and it runs one handler turn against fake dependencies. It costs nothing and it
// wakes nobody up, which is why it is the only thing in this pack the installer runs.
//
//   node check-call-scope.mjs
//       Checks the reference handler that ships in this pack.
//
//   node check-call-scope.mjs --handler ../brain/phone/handler.mjs
//       Checks the handler YOU wrote. This is the real use.
//
// Four assertions, all four from the install prompt, plus the filter's own test set.
// Exit code 0 only if everything passes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const handlerPath = path.resolve(arg('--handler', path.join(HERE, 'call-scope.mjs')));
const filterPath = path.resolve(arg('--filter', path.join(HERE, 'no-commitments.mjs')));

for (const p of [handlerPath, filterPath]) {
  if (!fs.existsSync(p)) {
    console.error(`check-call-scope: no file at ${p}`);
    process.exit(2);
  }
}

const source = fs.readFileSync(handlerPath, 'utf8');
// Strip comments -- BLOCK comments first, then line comments -- so that prose about
// searchFiles cannot satisfy, or fail, an assertion about searchFiles. A checker that a
// comment can pass is a checker that a comment will pass; a checker that a JSDoc line can
// FAIL is worse, because it fails on correct code and teaches you to stop believing it.
//
// Newlines are preserved so that the character offsets used for the ordering check in
// assertion 4 still point somewhere meaningful.
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split(/\r?\n/)
  .map((l) => l.replace(/\/\/.*$/, ''))
  .join('\n');

const results = [];
function assert(name, ok, detail) {
  results.push({ name, ok, detail });
}

// -------------------------------------------------------------------------------------
// 1. The zone list is a hardcoded constant, not read from env or config.
// -------------------------------------------------------------------------------------
const declMatch = code.match(/const\s+PHONE_ZONES\s*=\s*([^;]+);/);
if (!declMatch) {
  assert('zone list is a hardcoded constant', false, 'no `const PHONE_ZONES = ...` found');
} else {
  const rhs = declMatch[1];
  const dynamic = /process\.env|process\.argv|readFile|JSON\.parse|require\(|import\(|config\b|db\.|query\(/i.exec(rhs);
  assert(
    'zone list is a hardcoded constant',
    !dynamic,
    dynamic ? `right-hand side reaches for ${dynamic[0]}` : `${rhs.trim()}`
  );
}

// -------------------------------------------------------------------------------------
// 2. That list is exactly general and business.
// -------------------------------------------------------------------------------------
const mod = await import(pathToFileURL(handlerPath).href);
const zones = mod.PHONE_ZONES;
const zonesOk =
  Array.isArray(zones) &&
  zones.length === 2 &&
  zones.includes('general') &&
  zones.includes('business');
assert(
  'zone list is exactly [general, business]',
  zonesOk,
  Array.isArray(zones) ? `[${zones.join(', ')}]` : 'PHONE_ZONES is not exported as an array'
);

// A frozen list is not required, but an unfrozen one can be mutated at runtime by
// anything holding a reference, and then the constant is a suggestion.
if (zonesOk && !Object.isFrozen(zones)) {
  console.log('note: PHONE_ZONES is not frozen. Anything holding a reference can push to it.');
}

// -------------------------------------------------------------------------------------
// 3. The handler never calls searchFiles without passing zones.
//    Checked twice: in the source, and by actually calling it with a spy.
// -------------------------------------------------------------------------------------
const callSites = [...code.matchAll(/searchFiles\s*\(/g)];
let staticOk = callSites.length > 0;
for (const m of callSites) {
  // Read forward to the matching close paren, shallowly.
  let depth = 0;
  let i = m.index + m[0].length - 1;
  let body = '';
  for (; i < code.length; i++) {
    const ch = code[i];
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (depth === 0) break; }
    if (depth >= 1) body += ch;
  }
  if (!/\bzones\s*:/.test(body)) staticOk = false;
}
assert(
  'every searchFiles call site passes zones',
  staticOk,
  callSites.length === 0 ? 'no searchFiles call found in the handler' : `${callSites.length} call site(s)`
);

let spyOk = false;
let spyDetail = 'handleTurn was not reachable';
if (typeof mod.handleTurn === 'function') {
  const seen = [];
  const spy = async (a) => { seen.push(a); return []; };
  try {
    await mod.handleTurn(
      { callerText: 'what are your hours?', channel: 'sms' },
      {
        searchFiles: spy,
        searchMemory: spy,
        askModel: async () => 'We are open nine to five.',
      }
    );
    spyOk = seen.length > 0 && seen.every((a) => Array.isArray(a?.zones) && a.zones.length > 0);
    spyDetail = seen.length
      ? seen.map((a) => `zones=[${(a.zones ?? []).join(',')}]`).join(' ')
      : 'no search was called';
  } catch (err) {
    spyDetail = `handleTurn threw: ${err.message}`;
  }
}
assert('a live turn passes zones to every search', spyOk, spyDetail);

// -------------------------------------------------------------------------------------
// 4. The commitment filter runs on the outbound path, AFTER the model, not before.
// -------------------------------------------------------------------------------------
const modelAt = code.search(/\baskModel\s*\(/);
const filterAt = code.search(/\bfilterOutbound\s*\(/);
assert(
  'the commitment filter runs after the model',
  modelAt !== -1 && filterAt !== -1 && filterAt > modelAt,
  modelAt === -1
    ? 'no askModel call found'
    : filterAt === -1
      ? 'no filterOutbound call found'
      : `askModel at ${modelAt}, filterOutbound at ${filterAt}`
);

// -------------------------------------------------------------------------------------
// The filter's own test set.
// -------------------------------------------------------------------------------------
const { filterOutbound } = await import(pathToFileURL(filterPath).href);
const tests = JSON.parse(fs.readFileSync(path.join(HERE, 'commitment-tests.json'), 'utf8'));

const missed = tests.mustCatch.filter((t) => !filterOutbound(t).filtered);
const overcaught = tests.mustPass.filter((t) => filterOutbound(t).filtered);

assert(
  `filter catches all ${tests.mustCatch.length} commitments`,
  missed.length === 0,
  missed.length ? `missed: ${missed.map((m) => JSON.stringify(m)).join(' ')}` : 'all caught'
);
assert(
  `filter lets all ${tests.mustPass.length} ordinary answers through`,
  overcaught.length === 0,
  overcaught.length ? `wrongly caught: ${overcaught.map((m) => JSON.stringify(m)).join(' ')}` : 'all passed'
);

// -------------------------------------------------------------------------------------
console.log(`handler : ${handlerPath}`);
console.log(`filter  : ${filterPath}`);
console.log('');
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(48)} ${r.detail ?? ''}`);
}
console.log('');

const failed = results.filter((r) => !r.ok);
console.log(`${results.length} checks, ${failed.length} failure(s).`);

if (failed.length) {
  console.log('');
  console.log('A failure here means a stranger on the phone can reach documents you did not');
  console.log('mean to share, or that Clara can promise something on your behalf. Do not');
  console.log('point a phone number at this until it is green.');
  process.exit(1);
}

console.log('No call was placed and no message was sent to produce this table.');
