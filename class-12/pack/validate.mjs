// validate.mjs -- the reference manifest validator for "The Brain That Runs a Company",
// Class 12.
//
// THIS FILE LOADS NO MODULE CODE. It reads a plain JS object (a parsed module.json) and
// says yes or no. It never requires, imports or executes anything a module ships. That
// is the whole point of a manifest: you can evaluate what a module is asking for
// without ever running its code.
//
// Hand-rolled on purpose -- no JSON-schema library. A schema library is one more
// dependency between a bad manifest and a refusal, and this file is small enough that
// a member can read every rule it enforces in one sitting.
//
// It ships in this pack so that check-registry.mjs can prove refusals on your machine
// BEFORE class, while nothing on your box can yet load a module. In class you write
// your own (build prompt 03) and point the checker at it:
//
//     node check-registry.mjs --validate /path/to/your/modules/validate.mjs
//
// Six rules for validate(). Each error names the rule that fired, because a refusal
// you cannot look up is a locked door rather than a teacher.

export const ZONES = ['personal', 'business', 'clients', 'general'];

// Fixed enum. A permission string outside this list is INVALID, never ignored -- see
// rule 6 below for why "ignore what you don't recognise" is the wrong default here.
export const PERMISSIONS = ['db.read', 'db.write', 'files.read', 'search.read', 'ui.tab'];

const RULES = {
  1: 'shape -- required fields present and correctly typed',
  2: 'table declared outside this module\'s own prefix (m_<id>_)',
  3: 'route mounted outside this module\'s own path (/api/m/<id>/)',
  4: 'hostApi major version does not match the host\'s',
  5: 'dependsOn names a module id that is not installed',
  6: 'permission string is not in the fixed enum',
};

const REQUIRED_FIELDS = {
  id: 'string',
  title: 'string',
  version: 'string',
  hostApi: 'string',
  tables: 'array',
  routes: 'array',
  zones: 'array',
  dependsOn: 'array',
  permissions: 'array',
};

const ID_RE = /^[a-z0-9-]+$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

function issue(rule, message) {
  return { rule, message: `rule ${rule} (${RULES[rule]}): ${message}` };
}

function majorOf(semver) {
  return semver.split('.')[0];
}

/**
 * validate(manifest, { hostApi, installedIds })
 *
 * manifest      a parsed module.json (plain object)
 * hostApi       semver string of the host's own API version -- REQUIRED, no default.
 *               A validator that assumes a host version can pass a manifest against
 *               the wrong host, which is the exact failure rule 4 exists to catch.
 * installedIds  array of module ids already known to the host, for rule 5. Defaults to
 *               empty -- an empty default is correct here (a fresh host has installed
 *               nothing), unlike hostApi where there is no safe default.
 *
 * Returns { ok, errors }. errors is [] when ok is true.
 */
