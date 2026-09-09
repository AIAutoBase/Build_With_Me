# Class 12 module pack

The Brain That Runs a Company, Part 12: the socket. This pack is the registry layer --
the part that can be checked before class touches a real database.

## What is in this pack

| File | What it is for |
|---|---|
| `manifest.schema.json` | Documentation of the module.json shape, as a JSON Schema (draft 2020-12). Not loaded by any code in this pack -- the real enforcement is `validate.mjs`, hand-rolled, so the host has one fewer dependency between a bad manifest and a refusal. Keep the two in agreement by hand; `check-registry.mjs` is what proves they agree in practice. |
| `validate.mjs` | The REFERENCE validator. Exports `validate(manifest, { hostApi, installedIds })` and `sortModules(manifests)`. See "reference vs yours" below. |
| `manifests/contacts.json` | The real Contacts module manifest. Zones `clients`, `business`. No dependencies. |
| `manifests/tasks.json` | The real Tasks module manifest. Zone `business`. Depends on `contacts`. |
| `manifests/invoices.json` | The real Invoices module manifest. Zones `clients`, `business`. Depends on `contacts`. |
| `fixtures/*.json` | Seven deliberately broken manifests, one broken rule each (see table below). Two of them (`bad-cycle-a.json`, `bad-cycle-b.json`) are individually valid -- the break only shows up when both are sorted together. |
| `check-registry.mjs` | The offline checker. Loads no module code, mounts no route, touches no database. Feeds every manifest above through `validate()` and the cycle pair through `sortModules()`, prints a table, and prints the four summary lines the install prompt promises. |
| `PACK-README.md` | This file. |
| `TROUBLESHOOT.md` | The five traps from `DECISIONS.md`, each as symptom -> cause -> fix. |

## What each fixture breaks

| File | Rule it breaks | What it does wrong |
|---|---|---|
| `bad-table-prefix.json` | 2 | Declares a table that belongs to another module (`m_contacts_people` inside an `invoices` manifest). |
| `bad-route-escape.json` | 3 | Mounts at `/api/m/other/` instead of its own `/api/m/tasks/`. |
| `bad-host-api.json` | 4 | Declares `hostApi: 2.0.0` against a host running major version 1. |
| `bad-cycle-a.json` + `bad-cycle-b.json` | none individually; the pair | Each depends on the other. Both pass `validate()` alone. Only `sortModules()`, walking both at once, can see the cycle. |
| `bad-unknown-permission.json` | 6 | Asks for `shell.exec`, which is not in the fixed permission enum. |
| `bad-missing-dep.json` | 5 | Depends on `billing-core`, a module id that is not installed. |

## What this pack does NOT do

- It runs no migration. No `.sql` file in this pack is ever executed by anything in it.
- It creates no database role, user, grant or permission.
- It installs no npm package. `validate.mjs` and `check-registry.mjs` import nothing but
  Node's own `node:fs`, `node:path` and `node:url`.
- It modifies no existing file in your dashboard. Everything here is new files, meant to
  live next to your Class 2 dashboard until P1 (in class) wires the host in.
- It mounts no route and loads no module's `server/` or `ui/` code. A manifest is
  supposed to be judgeable without ever running the thing it describes, and this pack
  only ever reads `module.json` as plain JSON.

## Reference vs yours

The `validate.mjs` that ships here is a REFERENCE implementation. Its job is narrow: let
you run `node check-registry.mjs` before class and see, on your own machine, that a bad
manifest actually gets refused -- proof before class rather than a promise about class.

In class (build prompt 03) you write your own `modules/validate.mjs`, following the same
six rules. When it is ready, point the checker at it instead of the shipped one:

```
node check-registry.mjs --validate ../brain/modules/validate.mjs
```

The checker does not care which `validate.mjs` it is given. It imports whatever module
you point it at, checks that it exports `validate` and `sortModules` with the expected
shapes, and runs the exact same manifests and fixtures through it. If your validator is
looser than the reference -- if it accepts `bad-table-prefix.json`, say -- the table
will show a FAIL exactly where the shipped one shows a PASS, and it will name the rule.
