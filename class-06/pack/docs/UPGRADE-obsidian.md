# Upgrade — the graph in Obsidian, on your laptop

**Optional. The class default is the served web page, and it is not a downgrade.**

---

## Why this is an upgrade doc and not the main path

If you have read about Graphify anywhere else, it was almost certainly paired with
**Obsidian**, and you may have arrived expecting to install it.

**You cannot install it on your brain.** Obsidian is an Electron desktop application. Your
brain is a headless server with no desktop, no display and no window manager. There is
nothing for it to open into.

That is not a limitation to work around. It is what a server is.

So the class default is the graph **served from the dashboard you already have** — a web
page, on the machine that already serves you a dashboard, reachable from your laptop, your
phone, or anything else on your network. Nothing to install, nothing to sync.

Obsidian lives on **your laptop**, and it is genuinely nicer to explore in. The cost is
getting the vault from the box to the laptop, and keeping it there.

---

## What you actually gain

| | Served `graph.html` | Obsidian |
|---|---|---|
| Install | nothing | a desktop app |
| Where it runs | the brain | your laptop |
| Reachable from | anything on the network | that one laptop |
| Explore by clicking through | limited | **much better** |
| Edit a note and see the graph change | no | **yes** |
| Local graph view per note | no | **yes** |
| Works when the laptop is off | **yes** | no |
| Sync required | none | **yes, and it is the whole cost** |

**The honest summary:** Obsidian is better for exploring and thinking. The served page is
better for *having*. Most people want both, and they are not mutually exclusive — the
served page stays exactly as it is when you add this.

---

## Getting the vault to your laptop

This is the entire difficulty. Pick one.

### Syncthing — continuous, no cloud, no account

The one to pick if you want it to just be there.

- Runs on both machines, syncs a folder peer-to-peer, encrypted in transit
- No third party ever holds your documents
- Bidirectional, so notes you write on the laptop reach the brain

Costs a daemon on both ends and a few minutes of pairing. **If you are going to use
Obsidian regularly, use this one.**

### A network share — SMB or NFS

Fine if your laptop and brain are always on the same network.

- Nothing new to install on the brain if it already shares
- Obsidian opens the vault over the share
- **Obsidian over a slow or flaky share is genuinely unpleasant** — it does a lot of small
  reads, and it will feel broken rather than slow

### git — versioned, manual, and honest about what it is

- `git pull` when you want the current state
- Full history of how the vault changed
- **You will forget to pull**, and then Obsidian shows you a graph of last month

Good if you already think in git. Bad as a sync mechanism, because it is not one.

### What not to do

**Do not put your business documents in a consumer cloud folder to solve this.** Six
classes of *your stack, your machine, your data* should not end with the vault sitting on
somebody else's server because syncing was slightly awkward.

If you are going to do that anyway, at least decide it on purpose rather than by default.

---

## Then, in Obsidian

1. Open the synced folder as a vault.
2. The graph view is built in — no plugin needed for the basic one.
3. Graphify's output lands as notes and links, so Obsidian's own graph shows the same
   structure you served on the dashboard.

**Rebuild on the brain, not on the laptop.** Run `graphify update` where the documents
actually live, let it sync, and open the result. Running it on a partial copy gives you a
graph of a partial corpus, which looks exactly like a graph of everything.

---

## The thing that will confuse you later

**Two graphs now exist**, and they can disagree:

- the `graph.html` served from your dashboard
- Obsidian's own graph view of the synced vault

They come from the same data, but only if the sync is current *and* the graph was rebuilt
after your last document went in. When they disagree, **the brain is right** — that is
where the documents live.

**Neither of them errors when it is stale. They both just answer.**

---

## Should you bother?

If you open the graph once a month to check something: **no**, the served page is enough.

If you are going to actually think in this thing — click through, follow connections, find
what is isolated: **yes**, and set up Syncthing rather than fighting a share.

Either way, the served page keeps working. This adds; it does not replace.
