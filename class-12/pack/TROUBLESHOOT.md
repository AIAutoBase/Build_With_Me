# Class 12 -- the five traps

From `DECISIONS.md`. Four of these five are the same shape as every trap in this
series: a silent failure that produces a plausible artifact. The socket looks like it
works right up until the moment it doesn't, and by then the person looking at it is not
the person who built it.

---

## 1. An unversioned registry

**Symptom you see first:** a module that worked yesterday throws a stack trace today,
and the trace points into code you did not write and do not recognize. Usually this
happens right after you or a member installs a module someone else built, or right
after the host itself gets upgraded.

**Cause:** `module.json` never recorded which host API version the module was built
against, so nothing compared "what this module expects" to "what the host actually
provides." The module and the host drifted apart silently, and the first thing that
notices is whatever line of the module's code happens to call something that no longer
exists or behaves differently.

**Fix:** every manifest carries `hostApi` (rule 4 in `validate.mjs`). The host compares
the manifest's `hostApi` MAJOR version to its own at load time. A mismatch refuses to
load and names both versions in the error, before any of the module's code runs. This
is why `hostApi: 2.0.0` in `fixtures/bad-host-api.json` is refused rather than crashing
three screens deep -- the whole point of the check is to fail at the boundary, not
inside the module.

---

## 2. Migrations in whatever order the filesystem returns

**Symptom you see first:** nothing, for months. Then a fresh install -- a new laptop, a
rebuilt box, a member following the install prompt for the first time -- fails a
migration that has run fine on every existing machine, or runs migrations in an order
that leaves a foreign-key reference pointing at a table that has not been created yet.

**Cause:** `fs.readdir` and most directory listings return entries in whatever order
the filesystem happens to store them, which is very often creation order on the
machine that created them, and is not guaranteed by anything. Relying on that order
without saying so means the true dependency order was never written down anywhere --
it just happened to match, on your box, for as long as you didn't add or reorder files.

**Fix:** modules declare `dependsOn` by id, and the host topologically sorts them with
`sortModules()` before running any migration. This is also why `sortModules()` refuses
to fall back to alphabetical order on a cycle: alphabetical order is exactly the same
kind of accidental correctness as filesystem order, just with a different rule for when
it happens to line up. The comment in `validate.mjs` says so directly -- alphabetical
order holds until a module gets named something like "analytics," and the bug then
shows up first on a fresh install, which is the one machine with no history to have
caught it earlier.

---

## 3. One module importing another's code directly

**Symptom you see first:** you delete or replace a module you thought was independent,
and two other, unrelated-looking modules break. The error does not mention the module
you deleted; it mentions a function that "is not defined" somewhere inside a module you
did not touch.

**Cause:** somewhere, a module's server code did `import { something } from
'../contacts/server/helpers.js'` (or the equivalent) instead of going through a
declared interface. It is one line, it works the day it is written, and it is
essentially invisible in review -- nothing about that import looks different from any
other. Six weeks later, nobody remembers it exists, and "delete the contacts module" is
no longer a safe sentence.

**Fix:** `dependsOn` in `module.json` orders migrations and load, and that is ALL it
does. It is not a license to `import` another module's files. Two modules that need to
share data go through a declared interface at the host level, or through the database
directly (bounded by the per-module role, trap 5) -- never through one module's
`server/` or `ui/` folder reaching into another's. There is no rule in `validate.mjs`
that can catch a raw `import` statement; this trap is caught in code review, not by the
checker, and that is worth saying out loud rather than pretending the manifest covers
it.

---

## 4. Porting all forty-six modules

**Symptom you see first:** nothing breaks. That is what makes this one different from
the other four -- there is no error, no stack trace, no refused manifest. What you
notice, eventually, is that three months went by and the thing you built is a smaller,
slower copy of a dashboard that already exists, rather than the three modules your own
company actually needed.

**Cause:** a well-known local-AI dashboard ships forty-six modules, and it is easy to
read that number as a feature list to catch up with rather than as a demonstration that
adding a module is supposed to be cheap. Once the socket is built, every one of those
forty-six modules *looks* like a reasonable afternoon of work, and forty-six reasonable
afternoons is most of a quarter.

**Fix:** this pack ships three modules -- Contacts, Tasks, Invoices -- chosen for their
shapes (a list, a board, a rendered document with totals), not as the start of a longer
list. A fourth idea that actually matters to your business has a template that fits it.
The forty-six-module pack is not a checklist; it is proof that the shape is cheap once
it exists. Building your own forty-six is optional, and for most one-person or
small-team operations it is the wrong use of the time the socket just bought you.

---

## 5. A module with a database role that can read everything

**Symptom you see first:** nothing, forever, in every test you run. This is the one
trap that is genuinely undetectable by testing, because a module with a superuser (or
otherwise unscoped) database connection behaves identically to a correctly scoped one
right up until the moment the scoping would have mattered -- a bug in one module's
query, a module you did not fully trust, a migration that touches the wrong table. By
the time it matters, the module has already read or written something it should not
have been able to reach, and there is no earlier warning that would have caught it.

**Cause:** the dashboard's database connection was set up once, in Class 2, often by
someone who was still learning Postgres, and every module since has been handed that
same connection rather than a role scoped to its own tables. The manifest's `tables`
list becomes a convention -- something modules are expected to respect -- rather than
something Postgres actually enforces. A convention is a comment, and a comment does not
stop a `JOIN`.

**Fix:** each module gets its own database role that can reach only its own
`m_<id>_*` tables, granted by Postgres, not agreed to by the module's author. This is
the isolation segment at minute 20 in the run of the hour, and it is deliberately NOT
something this pack's installer does for you -- creating or altering a database role
unattended, on a box whose Postgres setup you have not verified, is how a member arrives
at class with a database they cannot log into. Step 3 of the install prompt checks,
before class, whether your dashboard's current connection is already a superuser. If it
is, the honest answer is that isolation will be decorative until that changes -- the
class says so rather than pretending the manifest alone is the enforcement.
