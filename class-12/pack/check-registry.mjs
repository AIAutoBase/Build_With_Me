#!/usr/bin/env node
// check-registry.mjs -- the offline registry checker for Class 12.
//
// THIS FILE LOADS NO MODULE CODE, MOUNTS NO ROUTE, AND TOUCHES NO DATABASE. It reads
// module.json files as plain JSON, hands them to validate() and sortModules(), and
// prints what came back. Nothing here has a server/, a migrations/ folder, or any code
// path that could import a module's own files. That is deliberate: a manifest is
// supposed to be judgeable without ever running the thing it describes, and this
// checker is the proof that the judging works before class touches a real database.
//
//   node check-registry.mjs
//       Checks the reference validate.mjs that ships in this pack.
//
//   node check-registry.mjs --validate ../brain/modules/validate.mjs
//       Checks the validate.mjs YOU wrote in build prompt 03. This is the real use.
//       The shipped one exists so refusals are provable before you have written
//       anything; yours is the one that will actually stand at the host's boot path.
//
// Exit code 0 only if every manifest validated the way it was expected to, the cycle
// pair was refused by sortModules naming both ids, and all four summary lines below
// say PASS.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOST_API = '1.0.0'; // the host version this checker pretends to be, for rule 4

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const validatePath = path.resolve(arg('--validate', path.join(HERE, 'validate.mjs')));

if (!fs.existsSync(validatePath)) {
  console.error(`check-registry: no validate.mjs at ${validatePath}`);
  process.exit(2);
}

const mod = await import(pathToFileURL(validatePath).href);
if (typeof mod.validate !== 'function' || typeof mod.sortModules !== 'function') {
  console.error(
    `check-registry: ${validatePath} does not export both validate(manifest, opts) and ` +
    `sortModules(manifests). Build prompt 03/04 say your module needs that exact shape ` +
    `for this checker (and the host) to reach it.`
  );
  process.exit(2);
}
const { validate, sortModules } = mod;

