#!/usr/bin/env node
// check-zones.mjs -- the offline zone checker.
//
// THIS FILE SPAWNS NOTHING. No child_process, no exec, no shell, no database driver,
// no network call, no file upload. It imports a zones module, feeds it the fixtures in
// zone-tests.json, and prints what it said. It is deliberately the only thing in this
// pack that is safe to run before class, and that is why it is the only thing the
// installer is allowed to run.
//
//   node check-zones.mjs
//       Checks the reference zones.mjs that ships in this pack.
//
//   node check-zones.mjs --zones ../brain/search/zones.mjs
//       Checks the zones.mjs YOU wrote in class. The shipped one exists so the
//       refusals are provable before you have written anything; yours is the one
//       that will actually stand between a query and the personal zone.
//
// Exit code 0 only if every valid file resolves to exactly one zone, every invalid
// zone input throws, and a query scoped to [general, business] proves it in the SQL
// and the params.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const zonesPath = path.resolve(arg('--zones', path.join(HERE, 'zones.mjs')));

if (!fs.existsSync(zonesPath)) {
  console.error(`check-zones: no module at ${zonesPath}`);
  process.exit(2);
}

const mod = await import(pathToFileURL(zonesPath).href);

for (const name of ['ZONES', 'resolveZone', 'scopeQuery']) {
  if (!(name in mod)) {
    console.error(
      `check-zones: ${zonesPath} does not export ${name}.\n` +
      'Your zones.mjs needs to export ZONES, resolveZone(input) and ' +
      'scopeQuery({ query, zones, limit }) for this checker to reach it.'
    );
    process.exit(2);
  }
}

const { resolveZone, scopeQuery } = mod;

const fixturesRaw = fs.readFileSync(path.join(HERE, 'zone-tests.json'), 'utf8');
const fixtures = JSON.parse(fixturesRaw);

let failures = 0;
const pad = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '...' : String(s).padEnd(n));

console.log(`zones : ${zonesPath}`);
console.log('');

// --- Part 1: every test file resolves to exactly one zone ------------------------

console.log('VALID FILES -- each must resolve to exactly the zone it was given');
console.log('-'.repeat(96));

let validOk = true;
for (const t of fixtures.validFiles) {
  let got;
  let threw = false;
  try {
    got = resolveZone(t.zone);
  } catch (err) {
    threw = true;
    got = err.message;
  }
  const ok = !threw && got === t.zone;
  if (!ok) { validOk = false; failures++; }
  console.log(
    `${ok ? '  OK' : 'FAIL'}  ${pad(t.name, 32)} want ${pad(t.zone, 10)} got ${pad(got, 10)}`
  );
}

// --- Part 2: every invalid zone input throws --------------------------------------

console.log('');
console.log('INVALID ZONE INPUTS -- each must throw, none may resolve to anything');
console.log('-'.repeat(96));

let invalidOk = true;
for (const t of fixtures.invalidZones) {
  const hasValue = Object.prototype.hasOwnProperty.call(t, 'value');
  const input = hasValue ? t.value : undefined;
  let threw = false;
  let got = '(no throw)';
  try {
    got = resolveZone(input);
  } catch (err) {
    threw = true;
  }
  const ok = threw;
  if (!ok) { invalidOk = false; failures++; }
  console.log(
    `${ok ? 'REFUSE' : '  FAIL'}  ${pad(t.label, 40)} ${ok ? 'threw as expected' : `did not throw, returned ${JSON.stringify(got)}`}`
  );
}

// --- Part 3: a query scoped to [general, business] proves it in SQL and params ---

console.log('');
console.log('ZONE-SCOPED QUERY -- scopeQuery({ zones: [general, business] })');
console.log('-'.repeat(96));

const scopeOk = { sql: false, params: false, noPersonal: false, noClients: false, threw: false };
let sql = '';
let params = [];

try {
  ({ sql, params } = scopeQuery({ query: 'test embedding', zones: ['general', 'business'], limit: 5 }));
} catch (err) {
  scopeOk.threw = true;
  console.log(`  FAIL  scopeQuery threw unexpectedly: ${err.message}`);
}

if (!scopeOk.threw) {
  scopeOk.sql = /zone\s*=\s*ANY\(/i.test(sql);
  console.log(`${scopeOk.sql ? '  OK' : 'FAIL'}  SQL WHERE clause contains a zone filter`);
  console.log(`        sql: ${sql}`);

  const zoneListParam = params.find((p) => Array.isArray(p));
  const gotZones = zoneListParam ?? [];
  scopeOk.params =
    Array.isArray(zoneListParam) &&
    gotZones.length === 2 &&
    gotZones.includes('general') &&
    gotZones.includes('business');
  console.log(`${scopeOk.params ? '  OK' : 'FAIL'}  params carry exactly [general, business]`);
  console.log(`        params: ${JSON.stringify(params)}`);

  scopeOk.noPersonal = !gotZones.includes('personal');
  scopeOk.noClients = !gotZones.includes('clients');
  console.log(`${scopeOk.noPersonal ? '  OK' : 'FAIL'}  params do not carry personal`);
  console.log(`${scopeOk.noClients ? '  OK' : 'FAIL'}  params do not carry clients`);
}

const scopeAllOk =
  !scopeOk.threw && scopeOk.sql && scopeOk.params && scopeOk.noPersonal && scopeOk.noClients;
if (!scopeAllOk) failures++;

// Also prove there is no way to call scopeQuery with no zones and get results back.
console.log('');
console.log('NO WILDCARD -- scopeQuery must refuse every attempt to mean "all zones"');
console.log('-'.repeat(96));

const noWildcardCases = [
  { label: 'zones omitted', args: { query: 'x' } },
  { label: 'zones: []', args: { query: 'x', zones: [] } },
  { label: 'zones: undefined', args: { query: 'x', zones: undefined } },
];

let noWildcardOk = true;
for (const c of noWildcardCases) {
  let threw = false;
  try {
    scopeQuery(c.args);
  } catch (err) {
    threw = true;
  }
  if (!threw) { noWildcardOk = false; failures++; }
  console.log(`${threw ? 'REFUSE' : '  FAIL'}  ${pad(c.label, 20)} ${threw ? 'threw as expected' : 'did NOT throw -- this is a wildcard'}`);
}

// --- Summary -----------------------------------------------------------------------

console.log('');
console.log('-'.repeat(96));

const line1Pass = validOk;
const line2Pass = scopeAllOk && invalidOk && noWildcardOk;

console.log(`every test file resolves to exactly one zone: ${line1Pass ? 'PASS' : 'FAIL'}`);
console.log(`a query scoped to [general, business] returns nothing from personal or clients: ${line2Pass ? 'PASS' : 'FAIL'}`);

if (failures > 0) {
  console.log('');
  console.log('A zone resolver that lets one invalid input through, or a query builder that');
  console.log('can be made to skip the WHERE clause, is worse than no zone system at all --');
  console.log('it produces a table that looks like a guarantee. Do not wire this into search');
  console.log('until this is green.');
  process.exit(1);
}

console.log('');
console.log('All valid files resolved to exactly one zone. All invalid inputs threw.');
console.log('The scoped query carries the zone filter in SQL, not in JS after the fetch.');
console.log('Nothing was executed to produce this table.');
