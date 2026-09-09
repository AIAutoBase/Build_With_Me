# Class 12 — build prompts

**The Brain That Runs a Company, Part 12: the socket.**

Sixteen prompts. Paste them into Claude Code one at a time, in order, from inside your brain
folder.

---

## Before you paste anything

1. **Clean git tree. Commit after each prompt that works.** This class changes how your
   dashboard boots. You want a commit to walk back to.
2. **Read every migration before you run it.** Three of these prompts produce SQL that
   touches the database holding twelve weeks of work.
3. **Resist the fourth module until prompt 15.** You will want to build one around prompt 09.
   The template is not finished until 14.

### The order is the isolation argument

The registry, the manifest validator and the per-module database role are prompts 02 through
07 — all of them before a single module exists.

Build a module first and the socket gets shaped around that module. It will fit perfectly,
and it will fit nothing else, and you will not find that out until the third one. Building
the host against a manifest you cannot yet run is uncomfortable and it is why the shape comes
out general.

---

## Prompt 01 — What are my tabs actually made of?

```text
Do not change anything. Report on my dashboard as it stands:

  1. Every tab: its name, the file its component lives in, and its line count.
  2. For each tab, which database tables it reads or writes. Find this by reading the
     server routes it calls, not by guessing from names.
  3. Any table read by more than one tab. List those separately - they are the ones that
     would break if I moved a tab into a module.
  4. How tabs are registered right now - a hardcoded array, a router config, or something
     else. Quote it.
  5. How the server mounts routes, and where I would add a dynamic mount point.

Then tell me, in five lines, what "make this a module host" means for THIS codebase
specifically, and which existing tab would be hardest to convert. I want the hard one
named before we start, not discovered at minute 40.
```

**You know it worked when:** you know which of your existing tabs is the tangled one.

---

## Prompt 02 — The manifest schema

```text
Write modules/MANIFEST.md and modules/manifest.schema.json defining what a module.json is.

Required fields:
  id              lowercase, [a-z0-9-], unique, and it is the table prefix
  title           what shows on the tab
  version         semver, the module's own
  hostApi         semver of the host API this was built against
  tables          array of table names - EVERY one must start with m_<id>_
  routes          array of paths - all under /api/m/<id>/
  zones           array from personal|business|clients|general, may be empty
  dependsOn       array of module ids, may be empty
  permissions     array from a fixed list the host defines

Rules the schema enforces, not a README:
  - a table name not starting with the module's own prefix is invalid
  - a route not under the module's own path is invalid
  - an unknown permission string is invalid, not ignored

That third rule matters more than it looks. A host that ignores permissions it does not
recognise will silently accept a module built for a newer host and run it with fewer
restrictions than its author intended.

Then write MANIFEST.md as the document I would hand somebody writing their first module.
```

**You know it worked when:** the schema refuses a manifest before any code has run.

---

## Prompt 03 — The validator, and the broken manifests

```text
Write modules/validate.mjs, exporting validate(manifest) -> { ok, errors }.

It checks the schema, then four things a schema cannot:
  1. Every table starts with this module's prefix
  2. Every route is under this module's path
  3. hostApi major version matches the host's - if not, a clear error naming both
  4. dependsOn names modules that exist

Then write modules/__fixtures__/ with the deliberately broken manifests, one per failure,
each named for what is wrong with it:

  bad-table-prefix.json          declares a table belonging to another module
  bad-route-escape.json          mounts at /api/m/other/
  bad-host-api.json             built for host API 2.x
  bad-cycle-a.json / -b.json    depend on each other
  bad-unknown-permission.json   asks for a permission we do not define
  bad-missing-dep.json          depends on a module that is not installed

And check-registry.mjs, which runs every fixture plus the real manifests and prints a
table of expected versus actual. Exit non-zero if any disagree.

The fixtures are the deliverable here, not the validator. A validator with no adversarial
inputs is an opinion.
```

**You know it worked when:** `check-registry.mjs` is green, and you wrote the red cases first.

---

## Prompt 04 — Discovery and the load order

```text
Write modules/registry.mjs. At boot it:

  1. Scans modules/*/module.json
  2. Validates each. An invalid module does NOT load, and the host logs which and why -
     with the module id and the specific error, not "failed to load module".
  3. Topologically sorts by dependsOn.
  4. On a cycle: throws, naming every module in the cycle. Not a warning. A host that
     boots with an undefined module order is a host whose behaviour changes between
     restarts for reasons nobody will find.
  5. Returns the ordered list.

One thing it must NOT do: fall back to alphabetical order. If you are tempted, add a
comment instead saying that alphabetical order is a coincidence that holds until somebody
names a module "analytics", and that the bug then appears only on a fresh install.

Then print me the load order for my three modules and the reason for it.
```