function loadJSON(rel) {
  const p = path.join(HERE, rel);
  return { file: rel, path: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

// The three shipped modules, plus every fixture. All of them run through the same
// validate() call -- there is no special-cased "fixture mode". A checker that treats
// broken manifests differently from real ones is not actually testing the refusal
// path, only a path that looks like it.
const REAL = [
  loadJSON('manifests/contacts.json'),
  loadJSON('manifests/tasks.json'),
  loadJSON('manifests/invoices.json'),
];

const FIXTURES = [
  { file: 'fixtures/bad-table-prefix.json', expectOk: false, expectRule: 2 },
  { file: 'fixtures/bad-route-escape.json', expectOk: false, expectRule: 3 },
  { file: 'fixtures/bad-host-api.json', expectOk: false, expectRule: 4 },
  // These two are individually VALID manifests. The cycle they form is only
  // detectable by walking dependsOn edges across both of them at once, which is
  // exactly what sortModules does further down -- validate() has no way to see it
  // because validate() looks at one manifest in isolation.
  { file: 'fixtures/bad-cycle-a.json', expectOk: true, expectRule: null },
  { file: 'fixtures/bad-cycle-b.json', expectOk: true, expectRule: null },
  { file: 'fixtures/bad-unknown-permission.json', expectOk: false, expectRule: 6 },
  { file: 'fixtures/bad-missing-dep.json', expectOk: false, expectRule: 5 },
].map((f) => ({ ...f, ...loadJSON(f.file) }));

// installedIds pretends every module below is already on the host, EXCEPT
// "billing-core" -- the id bad-missing-dep.json depends on. That omission is the
// entire point of that fixture: rule 5 fires only when a dependency genuinely is not
// installed, not just when it is unfamiliar.
const INSTALLED_IDS = ['contacts', 'tasks', 'invoices', 'cycle-a', 'cycle-b'];

let failures = 0;
const pad = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '...' : String(s).padEnd(n));

console.log(`validate.mjs : ${validatePath}`);
console.log(`hostApi      : ${HOST_API}`);
console.log('');
console.log('MANIFEST VALIDATION');
console.log('-'.repeat(100));
console.log(
  `${pad('manifest', 26)} ${pad('expected', 14)} ${pad('actual', 14)} ${pad('rule', 6)} result`
);

const results = new Map();

for (const m of [...REAL.map((r) => ({ ...r, expectOk: true, expectRule: null })), ...FIXTURES]) {
  let res;
  try {
    res = validate(m.data, { hostApi: HOST_API, installedIds: INSTALLED_IDS });
  } catch (err) {
    res = { ok: false, errors: [{ rule: null, message: `THREW: ${err.message}` }] };
  }
  results.set(m.file, res);

  const expected = m.expectOk ? 'valid' : `refused (rule ${m.expectRule})`;
  const actualRules = res.errors.map((e) => e.rule).filter((r) => r != null);
  const actual = res.ok ? 'valid' : `refused (rule ${actualRules.join(',')})`;

  const okMatches = res.ok === m.expectOk;
  const ruleMatches = m.expectOk || actualRules.includes(m.expectRule);
  const pass = okMatches && ruleMatches;
  if (!pass) failures++;

  console.log(
    `${pad(m.file, 26)} ${pad(expected, 14)} ${pad(actual, 14)} ${pad(m.expectRule ?? '-', 6)} ` +
    `${pass ? 'PASS' : 'FAIL  ' + res.errors.map((e) => e.message).join(' | ')}`
  );
}

console.log('');
console.log('CYCLE DETECTION (sortModules)');
console.log('-'.repeat(100));

const cycleA = FIXTURES.find((f) => f.file === 'fixtures/bad-cycle-a.json').data;
const cycleB = FIXTURES.find((f) => f.file === 'fixtures/bad-cycle-b.json').data;

let cycleThrew = false;
let cycleMessage = '';
try {
  sortModules([cycleA, cycleB]);
} catch (err) {
  cycleThrew = true;
  cycleMessage = err.message;
}

const namesBoth = cycleMessage.includes('cycle-a') && cycleMessage.includes('cycle-b');
const cyclePass = cycleThrew && namesBoth;
if (!cyclePass) failures++;

console.log(`sortModules([cycle-a, cycle-b])`);
console.log(`  expected : throw, naming both "cycle-a" and "cycle-b"`);
console.log(`  actual   : ${cycleThrew ? `threw: ${cycleMessage}` : 'did NOT throw'}`);
console.log(`  result   : ${cyclePass ? 'PASS' : 'FAIL'}`);

// Also prove sortModules still WORKS (no throw, correct order) on the three shipped
// modules, since a checker that only ever exercises the failure path has not actually
// shown the happy path is intact.
console.log('');
console.log('CYCLE-FREE SORT (shipped modules)');
console.log('-'.repeat(100));
let orderOk = true;
let orderMessage = '';
try {
  const order = sortModules(REAL.map((r) => r.data)).map((m) => m.id);
  orderMessage = order.join(' -> ');
  const contactsIdx = order.indexOf('contacts');
  const tasksIdx = order.indexOf('tasks');
  const invoicesIdx = order.indexOf('invoices');
  orderOk = contactsIdx < tasksIdx && contactsIdx < invoicesIdx;
} catch (err) {
  orderOk = false;
  orderMessage = `threw: ${err.message}`;
}
if (!orderOk) failures++;
console.log(`sortModules([contacts, tasks, invoices])`);
console.log(`  order  : ${orderMessage}`);
console.log(`  expect : contacts before tasks and before invoices, no throw`);
console.log(`  result : ${orderOk ? 'PASS' : 'FAIL'}`);

// The four lines the install prompt (Step 7) promises verbatim. These are not a
// re-statement of the table above -- they are the specific claims a member is told to
// look for, so each one is computed from a named check rather than "were there zero
// failures overall", which would let an unrelated broken fixture mask one of these
// four passing or failing on its own.
const contactsRes = results.get('manifests/contacts.json');
const tasksRes = results.get('manifests/tasks.json');
const invoicesRes = results.get('manifests/invoices.json');
const allShippedValid = Boolean(contactsRes?.ok && tasksRes?.ok && invoicesRes?.ok);

const tablePrefixRes = results.get('fixtures/bad-table-prefix.json');
const tablePrefixRefused =
  Boolean(tablePrefixRes && !tablePrefixRes.ok && tablePrefixRes.errors.some((e) => e.rule === 2));

const hostApiRes = results.get('fixtures/bad-host-api.json');
const hostApiRefused =
  Boolean(hostApiRes && !hostApiRes.ok && hostApiRes.errors.some((e) => e.rule === 4));

const summary = [
  ['all three shipped manifests validate', allShippedValid],
  ['a manifest declaring a table without its own prefix is REFUSED', tablePrefixRefused],
  ['a manifest declaring a dependency cycle is REFUSED, naming both modules', cyclePass],
  ['a manifest declaring a host API version we do not implement is REFUSED', hostApiRefused],
];

console.log('');
console.log('SUMMARY');
console.log('-'.repeat(100));
for (const [label, ok] of summary) {
  if (!ok) failures++;
  console.log(`${label}: ${ok ? 'PASS' : 'FAIL'}`);
}

console.log('');
console.log('-'.repeat(100));
console.log(`${failures} failure(s).`);

if (failures > 0) {
  console.log('');
  console.log('A validator that accepts a bad manifest is worse than no validator, because');
  console.log('it produces a document that looks like a guarantee. Do not wire this host into');
  console.log('a real database until this is green.');
  process.exit(1);
}

console.log('');
console.log('All manifests validated as expected. The cycle pair was refused, naming both');
console.log('modules. Nothing was loaded, mounted, or written to a database to produce this');
console.log('table.');
