#!/usr/bin/env bash
#
# vendor-vis.sh - make graphify's graph.html work without the internet.
#
# graphify writes a graph.html that loads vis-network from unpkg.com. That means the
# graph of your private documents does not render unless a CDN is up, and it tells a
# third party every time you open it.
#
# This downloads the library next to the HTML and repoints the script tag at it.
#
# RE-RUN THIS AFTER EVERY `graphify update`. Rebuilding the graph rewrites graph.html
# and the CDN link comes back. Your offline page quietly becomes an online page, and
# you find out somewhere without internet - which is exactly when you wanted it.
#
#   bash vendor-vis.sh [path/to/graph.html]
#
set -euo pipefail

HTML="${1:-graph.html}"
DIR="$(cd "$(dirname "$HTML")" && pwd)"
BASE="$(basename "$HTML")"
HTML="$DIR/$BASE"
LIB="$DIR/vis-network.min.js"

# The standalone bundle: vis-network plus its dependencies in one file, so there is
# exactly one thing to vendor rather than a dependency tree.
URL="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"

say()  { printf '%s\n' "$*"; }
fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }

[ -f "$HTML" ] || fail "no such file: $HTML
       Run this next to the graph.html that graphify generated, or pass its path."

say "vendoring vis-network for $HTML"
say ""

# ── 1. show what we are about to change ────────────────────────────────────────
say "current script sources:"
grep -o 'src="[^"]*"' "$HTML" | sed 's/^/    /' || say "    (none found)"
say ""

if ! grep -q 'src="https\?://[^"]*vis-network' "$HTML"; then
  if [ -f "$LIB" ] && grep -q 'src="vis-network.min.js"' "$HTML"; then
    say "Already vendored - nothing to do."
    exit 0
  fi
  fail "could not find a remote vis-network script tag in $BASE.
       graphify may have changed its template. Look at the file and vendor by hand:
       download the library next to it and point the src at the local copy."
fi

# ── 2. download ────────────────────────────────────────────────────────────────
say "downloading vis-network..."
if command -v curl >/dev/null 2>&1; then
  curl -fL --retry 2 -o "$LIB.tmp" "$URL" || fail "download failed from $URL"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O "$LIB.tmp" "$URL" || fail "download failed from $URL"
else
  fail "neither curl nor wget is installed"
fi

# ── 3. prove we got a library and not an error page ────────────────────────────
#
# A 404 saved to disk is still a file. In `ls -l` it looks like success, and the page
# then fails to render for a reason that points nowhere near the download.
SIZE=$(wc -c < "$LIB.tmp")
say "downloaded $SIZE bytes"

if [ "$SIZE" -lt 100000 ]; then
  head -c 120 "$LIB.tmp" >&2 || true
  rm -f "$LIB.tmp"
  fail "that is far too small to be vis-network (expected roughly 700 KB).
       What downloaded was probably an error page. See the first bytes above."
fi

if head -c 200 "$LIB.tmp" | grep -qi '<!doctype\|<html'; then
  rm -f "$LIB.tmp"
  fail "the download is HTML, not JavaScript - an error page saved to disk."
fi

mv "$LIB.tmp" "$LIB"

# ── 4. back up, then rewrite ───────────────────────────────────────────────────
cp -p "$HTML" "$HTML.cdn-backup"
say "backed up original to $BASE.cdn-backup"

# Match any remote vis-network src and point it at the local file. Uses | as the
# delimiter because the thing being replaced is a URL full of slashes.
sed -i.sedbak -E 's|src="https?://[^"]*vis-network[^"]*"|src="vis-network.min.js"|g' "$HTML"
rm -f "$HTML.sedbak"

# ── 5. verify, rather than assume ──────────────────────────────────────────────
say ""
say "script sources now:"
grep -o 'src="[^"]*"' "$HTML" | sed 's/^/    /'
say ""

if grep -q 'src="https\?://' "$HTML"; then
  say "WARNING: this file still loads something from a URL:"
  grep -o 'src="https\?://[^"]*"' "$HTML" | sed 's/^/    /'
  fail "not self-contained. Vendor the remaining file(s) too."
fi

say "Done. $BASE is self-contained."
say ""
say "Verify it yourself:"
say "    grep -o 'src=\"[^\"]*\"' $BASE      # every result must be a local path"
say "    ls -l vis-network.min.js            # about 700 KB"
say ""
say "Re-run this after every 'graphify update' - rebuilding restores the CDN link."
