# Class 9 — The Cockpit

**The Brain That Runs a Company, Part 9.**

> **Student front door: https://aiautobase.github.io/Build_With_Me/class-09/**
>
> That page is the show notes. It carries the one-line install, the run of the hour, the
> traps, and what a member can verify before class.

Wednesday 7 October 2026, 11:00 AM ET

---

## This folder

`index.html` is generated from `SITE.md` by `ops/build-site.mjs`. **Edit `SITE.md`, never
`index.html`** — a hand-edit is overwritten by the next build and leaves no trace of what
was changed.

```
node ops/build-site.mjs 2026-10-07/class-09-cockpit/site
```

## The pack

| | |
|---|---|
| File | `downloads/class-09-cockpit-pack.zip` |
| sha256 | `0593d805d32bd4c270bd411b7f2990dab2e6b26334221d804766186f46c4537f` |
| Reproducible | yes — building twice produces identical bytes |

That last row is new in this arc. Every pack before Class 9 was stamped with the current
time on every zip entry, so a checksum could never be recovered by rebuilding. These pin
their timestamps.

**It does not make `deliverables/` redundant.** A rebuild reproduces the bytes only while
the source is unchanged. The moment `assets/` changes, what a member downloaded is
recoverable from that folder and from nowhere else.

The same sha256 appears in three places and they move together, or the checksum fails on a
member's machine and not yours: the zip, `downloads/SHA256SUMS`, and the download step in
`../student-prompts/PROMPT-class-09-cockpit.md`. Then regenerate `install.txt`.

## install.txt is generated, never hand-edited

Source of truth is the fenced `text` block in the student prompt:

```
awk '/^```text$/{f=1;next} /^```$/{f=0} f' ../student-prompts/PROMPT-class-09-cockpit.md > install.txt
```

## What a member can prove before class

```
node check-guard.mjs
```

45 refusals each with their expected rule, 20 commands allowed, 0 failures. It executes nothing to produce that table, which is why it is the only file
in the pack the installer is allowed to run.
