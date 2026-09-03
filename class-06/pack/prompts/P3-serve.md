# P3 — Make it work offline, then put it on your dashboard

**Paste this whole file into Claude Code**, on the machine your brain runs on.

**You end with:** a **Graph** tab on the dashboard you already have, loading from your own
machine, working with the internet unplugged.

---

## Why this prompt exists at all

`graph.html`, as graphify writes it, **loads `vis-network` from `unpkg.com`.**

Which means the graph of your private business documents does not render unless a CDN is
up and reachable — and it makes a request to a third party every time you open it.

Fixing it is two steps: download one 687 KB file, change one `src` attribute.

**This is the class about portability.** Six weeks of *your stack, on your machine* would
be an odd thing to end on a page that phones out to somebody else's server to draw itself.

---

```text
Make my graphify graph self-contained, then serve it from my existing dashboard.

## Step 1 - Show me the problem before fixing it

Find graph.html and show me the line that loads vis-network from a CDN. Something like:

  <script src="https://unpkg.com/vis-network/..."></script>

Then explain what that means in practice:
  - the page does not render without internet
  - opening it tells unpkg.com that someone opened it
  - if that URL ever moves, my saved graph silently breaks

I want to see the actual line before you change it.

## Step 2 - Vendor the script

The pack ships `vendor-vis.sh` which does this. Read it to me first, then run it - do not
run a script I have not seen, and that rule applies to scripts I got from my own class.

What it does:
  1. downloads the vis-network standalone bundle next to graph.html (about 687 KB)
  2. rewrites the src attribute to point at the local copy
  3. leaves a backup of the original

If you would rather do it by hand, that is fine - do the same two things and tell me the
exact commands.

## Step 3 - Prove it is actually offline now

Do not take my word for it and do not take yours.

  grep -o 'src="[^"]*"' graph.html

Every src must be a local path. If ANY of them still points at a URL, it is not
self-contained and you should say so plainly rather than moving on.

Then check the vendored file is really there and is not a 404 page saved to disk:

  ls -l vis-network.min.js
  head -c 100 vis-network.min.js

A file of a few hundred bytes starting with "<!DOCTYPE html>" is an error page, not a
library. That failure looks exactly like success in a directory listing.

## Step 4 - Serve it from the dashboard I already have

My dashboard is served by the bi-brain-web container from Class 3's addendum. Its static
folder is mounted from the host - find the actual mount in my docker-compose file rather
than assuming a path.

Copy graph.html and vis-network.min.js into that mounted folder, then verify over HTTP:

  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:<port>/graph.html

Expect 200. On the class box this returned 200 in about 3 milliseconds.

Then check it from ANOTHER device on my network, not just localhost. A page that only
works on the box is not on my dashboard in any useful sense.

## Step 5 - Add the Graph tab

My dashboard already has tabs from the Class 3 addendum. Add one more, called Graph,
pointing at graph.html.

Match how the existing tabs are built - read the dashboard's own files and follow their
pattern rather than inventing a new one. If the tabs are defined in one place, add it
there.

Then show me the dashboard with the new tab, and confirm the graph renders inside it.

## Step 6 - Prove the offline claim properly

The real test:

  Confirm the page renders with no network access at all.

Do this without breaking my machine's networking - for example, check that no request
leaves for an external host when the page loads, or temporarily block outbound access to
unpkg.com and reload.

Tell me exactly which test you ran and what you observed. Do not claim "it works offline"
because the src looks local - claim it because you checked.

## Step 7 - Tell me where things are

Finish with:
  - the URL of my graph, on the LAN
  - where graph.html and vis-network.min.js now live
  - how to regenerate the graph later, and that I will need to re-vendor after doing so
  - that nothing in my database or workflows was touched

That last one matters: re-running `graphify update` rewrites graph.html and puts the CDN
link back. Tell me plainly that vendor-vis.sh has to be re-run every time.

## Ground rules

- Show me every script before running it, including ones from this pack.
- Never claim self-contained without grepping for remaining URLs.
- Do not modify the Class 3 dashboard's existing tabs, only add to them.
- If the dashboard container is not running, say so - do not start rearranging my stack.
```

---

## The gotcha that will get you later

**Re-running `graphify update` rewrites `graph.html` and the CDN link comes back.**

Every time you rebuild the graph, re-run `vendor-vis.sh`. Otherwise your offline page
quietly becomes an online page again, and you will not notice until you are somewhere
without internet, which is exactly when you wanted it.

## If it goes wrong

| What you see | What it means |
|---|---|
| Blank page, no graph | The vendored JS did not load. Open the browser console — a 404 on `vis-network.min.js` is the usual cause. |
| `vis-network.min.js` is ~1 KB | You saved an error page, not the library. Check the download URL. |
| Works on the box, not from the LAN | The dashboard is bound to `localhost` only. |
| Graph tab is blank but the file is fine | The dashboard serves a different folder than the one you copied into. Read the compose mount again. |
| It worked, then stopped after you rebuilt the graph | `graphify update` restored the CDN link. Re-run `vendor-vis.sh`. |
