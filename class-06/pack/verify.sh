#!/usr/bin/env bash
#
# verify.sh - Class 6 preflight.
#
# Prints "Ready" or names exactly what is missing. Run it before the class and again
# if something stops working.
#
# Every check here can actually FAIL. That is the point, and it is the lesson this
# class keeps coming back to - `python3 -c "import venv"` passes on a box where venv
# creation is broken, so this script probes for real instead.
#
#   bash verify.sh
#
set -uo pipefail   # deliberately NOT -e: we want every check to run and report

PASS=0
FAIL=0
WARN=0

ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$*"; PASS=$((PASS+1)); }
no()   { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; FAIL=$((FAIL+1)); }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$*"; WARN=$((WARN+1)); }
head_() { printf '\n\033[1m%s\033[0m\n' "$*"; }

printf '\nClass 6 preflight - see what your brain knows\n'

# ── 1. Python ──────────────────────────────────────────────────────────────────
head_ "1. Python"

if command -v python3 >/dev/null 2>&1; then
  PYV=$(python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || echo "?")
  if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)' 2>/dev/null; then
    ok "python3 is $PYV (needs 3.10+)"
  else
    no "python3 is $PYV - graphify needs 3.10 or newer"
  fi
else
  no "python3 not found"
fi

# ── 2. venv, probed for real ───────────────────────────────────────────────────
head_ "2. Virtual environments"

# NOT `python3 -c "import venv"`. That prints ok on a box where creation fails,
# because what is missing is ensurepip and importing venv never touches it.
#
# Check for pip under bin/ (POSIX) OR Scripts/ (Windows) - a member running this in
# Git Bash on Windows has a perfectly good venv with pip in the other place, and
# failing them for it would be a false alarm about the one check that matters most.
PROBE=$(mktemp -d 2>/dev/null || echo /tmp/gv-probe-$$)
if python3 -m venv "$PROBE/v" >/dev/null 2>&1 &&
   { [ -x "$PROBE/v/bin/pip" ] || [ -f "$PROBE/v/bin/pip" ] ||
     [ -f "$PROBE/v/Scripts/pip.exe" ] || [ -f "$PROBE/v/Scripts/pip" ]; }; then
  ok "venv creation works, and pip lands inside it"
else
  no "venv creation failed, or pip did not land inside it
        On Debian: sudo apt install -y python3-venv
        The missing piece is usually ensurepip, not venv itself."
fi
rm -rf "$PROBE" 2>/dev/null || true

# ── 3. graphify ────────────────────────────────────────────────────────────────
head_ "3. graphify"

if command -v graphify >/dev/null 2>&1; then
  GV=$(graphify --version 2>&1 | head -1)
  ok "graphify present: $GV"
  case "$GV" in
    *0.9.49*) : ;;
    *) warn "this pack was measured against 0.9.49 - yours differs, re-check the notes" ;;
  esac
else
  if [ -n "${VIRTUAL_ENV:-}" ]; then
    no "graphify not found, though a venv IS active ($VIRTUAL_ENV) - run: pip install graphifyy"
  else
    no "graphify not found and NO venv is active - run: source ~/brain/.graphify-venv/bin/activate"
  fi
fi

if command -v graphify-mcp >/dev/null 2>&1; then
  ok "graphify-mcp present ($(command -v graphify-mcp))"
else
  warn "graphify-mcp not on PATH - needed for P4 only"
fi

# ── 4. the engine that names the graph ─────────────────────────────────────────
head_ "4. Claude Code (the naming backend)"

if command -v claude >/dev/null 2>&1; then
  ok "claude present: $(claude --version 2>&1 | head -1)"
  if timeout 60 claude -p "reply with the single word: ready" >/dev/null 2>&1; then
    ok "claude answers - signed in"
  else
    no "claude did not answer - sign in, or it cannot name your communities"
  fi
else
  no "claude not found - this is the free backend the class uses"
fi

# ── 5. the cost trap ───────────────────────────────────────────────────────────
head_ "5. Which backend will be used"

LEAK=""
for v in OPENAI_API_KEY ANTHROPIC_API_KEY GEMINI_API_KEY DEEPSEEK_API_KEY; do
  if [ -n "$(eval echo "\${$v:-}")" ]; then LEAK="$LEAK $v"; fi
done

if [ -n "$LEAK" ]; then
  warn "these are exported:$LEAK"
  printf '        graphify auto-detects gemini -> kimi -> claude -> openai -> ...\n'
  printf '        claude-cli is NOT in that list and is never auto-selected.\n'
  printf '        \033[1mAlways pass --backend=claude-cli explicitly, or you pay.\033[0m\n'
  printf '        Free and paid look identical on screen.\n'
else
  ok "no model API keys exported - auto-detection has nothing paid to find"
fi

# ── 6. Class 3, which this draws a picture of ──────────────────────────────────
head_ "6. Your brain has something in it"

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1; then
  UP=$(docker compose ps --status running 2>/dev/null | tail -n +2 | wc -l)
  if [ "$UP" -gt 0 ]; then ok "$UP container(s) running"; else warn "no containers running"; fi
else
  warn "could not read docker compose state from here - run this beside your compose file"
fi

DOCS=$(find . ~/brain -maxdepth 4 -type f \( -name '*.md' -o -name '*.txt' \) 2>/dev/null \
       | grep -viE 'readme|prework|verify|troubleshoot|attribution|node_modules|\.git/' | wc -l)
if [ "$DOCS" -ge 4 ]; then
  ok "found roughly $DOCS candidate documents to graph"
else
  warn "only about $DOCS documents found - a thin corpus makes a thin graph"
  printf '        Feed Class 3 some real documents first, or the picture teaches nothing.\n'
fi

# ── 7. is the graph self-contained? ────────────────────────────────────────────
head_ "7. If you already built a graph"

GRAPH=$(find . ~/brain -maxdepth 5 -name 'graph.html' 2>/dev/null | head -1)
if [ -n "$GRAPH" ]; then
  ok "graph.html found: $GRAPH"
  if grep -q 'src="https\?://' "$GRAPH" 2>/dev/null; then
    no "it still loads scripts from the internet - run: bash vendor-vis.sh $GRAPH"
  else
    ok "no remote scripts - it is self-contained"
  fi
  LIBF="$(dirname "$GRAPH")/vis-network.min.js"
  if [ -f "$LIBF" ]; then
    SZ=$(wc -c < "$LIBF")
    if [ "$SZ" -gt 100000 ]; then
      ok "vendored vis-network is $SZ bytes"
    else
      no "vis-network.min.js is only $SZ bytes - that is an error page, not a library"
    fi
  fi
else
  printf '  ....  no graph yet - that is what P2 builds\n'
fi

# ── verdict ────────────────────────────────────────────────────────────────────
printf '\n────────────────────────────────────────\n'
printf '  %d passed, %d failed, %d warnings\n' "$PASS" "$FAIL" "$WARN"

if [ "$FAIL" -eq 0 ]; then
  printf '\n  \033[32mReady.\033[0m\n\n'
  exit 0
fi

printf '\n  \033[31mNot ready\033[0m - fix the FAIL lines above.\n'
printf '  TROUBLESHOOT.md has every one of them.\n\n'
exit 1