**You know it worked when:** you add a fake circular dependency and the host refuses to boot,
naming both modules.

---

## Prompt 05 — Ordered migrations, tracked

```text
Write modules/migrate.mjs.

  - Runs each module's migrations/ in registry order, and within a module in numeric
    filename order.
  - Tracks applied migrations in a table module_migrations: module_id, filename, sha256
    of the file, applied_at.
  - The sha256 is the point: if a migration file CHANGES after being applied, the host
    refuses to start and says which file and when it was originally applied. An edited
    migration means my database and my source disagree and no amount of re-running fixes
    it.
  - Each module's migrations run in one transaction. A module that half-migrates does not
    exist; it fails and the host reports it.
  - --dry-run prints the SQL, in order, with the module name above each, and touches
    nothing.

Then run it with --dry-run and show me the output. Do not run it for real. I will read
the SQL and run it myself.
```

**You know it worked when:** `--dry-run` shows you every statement in the order it would run,
and you read all of it.

★ Insight ─────────────────────────────────────
The sha256 on an applied migration is the cheapest audit you will ever add. Editing a
migration that already ran is the most common way a schema silently diverges between two
machines: your database has the old version applied, your source has the new one, and every
tool reports success forever. Hashing turns an invisible divergence into a refusal to boot.
─────────────────────────────────────────────────

---

## Prompt 06 — A database role per module

```text
This is the segment that turns isolation from a convention into an enforcement.

Write modules/grants.mjs. For each module it:

  1. Creates a Postgres role m_role_<id> if absent, with no login.
  2. Grants that role select, insert, update, delete on tables matching m_<id>_% only.
  3. Explicitly revokes everything on every other table.
  4. The host opens that module's database connections SET ROLE'd to it.

Requirements:
  - Idempotent. Running it twice changes nothing.
  - It prints every GRANT and REVOKE it is about to run, and asks for confirmation, unless
    given --yes. Default to asking.
  - Afterwards it VERIFIES: for each module, attempt a select on another module's table
    as that role and assert it is refused. Print the assertion and the error Postgres
    returned. An unverified grant is a hope.

Then tell me what happens to all of this if my dashboard connects to Postgres as a
superuser, and how I find out whether it does.
```

**You know it worked when:** you can watch Postgres refuse the Tasks role reading a Contacts
table, and read the exact error.

---

## Prompt 07 — The bound search, which a module cannot widen

```text
This is where Class 10 finishes paying for itself.

In the host, write a function that takes a module's manifest and returns a search function
bound to exactly that module's declared zones:

  bindSearch(manifest) -> (query, limit) => searchFiles({ query, zones: manifest.zones, limit })

The module receives ONLY the bound version, injected by the host. It never receives
searchFiles. It never receives the zones array in a form it can edit.

Then prove it, and make the proof a test I can run:
  1. A module with zones ['business'] cannot retrieve a document seeded in clients.
  2. There is no reachable path from module code to the unbound searchFiles. Show me how
     you established this - import graph, module boundary, or however you did it - and be
     honest about what you could not rule out.
  3. A module declaring zones ['personal'] loads, but the host logs a warning naming it.
     Personal is not forbidden. It is just never quiet.

Point 2 is where I want your honesty, not your confidence. If a determined module author
can still get at the unbound function, tell me exactly how.
```

**You know it worked when:** the answer to point 2 includes at least one thing you could not
rule out. It always does.

---

## Prompt 08 — Mount, render, and fail loudly

```text
Wire the registry into the running dashboard.

Server side:
  - For each loaded module, mount its routes under /api/m/<id>/, with the module's bound
    database connection and bound search injected.
  - A module route that throws returns 500 for THAT route only. One bad module does not
    take down the host.

Client side:
  - Tabs are rendered from the registry, not from a hardcoded array. Delete the array.
  - A module whose UI fails to render shows an error card in its own tab, naming the
    module, with the error. It does not white-screen the dashboard.
  - A module that failed validation at boot appears as a disabled tab with the validation
    error visible. Not hidden. I want to see that it tried and why it did not.

That last one matters: a module that silently does not appear is indistinguishable from a
module I forgot to install, and I will spend twenty minutes on the wrong problem.
```

**You know it worked when:** you break one module on purpose and everything else still works.

---

## Prompt 09 — Contacts

