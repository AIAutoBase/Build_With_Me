# Attribution

**This is not boilerplate. Read it.**

---

## Graphify

The tool this class installs is **Graphify**, by **Graphify-Labs**.

| | |
|---|---|
| Repository | `Graphify-Labs/graphify` |
| PyPI package | `graphifyy` |
| Licence | **Apache License 2.0** |
| Version this class was built and measured against | **0.9.49** |

**Apache-2.0 is what makes this pack legal to hand you.** It permits redistribution and
commercial use, and it **requires attribution** — you keep the copyright notice and the
licence, and you state what you changed.

The full licence text ships with the package; you can read your own copy:

```bash
pip show -f graphifyy
```

### What this class changed

**Nothing.** We install graphify from PyPI, unmodified, at whatever version is current.

Two things we do around it, which are ours and not theirs:

1. **We vendor `vis-network` locally** so the generated `graph.html` works offline. That
   changes a file graphify *generates*, not graphify itself.
2. **We pass `--backend=claude-cli` explicitly**, which is a documented option, not a
   patch.

If graphify's behaviour disagrees with anything in this pack, **graphify is right and this
pack is out of date.** Their docs and their issue tracker are upstream of us.

### Where to take a graphify problem

**Not to us.** Bugs in the tool belong in `Graphify-Labs/graphify`. We teach one way of
using it; they maintain it.

Class questions — the venv, the dashboard, the MCP registration, the audit trail, anything
about *your brain* — those are ours.

---

## vis-network

`graph.html` renders with **vis-network**, from the **visjs** project, which is
dual-licensed **Apache-2.0 / MIT**.

`vendor-vis.sh` downloads a copy next to your `graph.html` so the page does not depend on
a CDN. **The copyright header stays in the file** — do not strip it, and do not let a
minifier strip it either.

---

## Why a class about portability cares about this

Six weeks of *your stack, on your machine, your data* would be a strange thing to end by
quietly removing someone's name from their work.

Attribution is the price of the licence that let you have it for free. It costs you a file
in a folder.

**If you build something on top of this and hand it to someone else, this file travels
with it.**

---

## The idea is not owned by anyone

Graphify is one implementation of *"your brain should be navigable."*

The idea is not theirs, ours, or anybody's. If graphify disappears tomorrow, the idea
survives and something else implements it — and everything you learned this hour about
communities, hub nodes, isolated nodes and the difference between extracted and inferred
transfers directly.

**Learn the idea. Credit the tool.**
