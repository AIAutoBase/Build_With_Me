# Class 12 — The Socket

**The Brain That Runs a Company, Part 12.**

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-12/**
>
> That page is the show notes. It carries the one-line install, the run of the hour, the
> traps, and what a member can verify before class.

Wednesday 28 October 2026, 11:00 AM ET

---

## This folder

`index.html` is generated from `SITE.md` by `ops/build-site.mjs`. **Edit `SITE.md`, never
`index.html`** — a hand-edit is overwritten by the next build and leaves no trace of what
was changed.

```
node ops/build-site.mjs 2026-10-28/class-12-modules/site
```

## The pack

| | |
|---|---|
| File | `downloads/class-12-modules-pack.zip` |
| sha256 | `644e6628a2fc693403cce18b50cdc69706dd2441f60ba3a89ed6f5663cd68d1e` |
| Reproducible | yes — building twice produces identical bytes |

That last row is new in this arc. Every pack before Class 9 was stamped with the current
time on every zip entry, so a checksum could never be recovered by rebuilding. These pin
their timestamps.

**It does not make `deliverables/` redundant.** A rebuild reproduces the bytes only while
the source is unchanged. The moment `assets/` changes, what a member downloaded is
recoverable from that folder and from nowhere else.

The same sha256 appears in three places and they move together, or the checksum fails on a
member's machine and not yours: the zip, `downloads/SHA256SUMS`, and the download step in
`../student-prompts/PROMPT-class-12-modules.md`. Then regenerate `install.txt`.

## install.txt is generated, never hand-edited

Source of truth is the fenced `text` block in the student prompt:

```
awk '/^```text$/{f=1;next} /^```$/{f=0} f' ../student-prompts/PROMPT-class-12-modules.md > install.txt
```

## What a member can prove before class

```
node check-registry.mjs
```

3 manifests valid, 7 deliberately broken ones refused, the cycle pair named. It executes nothing to produce that table, which is why it is the only file
in the pack the installer is allowed to run.