```text
Build the first module: contacts. A list with a detail view. The smallest honest CRM.

  modules/contacts/module.json
    id contacts, zones ['clients','business'], no dependencies

  Tables: m_contacts_people, m_contacts_notes
    people: name, company, email, phone, tags[], created_at, updated_at
    notes:  contact_id, body, created_at

  Routes under /api/m/contacts/: list with search, get one, create, update, add note.

  UI: a list with a filter box, a detail pane, inline note adding.

One thing that makes this more than a CRUD form: the detail pane shows documents from
Class 10 that mention this contact, using the BOUND search from prompt 07. It cannot
search personal. Show me the call, and show me that the zones came from the manifest.

Deliberately NOT in scope, and say so in the module's README: pipelines, deal stages,
email integration, activity timelines. Those are the features that turn a contact list
into a CRM project. The list is the module.
```

**You know it worked when:** a contact's detail pane shows a client document — and shows
nothing from your personal zone, because it cannot see it.

---

## Prompt 10 — Tasks

```text
Build the second module: tasks. A board, because it needs a different shape from the list.

  id tasks, zones ['business'], dependsOn ['contacts']

  Tables: m_tasks_items, m_tasks_transitions
    items:       title, body, state, contact_id (nullable), due_at, created_at
    transitions: task_id, from_state, to_state, at

  States: todo, doing, blocked, done. State changes are recorded in transitions - I want
  to know a task sat in blocked for nine days, and an updated_at column cannot tell me
  that.

  UI: four columns, drag between them.

Now the interesting constraint. This module depends on contacts and stores a contact_id -
but its database role CANNOT read m_contacts_people. So it cannot join.

Do not solve this by widening the grant. Solve it through a declared interface the host
mediates, and then explain to me in three sentences what that cost in code, and what it
bought. If your honest answer is that it cost more than it bought at this size, say that
too - I would rather have the real assessment than a defence of the architecture.
```

**You know it worked when:** you can articulate the trade honestly in both directions.

---

## Prompt 11 — Invoices

```text
Build the third module: invoices. A document that renders and totals. The one that must
never be wrong.

  id invoices, zones ['clients','business'], dependsOn ['contacts']

  Tables: m_invoices_invoices, m_invoices_lines
    invoices: number, contact_id, issued_at, due_at, status, currency, notes
    lines:    invoice_id, description, quantity, unit_price_cents, tax_rate

Non-negotiable, and each gets a comment saying why:
  - Money is INTEGER CENTS. Never a float. Never a JavaScript number doing arithmetic on
    dollars. Write the comment about 0.1 + 0.2.
  - Currency is stored per invoice and displayed everywhere the amount is.
  - Totals are computed in SQL, in one place, and every display reads that. Not computed
    in the UI. Not computed twice.
  - Tax is per line, not per invoice, and the rounding rule is stated in a comment. Pick
    round-half-up per line and say so - the rule matters less than it being written down.
  - An invoice with status sent is immutable. Editing one creates a revision.

  UI: a list, an editor, and a print view.

Then write the test that proves totals: a three-line invoice with fractional tax that
totals differently under two plausible rounding rules. Assert on the one we chose.
```

**You know it worked when:** you have a test whose whole purpose is to fail if somebody
changes the rounding rule.

---

## Prompt 12 — The install and uninstall path

```text
Adding a module is a folder. Removing one has to be a real answer, not a shrug.

Write modules/install.mjs and modules/uninstall.mjs.

install:
  - Validates the manifest before anything else
  - Reports the manifest in plain English - tables, routes, zones, permissions,
    dependencies - and requires confirmation
  - Runs its migrations, creates its role, applies its grants
  - Never installs a module whose dependencies are absent

uninstall:
  - Refuses if another installed module depends on it, naming which
  - Drops the role and revokes the grants
  - Does NOT drop the tables by default. It prints exactly what would be dropped and the
    command to do it.

That last choice is the same one Class 10 made about deleting files, for the same reason,
and the class should say so: removing something from the interface and destroying its data
are different decisions, and collapsing them means the reversible one is never available.
```

**You know it worked when:** uninstalling Contacts refuses, because Tasks depends on it.

---

## Prompt 13 — The module the host runs against itself

```text
Make the host's own state visible, as a module, using its own socket.

  id system, zones [], dependsOn []

Its tab shows:
  - Every installed module: id, version, hostApi, load order, status
  - Every module that FAILED to load, with the validation error
  - Each module's declared tables, routes and zones, read from the manifest
  - Applied migrations per module with dates, and any whose file hash no longer matches
  - Each module's role, and the result of a live permission probe - can this role read a
    table it should not? Run it, show the answer.

Building this as a module rather than a special page in the host is the point. If the
socket cannot host the tool that inspects the socket, the socket is not general.

Then tell me what this module could see that it should not, and whether zones [] is
actually enough to constrain it.
```

