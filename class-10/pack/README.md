# Class 10 pack -- what is in here

The Brain That Runs a Company, Part 10: the mouth. This pack is the offline half of
the class -- everything you can check on your own machine before the hour starts,
with nothing running and no credential chosen yet.

## Files

**`zones.mjs`**
The zone resolver and query scoper. Exports `ZONES` (the four names, frozen),
`resolveZone(input)`, and `scopeQuery({ query, zones, limit })`. This is a REFERENCE
implementation, not the one you ship. See "What this pack does NOT do" below.

**`zone-tests.json`**
Fixtures for the checker: a list of realistic filenames paired with the zone they
belong in (several with accented and non-Latin characters, on purpose -- see the
`_comment` field in the file), and a list of inputs that must be refused as invalid
zones (`"all"`, `""`, `null`, `"ALL"`, `"Personal"`, a comma-joined string, `undefined`,
and `[]`).

**`check-zones.mjs`**
The offline checker. Spawns nothing, touches no database, uploads nothing -- it
imports a zones module and calls its exported functions directly. Run it with no
arguments to check the shipped reference, or with `--zones <path>` to check the one
you write in class.

**`minio.compose.yml`**
A standalone compose fragment for the object-storage container. Pinned image tag, a
named volume, loopback-only ports, and `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` with
no defaults, so the container refuses to start rather than start quietly with the
official quickstart's `minioadmin` / `minioadmin`. It is not merged into your existing
`docker-compose.yml` by anything in this pack.

**`TROUBLESHOOT.md`**
The five traps from `DECISIONS.md`, each as symptom, then cause, then fix.

## What this pack does NOT do

- It does not start anything. No container comes up because this pack exists.
- It does not set a password. `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` are left
  unset; choosing them is a segment of the class, not an installer step.
- It does not run a migration. No table is created, no column is added, no `zone`
  check constraint is written to any database. Nothing in this pack has a database
  connection string in it.
- It does not touch your existing `docker-compose.yml`, your `.env`, or your Class 3
  memory table.

## The shipped `zones.mjs` is a reference, not your answer

`zones.mjs` exists so that the refusals it makes are provable on your machine before
class -- you can run `node check-zones.mjs` tonight and see, in writing, that every
invalid zone input throws and that a query scoped to two zones cannot reach the other
two. That proof has to exist before class starts, because the checker's whole job is
to catch a version of this file that only looks like it refuses things.

In class, you write your own `zones.mjs` as part of the search endpoint build prompt.
When it is done, you point the same checker at it instead of the shipped one:

    node check-zones.mjs --zones ../brain/search/zones.mjs

The reference and your version are held to the exact same table. If yours prints the
same two PASS lines at the bottom, it means what the reference means: no default zone,
no case-insensitive match, no way to ask a query for "all zones," and the zone filter
sitting in the SQL `WHERE` clause where the database enforces it, not in JavaScript
after the rows have already left Postgres.