export function validate(manifest, { hostApi, installedIds = [] } = {}) {
  if (!hostApi) {
    throw new Error(
      'validate: hostApi is required in options. There is no default host version, on ' +
      'purpose -- silently defaulting it would let a manifest pass rule 4 against a ' +
      'version nobody actually runs.'
    );
  }

  // Rule 1 -- shape. Everything below this line assumes these fields exist and are the
  // right JS type. Without this gate first, a manifest missing "tables" would throw a
  // TypeError out of rule 2 instead of producing a named, readable refusal -- and a
  // crash is not something a member reading a table of results can act on.
  const errors = [];

  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { ok: false, errors: [issue(1, 'manifest is not a JSON object')] };
  }

  for (const key of Object.keys(manifest)) {
    if (!(key in REQUIRED_FIELDS)) {
      // additionalProperties: false, by hand. An unrecognised top-level field is the
      // same shape of risk as an unrecognised permission (rule 6): something written
      // for a manifest shape this host does not know yet, and silently accepting it
      // looks safer than it is.
      errors.push(issue(1, `unknown field "${key}" -- manifest schema is closed`));
    }
  }

  for (const [field, kind] of Object.entries(REQUIRED_FIELDS)) {
    const value = manifest[field];
    if (value === undefined) {
      errors.push(issue(1, `missing required field "${field}"`));
    } else if (kind === 'array' && !Array.isArray(value)) {
      errors.push(issue(1, `field "${field}" must be an array, got ${typeof value}`));
    } else if (kind === 'string' && typeof value !== 'string') {
      errors.push(issue(1, `field "${field}" must be a string, got ${typeof value}`));
    }
  }

  // Everything past this point reads manifest.id, manifest.tables[], etc. as the right
  // type. If the loop above found a missing or mistyped field, stop here -- rules 2
  // through 6 would otherwise crash or produce misleading errors about a field that
  // was already reported broken.
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!ID_RE.test(manifest.id)) {
    errors.push(issue(1, `id "${manifest.id}" must match ^[a-z0-9-]+$`));
  }
  if (!SEMVER_RE.test(manifest.version)) {
    errors.push(issue(1, `version "${manifest.version}" is not semver (x.y.z)`));
  }
  if (!SEMVER_RE.test(manifest.hostApi)) {
    errors.push(issue(1, `hostApi "${manifest.hostApi}" is not semver (x.y.z)`));
  }
  for (const z of manifest.zones) {
    if (!ZONES.includes(z)) {
      errors.push(issue(1, `zone "${z}" is not one of: ${ZONES.join(', ')}`));
    }
  }

  // Rules 2 through 6 all depend on manifest.id (for the prefix checks) and on the
  // semver fields being real semver. If those failed above, stop here too -- a bad id
  // makes "does this table start with m_<id>_" a meaningless question.
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // Rule 2 -- table isolation. This is the one check that stands in for the database
  // role: if a manifest can declare a table outside its own prefix, the manifest layer
  // has already lost the isolation that Postgres is supposed to enforce underneath it.
  const tablePrefix = `m_${manifest.id}_`;
  for (const t of manifest.tables) {
    if (typeof t !== 'string' || !t.startsWith(tablePrefix)) {
      errors.push(issue(2, `table "${t}" does not start with "${tablePrefix}"`));
    }
  }

  // Rule 3 -- route isolation. Same failure as rule 2, at the HTTP layer instead of
  // the database layer: a route outside /api/m/<id>/ can shadow another module's
  // endpoint, or a host endpoint, and the collision is invisible until both are
  // installed together.
  const routePrefix = `/api/m/${manifest.id}/`;
  for (const r of manifest.routes) {
    if (typeof r !== 'string' || !r.startsWith(routePrefix)) {
      errors.push(issue(3, `route "${r}" does not start with "${routePrefix}"`));
    }
  }

  // Rule 4 -- host API compatibility. Only the MAJOR version is compared. A minor or
  // patch mismatch is assumed backward compatible; a major mismatch means the module
  // was built against a contract that no longer holds, and the alternative to refusing
  // here is a white screen with a stack trace from inside someone else's code.
  const wantMajor = majorOf(manifest.hostApi);
  const haveMajor = majorOf(hostApi);
  if (wantMajor !== haveMajor) {
    errors.push(
      issue(
        4,
        `manifest wants hostApi major ${wantMajor} (hostApi ${manifest.hostApi}), ` +
        `host is major ${haveMajor} (host hostApi ${hostApi})`
      )
    );
  }

  // Rule 5 -- dependency existence. A migration/load order can only be computed over
  // modules that actually exist. A dependency on an id nobody installed is not a
  // topology problem (sortModules can still run); it is a promise the module makes
  // that the host cannot keep, so it is refused here rather than discovered later as a
  // runtime lookup failure inside a module's own code.
  for (const dep of manifest.dependsOn) {
    if (!installedIds.includes(dep)) {
      errors.push(issue(5, `dependsOn "${dep}" is not in installedIds`));
    }
  }

  // Rule 6 -- permission enum. An unknown permission is INVALID, never ignored. A host
  // that silently ignores a permission string it does not recognise will accept a
  // module built for a newer host and run it with FEWER restrictions than its author
  // intended -- "ignore what you don't understand" is the wrong default exactly when
  // the string is a request for access.
  for (const p of manifest.permissions) {
    if (!PERMISSIONS.includes(p)) {
      errors.push(issue(6, `permission "${p}" is not in the fixed enum: ${PERMISSIONS.join(', ')}`));
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * sortModules(manifests)
 *
 * Topologically sorts manifests by dependsOn so migrations and mounts run in an order
 * that respects declared dependencies. THROWS if the graph has a cycle, naming every
 * module id in the cycle.
 *
 * It does NOT fall back to alphabetical order on a cycle, and it does not use
 * alphabetical order anywhere as a tiebreak. Alphabetical order is a coincidence that
 * holds right up until somebody names a module "analytics" -- at which point the
 * "sort" silently reorders migrations on whatever machine loads that module next, and
 * because that machine is very often a FRESH install (the box where nothing has been
 * migrated yet, so there is no history to contradict the new order), the bug shows up
 * nowhere in your testing and everywhere in a member's first run.
 */
export function sortModules(manifests) {
  const byId = new Map(manifests.map((m) => [m.id, m]));
  const state = new Map(); // id -> 'visiting' | 'done'
  const stack = [];
  const order = [];

  function visit(id) {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      const start = stack.indexOf(id);
      const cycle = stack.slice(start).concat(id);
      throw new Error(
        `sortModules: dependency cycle detected: ${cycle.join(' -> ')}. ` +
        `Every module in this cycle is named above. This is a hard failure at boot, ` +
        `not a warning -- there is no correct order to run these migrations in, and ` +
        `guessing one is how a host ends up in a different state after every restart.`
      );
    }
    const manifest = byId.get(id);
    // A dependency that is not in this batch is not this function's problem -- rule 5
    // of validate() is what refuses a manifest naming a module that is not installed.
    // sortModules only orders the modules it was actually given.
    if (!manifest) return;

    state.set(id, 'visiting');
    stack.push(id);
    for (const dep of manifest.dependsOn ?? []) {
      visit(dep);
    }
    stack.pop();
    state.set(id, 'done');
    order.push(manifest);
  }

  // Iterating `manifests` in input order only decides where the DFS STARTS. The
  // resulting `order` array is a dependency-respecting postorder, not the input order
  // and not an alphabetical order -- do not "simplify" this to
  // manifests.slice().sort((a, b) => a.id.localeCompare(b.id)). That reads as
  // equivalent in every test where names happen to sort the same way dependencies
  // point, and it is wrong the day a module's name and its dependency order disagree.
  for (const m of manifests) {
    visit(m.id);
  }

  return order;
}

export { RULES };