**You know it worked when:** the system module is loaded by the same registry as the others,
with no special case in the host.

---

## Prompt 14 — The template, and the docs

```text
Now that three modules exist, extract what they have in common.

  1. modules/_template/ - a fourth module, complete and working, called example. It
     shows a list, stores three rows, does one bound search, and has one migration. It
     installs cleanly and does something visible.
  2. modules/WRITING-A-MODULE.md - the guide. Written for somebody who has taken this
     class and nothing else. It must cover: the manifest, the prefix rule, why the
     database role exists, how zones are injected, how to depend on another module, how
     to test in isolation, and the three mistakes you predict a first-time author will
     make.
  3. A checklist a module must pass before I would install one from somebody else.

For number 3, write it as questions I ask the MANIFEST, not questions I ask the code. If
answering them requires reading the source, the manifest is not carrying its weight and
you should tell me which field is missing.
```

**You know it worked when:** the checklist is answerable from `module.json` alone.

---

## Prompt 15 — Let the cockpit scaffold the fourth

```text
Class 8 gave me history. Class 9 gave me a guarded agent. This class gave me a template.
Put all three together.

Write cockpit/prompts/scaffold-module.md - the prompt I paste into the COCKPIT to have it
scaffold a new module from the template.

It must instruct the agent to:
  - Ask me for the module id, title, the zones it needs, and its dependencies, one at a
    time, before writing anything
  - Copy _template/, rename, and fill in the manifest
  - Write the migration but NOT run it, and say so explicitly at the end
  - Run check-registry.mjs and show me the result
  - Stop, and tell me to read the diff

And it must instruct the agent NOT to:
  - Run migrate.mjs
  - Run grants.mjs
  - Run any git command that changes anything
  - Widen the zones beyond what I asked for, even if it thinks the module needs more

Then tell me, in three sentences, what each of Classes 8, 9 and 12 is contributing at the
moment I paste that prompt, and what would go wrong if any one of the three were missing.
```

**You know it worked when:** you can name all three contributions, and notice that the answer
for Class 8 is "the diff you are about to read."

---

## Prompt 16 — Adversarial verify

```text
Write VERIFY.md for the module host, and run it with me.

Prove all twelve against the running system:

   1. A manifest declaring a table without its own prefix is refused at boot, by name
   2. A dependency cycle stops the host from booting, naming both modules
   3. A module built for a different host API major version does not load, and the
      disabled tab shows why
   4. The Tasks role cannot select from m_contacts_people - show Postgres's error
   5. A module with zones ['business'] retrieves nothing from a document seeded in clients
   6. A module declaring zones ['personal'] loads and produces a warning naming it
   7. Editing an already-applied migration file stops the host from booting, naming the
      file and its original apply date
   8. A module route that throws returns 500 for that route only; other tabs still work
   9. A module whose UI throws shows an error card in its own tab; the dashboard renders
  10. Uninstalling contacts is refused while tasks depends on it
  11. The invoice rounding test fails if the rounding rule is changed - change it, watch
      it fail, change it back
  12. The system module's live permission probe reports no role able to read outside its
      own prefix

For each: exact steps, what counts as a pass, and a blank result line.

Then three things this design does not protect against. One must be about the frontend,
where every module's code runs in the same page as every other module's. Be specific.
Do not reassure me.
```

**You know it worked when:** item 11 is the one you did by hand, and watched fail.

---

## What you have at the end

A dashboard that is no longer an application with tabs. It discovers modules from a folder,
refuses the ones whose manifests lie, runs their migrations in a declared order, gives each
one a database role that Postgres enforces, hands each one a document search bound to the
zones it declared, and survives any single module breaking.

Three modules to show the shape, a template for the fourth, and a guarded agent from Class 9
that can scaffold it while you read the diff.

And a written list of the three ways it can still hurt you — one of which is that everything
above stops at the browser.

---

## What twelve weeks built

Reasoning, senses, memory, ears, voice, hands, a graph, a clock, history, a cockpit, a mouth,
a phone number, and a socket.

**What it still does not have:** anyone but you. Every guard in this series protects the
system from mistakes and from strangers. None of it answers what happens when a second person
needs their own login, their own zones, and their own answer to what they are allowed to see.

That is a different series.
