// zones.mjs -- the reference zone resolver and query scoper for "The Brain That Runs a
// Company", Class 10.
//
// THIS FILE TOUCHES NOTHING. No database driver import, no network call, no filesystem
// write. Its only job is to answer two questions: is this a valid zone, and does a
// zone-scoped query actually restrict the SQL that gets sent.
//
// It ships in the pack so that `check-zones.mjs` can prove those two things on your
// machine BEFORE class, while nothing on your box can yet reach Postgres for this
// class. In class you write your own (build prompt covering the zone column and the
// search endpoint) and point the checker at it:
//
//     node check-zones.mjs --zones /path/to/your/brain/search/zones.mjs
//
// DECISIONS.md is explicit about why this exists: "the thing standing between [an
// unauthenticated caller] and the personal zone is that the query builder has no way
// to express 'all zones' without naming them." Everything below exists to keep that
// true.

// Frozen so a later `ZONES.push('scratch')` fails loudly instead of quietly widening
// what every already-shipped query can reach.
export const ZONES = Object.freeze(['personal', 'business', 'clients', 'general']);

/**
 * resolveZone(input) -> one of ZONES, or throws.
 *
 * No defaults. A default zone means a caller who forgets to pass one gets routed
 * somewhere instead of refused, and "somewhere" is exactly the ambiguity the zone
 * column was built to remove -- DECISIONS.md calls this out directly: a file has to
 * have exactly one answer to "which zone is this," and a resolver that guesses when
 * it is not told breaks that guarantee before the row is even written.
 *
 * No coercion, no case-insensitive match. "Personal" is not "personal". A resolver
 * that lowercases its input silently accepts a typo as if it were a deliberate
 * choice, and the one place this matters most -- a phone call or a form field typed
 * by someone in a hurry -- is the place least likely to get caught in review.
 */
export function resolveZone(input) {
  if (typeof input === 'string' && ZONES.includes(input)) {
    return input;
  }
  throw new Error(
    `resolveZone: ${JSON.stringify(input)} is not one of ${ZONES.join(', ')}. ` +
    'There is no default zone and no case-insensitive match -- name one of the four exactly.'
  );
}

/**
 * scopeQuery({ query, zones, limit }) -> { sql, params }
 *
 * Builds a parameterised query against file_chunks(file_id, zone, chunk, embedding).
 * `zones` is REQUIRED and must be a non-empty array of valid zones. There is no
 * wildcard value, no default, and an empty array does not mean "all zones" -- it is
 * refused, same as everything else that is not an explicit, named list.
 *
 * Why this matters more than it looks like it should: DECISIONS.md ties this file
 * directly to Class 11, where Clara answers a phone call from an unauthenticated
 * stranger. The only thing stopping that call from reading the `personal` zone is
 * that nothing in this function can produce a query without a zone list in it. If
 * "all zones" were expressible -- a missing argument, an empty array, a string
 * "all" -- it would eventually get passed by a caller who meant "the zones this
 * caller is allowed to see" and got "every zone that exists" instead.
 *
 * The zone filter is placed in the SQL WHERE clause via `zone = ANY($n)`, never
 * applied in JS after the rows come back. Filtering after the fetch means the
 * excluded rows already left Postgres -- they crossed the network, they can be
 * logged, cached, or read by a bug in the filter step before that step runs. A
 * WHERE clause means the database itself never returns a row from a zone that
 * was not asked for.
 */
export function scopeQuery({ query, zones, limit = 20 } = {}) {
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new Error(
      'scopeQuery: zones must be a non-empty array. There is no wildcard for "all ' +
      'zones" -- name every zone this query is allowed to see.'
    );
  }

  // Validate every entry through resolveZone rather than re-checking membership here.
  // One place decides what a valid zone is; this function is not allowed to grow a
  // second, slightly different opinion about it.
  const scopedZones = zones.map((z) => resolveZone(z));

  if (query === undefined) {
    throw new Error('scopeQuery: query is required.');
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(`scopeQuery: limit must be a positive integer, got ${JSON.stringify(limit)}.`);
  }

  const sql =
    'SELECT file_id, zone, chunk ' +
    'FROM file_chunks ' +
    'WHERE zone = ANY($1::text[]) ' +
    'ORDER BY embedding <-> $2 ' +
    'LIMIT $3';

  const params = [scopedZones, query, limit];

  return { sql, params };
}
