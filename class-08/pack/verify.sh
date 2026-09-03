#!/usr/bin/env bash
#
# verify.sh - Class 8 preflight.
#
# The useful part of this script is that it searches your HISTORY, not just your
# working tree. A .env you deleted last week is still in every commit that had
# it, and `git status` will never mention it again.
#
#   bash verify.sh            # check the repo you are standing in
#   bash verify.sh ~/brain    # check a specific one
#
set -uo pipefail

TARGET="${1:-.}"
cd "$TARGET" 2>/dev/null || { printf 'no such folder: %s\n' "$TARGET"; exit 1; }

PASS=0; FAIL=0; WARN=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$*"; PASS=$((PASS+1)); }
no()   { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; FAIL=$((FAIL+1)); }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$*"; WARN=$((WARN+1)); }
head_(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

printf '\nClass 8 preflight - make it a project\n'
printf 'looking at: %s\n' "$(pwd)"

# ── 1. git ────────────────────────────────────────────────────────────────────
head_ "1. git"

if command -v git >/dev/null 2>&1; then
  ok "git present: $(git --version | head -1)"
else
  no "git is not installed"
  printf '        Debian/Ubuntu:  sudo apt install git\n'
  printf '        macOS:          xcode-select --install\n'
fi

if git config user.email >/dev/null 2>&1 && [ -n "$(git config user.email 2>/dev/null)" ]; then
  ok "git knows who you are: $(git config user.name 2>/dev/null) <$(git config user.email)>"
else
  warn "git does not know who you are - your first commit will fail"
  printf '        git config --global user.name  "Your Name"\n'
  printf '        git config --global user.email "you@example.com"\n'
fi

# ── 2. is this a repo yet ─────────────────────────────────────────────────────
head_ "2. This folder"

IS_REPO=0
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  IS_REPO=1
  ROOT=$(git rev-parse --show-toplevel)
  ok "already a git repo: $ROOT"
  COMMITS=$(git rev-list --count --all 2>/dev/null || echo 0)
  printf '        %s commit(s) so far\n' "$COMMITS"
else
  printf '  ....  not a git repo yet - that is what P1 does\n'
  COMMITS=0
fi

FILES=$(find . -maxdepth 2 -type f -not -path './.git/*' 2>/dev/null | wc -l)
if [ "$FILES" -gt 0 ]; then
  ok "$FILES file(s) here to put under version control"
else
  warn "this folder looks empty - are you in the right place?"
fi

# ── 3. .env, in the working tree ──────────────────────────────────────────────
head_ "3. Secrets in the working tree"

if [ -f .env ]; then
  ok ".env exists (good - it should, and it should never be committed)"
  if [ "$IS_REPO" = "1" ] && git ls-files --error-unmatch .env >/dev/null 2>&1; then
    no ".env IS CURRENTLY TRACKED BY GIT"
    printf '        Stop and fix this before your next commit:\n'
    printf '          git rm --cached .env\n'
    printf '          echo ".env" >> .gitignore\n'
    printf '        Then read section 4 below, because the damage may already be done.\n'
  elif [ "$IS_REPO" = "1" ]; then
    ok ".env is not tracked"
  fi
else
  printf '  ....  no .env in this folder\n'
fi

if [ -f .gitignore ]; then
  if grep -qxF ".env" .gitignore 2>/dev/null; then
    ok ".gitignore excludes .env"
  else
    no ".gitignore exists but does NOT have a line that is exactly '.env'"
    printf '        The pack ships gitignore-template. Copy it in.\n'
  fi
else
  if [ "$IS_REPO" = "1" ]; then
    no "no .gitignore at all"
    printf '        cp gitignore-template .gitignore\n'
  else
    printf '  ....  no .gitignore yet - P1 puts one in\n'
  fi
fi

# ── 4. THE ONE THAT MATTERS: secrets in HISTORY ───────────────────────────────
head_ "4. Secrets in history (git status will never tell you this)"

if [ "$IS_REPO" = "0" ] || [ "$COMMITS" = "0" ]; then
  printf '  ....  no history yet - nothing to have leaked into. Best possible answer.\n'
else
  # A file deleted last week is still in every commit that carried it.
  EVER=$(git log --all --full-history --oneline -- .env 2>/dev/null | wc -l)
  if [ "$EVER" -gt 0 ]; then
    no ".env APPEARS IN $EVER COMMIT(S) IN THIS REPO'S HISTORY"
    printf '\n        \033[1mThis is not fixed by deleting the file.\033[0m Every one of those commits\n'
    printf '        still contains it, and so does every copy of this repo.\n\n'
    printf '        The honest fix is to ROTATE what leaked, not to rewrite history:\n'
    printf '          - n8n encryption key: rotating it makes saved credentials\n'
    printf '            unreadable, so re-enter them rather than losing them silently\n'
    printf '          - API keys: revoke and reissue at each provider\n'
    printf '          - the calendar URL from Class 7: reset it\n\n'
    printf '        See TROUBLESHOOT.md. Rewriting history is a bigger job than it looks\n'
    printf '        and it does not help if anyone ever cloned this.\n\n'
    printf '        The commits:\n'
    git log --all --full-history --oneline -- .env 2>/dev/null | head -5 | sed 's/^/          /'
  else
    ok ".env has never been committed"
  fi

  # Key-shaped strings anywhere in history. Cheap, and it catches the case where
  # the secret was pasted into a tracked file rather than living in .env.
  HITS=$(git grep -I -l -E 'sk-or-v1-[A-Za-z0-9]{8}|sk-ant-[A-Za-z0-9-]{8}|sk-proj-[A-Za-z0-9_-]{8}|ghp_[A-Za-z0-9]{20}|AIza[A-Za-z0-9_-]{20}|[0-9]{8,10}:AA[A-Za-z0-9_-]{30}' \
          $(git rev-list --all 2>/dev/null | head -200) 2>/dev/null | awk -F: '{print $2}' | sort -u | head -5)
  if [ -n "$HITS" ]; then
    no "key-shaped strings found in history, in:"
    printf '%s\n' "$HITS" | sed 's/^/          /'
    printf '        Rotate those, then keep them out of tracked files.\n'
  else
    ok "no obvious API keys in the last 200 commits"
  fi
fi

# ── 5. versioning ─────────────────────────────────────────────────────────────
head_ "5. Versioning (P2)"

if [ -f VERSION ]; then
  ok "VERSION present: $(tr -d ' \r\n' < VERSION)"
else
  printf '  ....  no VERSION file - P2 creates it (gcommit --init)\n'
fi

if [ -f CHANGELOG.md ]; then
  ok "CHANGELOG.md present"
  if grep -qF "<!-- CHANGELOG:ENTRIES -->" CHANGELOG.md; then
    ok "it has the insert marker"
  else
    warn "no <!-- CHANGELOG:ENTRIES --> marker"
    printf '        gcommit will insert after the "# Changelog" heading instead, which\n'
    printf '        works. Adding the marker makes the insert point explicit.\n'
  fi
else
  printf '  ....  no CHANGELOG.md - P2 creates it\n'
fi

[ -f README.md ] && ok "README.md present" || printf '  ....  no README.md - P3 writes it\n'

# ── 6. size ───────────────────────────────────────────────────────────────────
head_ "6. Size"

BIG=$(find . -type f -size +10M -not -path './.git/*' 2>/dev/null | head -5)
if [ -n "$BIG" ]; then
  warn "files over 10 MB here - git is bad at these and they are not source:"
  printf '%s\n' "$BIG" | sed 's/^/          /'
  printf '        The shipped gitignore-template already excludes videos and archives.\n'
else
  ok "nothing oversized"
fi

# ── verdict ───────────────────────────────────────────────────────────────────
printf '\n────────────────────────────────────────\n'
printf '  %d passed, %d failed, %d warnings\n' "$PASS" "$FAIL" "$WARN"

if [ "$FAIL" -eq 0 ]; then
  printf '\n  \033[32mReady.\033[0m\n\n'
  exit 0
fi

printf '\n  \033[31mNot ready\033[0m - fix the FAIL lines above.\n'
printf '  TROUBLESHOOT.md has every one of them.\n\n'
exit 1
