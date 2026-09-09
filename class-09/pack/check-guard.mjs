#!/usr/bin/env node
// check-guard.mjs -- the offline guard checker.
//
// THIS FILE SPAWNS NOTHING. No child_process, no exec, no shell. It feeds strings to a
// guard and prints what the guard said about them. It is deliberately the only thing in
// this pack that is safe to run before class, and that is why it is the only thing the
// installer is allowed to run.
//
//   node check-guard.mjs
//       Checks the reference guard that ships in this pack.
//
//   node check-guard.mjs --guard ../brain/cockpit/guard.mjs
//       Checks the guard YOU wrote in build prompt 04. This is the real use. The
//       shipped guard exists so the refusals are provable before you have written
//       anything; yours is the one that will actually stand between an agent and
//       your .env.
//
// Exit code 0 only if every refusal was refused with the expected rule AND every
// allowed command was allowed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const guardPath = path.resolve(arg('--guard', path.join(HERE, 'guard.mjs')));
const root = path.resolve(arg('--root', HERE));

if (!fs.existsSync(guardPath)) {
  console.error(`check-guard: no guard at ${guardPath}`);
  process.exit(2);
}

const mod = await import(pathToFileURL(guardPath).href);
if (typeof mod.makeGuard !== 'function') {
  console.error(
    `check-guard: ${guardPath} does not export makeGuard({ root }).\n` +
    `Your guard needs that shape for this checker to reach it. Build prompt 04 says so.`
  );
  process.exit(2);
}

const guard = mod.makeGuard({ root });

function parseLines(file, kind) {
  const text = fs.readFileSync(path.join(HERE, file), 'utf8');
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const hash = line.lastIndexOf('#');
    if (hash === -1) {
      console.error(`check-guard: ${file} line has no expectation comment: ${line}`);
      process.exit(2);
    }
    const command = line.slice(0, hash).trimEnd();
    const note = line.slice(hash + 1).trim();
    if (kind === 'refuse') {
      const m = note.match(/^rule\s+(\d+)(?:\s+@(READ|WRITE))?$/);
      if (!m) {
        console.error(`check-guard: cannot read expectation "${note}" in ${file}`);
        process.exit(2);
      }
      out.push({ command, rule: Number(m[1]), mode: m[2] ?? 'WRITE' });
    } else {
      out.push({ command, mode: note === 'WRITE' ? 'WRITE' : 'READ' });
    }
  }
  return out;
}

const refusals = parseLines('refusals.txt', 'refuse');
const allowed = parseLines('allowed.txt', 'allow');

let failures = 0;
const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + '...' : s.padEnd(n));

console.log(`guard : ${guardPath}`);
console.log(`root  : ${root}`);
console.log('');
console.log('MUST REFUSE');
console.log('-'.repeat(96));

for (const t of refusals) {
  let res;
  try {
    res = guard.check(t.command, t.mode);
  } catch (err) {
    res = { verdict: 'THREW', rule: null, reason: err.message };
  }
  const ok = res.verdict === 'REFUSED' && res.rule === t.rule;
  if (!ok) failures++;
  const got = res.verdict === 'REFUSED' ? `rule ${res.rule}` : res.verdict;
  console.log(
    `${ok ? 'REFUSE' : '  FAIL'}  ${pad(t.command, 44)} ${pad(t.mode, 6)} ` +
    `want rule ${String(t.rule).padEnd(2)} got ${pad(got, 8)} ${ok ? '' : res.reason ?? ''}`
  );
}

console.log('');
console.log('MUST ALLOW');
console.log('-'.repeat(96));

for (const t of allowed) {
  let res;
  try {
    res = guard.check(t.command, t.mode);
  } catch (err) {
    res = { verdict: 'THREW', reason: err.message };
  }
  const ok = res.verdict === 'ALLOWED';
  if (!ok) failures++;
  console.log(
    `${ok ? ' ALLOW' : '  FAIL'}  ${pad(t.command, 44)} ${pad(t.mode, 6)} ` +
    `${ok ? '' : `${res.verdict} ${res.reason ?? ''}`}`
  );
}

console.log('');
console.log('-'.repeat(96));
console.log(
  `${refusals.length} refusals, ${allowed.length} allowed, ${failures} failure(s).`
);

if (failures > 0) {
  console.log('');
  console.log('A guard that allows something on the refusal list is worse than no guard,');
  console.log('because it produces a table that looks like a guarantee. Do not wire the');
  console.log('cockpit into anything until this is green.');
  process.exit(1);
}

console.log('All refusals refused with the expected rule. All allowed commands allowed.');
console.log('Nothing was executed to produce this table.');
