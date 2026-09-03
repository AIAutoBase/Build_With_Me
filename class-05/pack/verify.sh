#!/usr/bin/env bash
#
# verify.sh - Class 5 preflight.
#
# The important part of this script is the IMAP APPEND probe. Everything else in the
# class is ordinary n8n work; whether your mail server will let you write a draft into
# a folder is the one thing that cannot be assumed, and it is the thing the second half
# of the hour rests on.
#
# The probe uses python3's imaplib, which is in the standard library - nothing to
# install. It appends a throwaway message, confirms it landed, and DELETES it again.
#
#   export BRAIN_IMAP_HOST=imap.yourprovider.com
#   export BRAIN_IMAP_USER=you@yourprovider.com
#   export BRAIN_IMAP_PASS='...'          # note the quotes
#   bash verify.sh
#
# Those variables are read for the probe and nothing else. Nothing is written to disk.
# Your real credentials live in the n8n credential, and that is where they stay.
#
set -uo pipefail   # deliberately NOT -e: every check should run and report

PASS=0; FAIL=0; WARN=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$*"; PASS=$((PASS+1)); }
no()   { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; FAIL=$((FAIL+1)); }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$*"; WARN=$((WARN+1)); }
head_(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

printf '\nClass 5 preflight - hands and a clock\n'

# ── 1. the stack ───────────────────────────────────────────────────────────────
head_ "1. The stack"

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1; then
  UP=$(docker compose ps --status running 2>/dev/null | tail -n +2 | wc -l)
  if [ "$UP" -gt 0 ]; then ok "$UP container(s) running"; else no "no containers running"; fi
else
  warn "could not read docker compose state - run this beside your compose file"
fi

if command -v python3 >/dev/null 2>&1; then
  ok "python3 present ($(python3 -c 'import sys;print("%d.%d"%sys.version_info[:2])'))"
else
  no "python3 not found - needed for the IMAP probe below (stdlib only, nothing to install)"
fi

# ── 2. the IMAP APPEND probe ───────────────────────────────────────────────────
head_ "2. Can your server accept a draft? (the probe that matters)"

if [ -z "${BRAIN_IMAP_HOST:-}" ] || [ -z "${BRAIN_IMAP_USER:-}" ] || [ -z "${BRAIN_IMAP_PASS:-}" ]; then
  warn "IMAP probe skipped - set these three for one run, then unset them:"
  printf '        export BRAIN_IMAP_HOST=imap.yourprovider.com\n'
  printf '        export BRAIN_IMAP_USER=you@yourprovider.com\n'
  printf "        export BRAIN_IMAP_PASS='...'\n"
  printf '\n        \033[1mDo not skip this.\033[0m The whole second half of the class assumes\n'
  printf '        APPEND works, and "my provider supports IMAP" does not tell you that.\n'
elif ! command -v python3 >/dev/null 2>&1; then
  no "cannot probe without python3"
else
  PROBE_OUT=$(python3 - <<'PYPROBE'
import imaplib, os, sys, email.utils

host = os.environ["BRAIN_IMAP_HOST"]
user = os.environ["BRAIN_IMAP_USER"]
pw   = os.environ["BRAIN_IMAP_PASS"]

def out(tag, msg):
    print("%s|%s" % (tag, msg))

try:
    M = imaplib.IMAP4_SSL(host)
except Exception as e:
    out("FAIL", "cannot connect to %s over SSL: %s" % (host, e))
    sys.exit(0)

try:
    M.login(user, pw)
except Exception as e:
    out("FAIL", "login rejected: %s" % e)
    out("HINT", "some providers need an app-specific password, not your login one")
    sys.exit(0)

out("PASS", "connected and logged in to %s" % host)

# Which folder is Drafts? There is no universal name -- Drafts, INBOX.Drafts, and
# localised variants all exist. Prefer the server's own \Drafts special-use flag,
# which is the only answer that is not a guess.
typ, boxes = M.list()
drafts = None
names  = []
for b in (boxes or []):
    line = b.decode(errors="replace")
    # crude but adequate: the folder name is the last quoted field
    parts = line.split(' "')
    name = parts[-1].strip('"') if len(parts) > 1 else line.split()[-1].strip('"')
    names.append(name)
    if "\\Drafts" in line:
        drafts = name

if drafts:
    out("PASS", "server flags its drafts folder as: %s" % drafts)
else:
    for cand in ("Drafts", "INBOX.Drafts", "[Gmail]/Drafts"):
        if cand in names:
            drafts = cand
            out("WARN", "no \\Drafts flag; guessing by name: %s" % cand)
            break

if not drafts:
    out("FAIL", "could not find a drafts folder. Yours is one of: %s" % ", ".join(names[:12]))
    sys.exit(0)

out("INFO", "FOLDER=%s" % drafts)

msg = (
    "From: %s\r\n"
    "To: %s\r\n"
    "Subject: brain-class-05 probe (safe to delete)\r\n"
    "Date: %s\r\n"
    "Message-ID: <brain-class-05-probe@localhost>\r\n"
    "\r\n"
    "This is a throwaway written by verify.sh to check that APPEND works.\r\n"
    "It deletes itself. If you are reading it, delete it.\r\n"
) % (user, user, email.utils.formatdate(localtime=True))

try:
    # The \\Draft flag is the whole point. Without it the message lands as RECEIVED
    # MAIL - it sits in the folder looking like something a person sent you, and some
    # clients will not even offer to edit it.
    typ, resp = M.append(drafts, "\\Draft", imaplib.Time2Internaldate(email.utils.time.time()),
                         msg.encode("utf-8"))
except Exception as e:
    out("FAIL", "APPEND raised: %s" % e)
    sys.exit(0)

if typ != "OK":
    out("FAIL", "APPEND rejected by the server: %s %s" % (typ, resp))
    out("HINT", "see docs/UPGRADE-gmail-api.md - this class cannot use IMAP on your account")
    sys.exit(0)

out("PASS", "APPEND accepted into %s with the \\Draft flag" % drafts)

# Prove it actually landed, rather than trusting the OK.
try:
    M.select(drafts)
    typ, data = M.search(None, 'HEADER', 'Message-ID', 'brain-class-05-probe@localhost')
    ids = (data[0].split() if data and data[0] else [])
    if ids:
        out("PASS", "the message is really in the folder (found %d)" % len(ids))
        for i in ids:
            M.store(i, "+FLAGS", "\\Deleted")
        M.expunge()
        out("PASS", "probe message deleted again - nothing left behind")
    else:
        out("WARN", "APPEND said OK but the message was not found by search")
        out("HINT", "it may still be there. Check your Drafts folder by hand")
except Exception as e:
    out("WARN", "could not confirm or clean up: %s" % e)

try:
    M.logout()
except Exception:
    pass
PYPROBE
)
  while IFS='|' read -r tag msg; do
    case "$tag" in
      PASS) ok "$msg" ;;
      FAIL) no "$msg" ;;
      WARN) warn "$msg" ;;
      HINT) printf '        %s\n' "$msg" ;;
      INFO) printf '        \033[1m%s\033[0m  <- write this down, P2 needs the exact string\n' "$msg" ;;
    esac
  done <<< "$PROBE_OUT"
fi

# ── 3. is Class 2 writing anything? ────────────────────────────────────────────
head_ "3. Is there anything to summarise?"

printf '  ....  this one you check by hand, because only you know your table name:\n'
printf '\n        docker compose exec -T postgres psql -U brain -d brain \\\n'
printf "          -c 'SELECT COUNT(*), MAX(created_at) FROM <your class 2 table>;'\n\n"
printf '        If the newest row is weeks old, Class 2 has stopped and this class will\n'
printf '        build a digest that reports zero every morning while looking healthy.\n'

# ── 4. timezone ────────────────────────────────────────────────────────────────
head_ "4. Timezone (the quiet one)"

HOSTTZ=$(date +%Z 2>/dev/null || echo "?")
ok "this host thinks it is $HOSTTZ ($(date '+%Y-%m-%d %H:%M'))"

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1; then
  CTZ=$(docker compose exec -T n8n printenv GENERIC_TIMEZONE 2>/dev/null | tr -d '\r')
  if [ -n "$CTZ" ]; then
    ok "n8n GENERIC_TIMEZONE is $CTZ"
    printf '        Confirm that is YOUR timezone. A 7am schedule on a UTC container\n'
    printf '        fires at 2am and looks completely fine from the inside.\n'
  else
    warn "GENERIC_TIMEZONE is not set on the n8n container - it will use UTC"
    printf '        A 7am digest will not arrive at 7am. Set it before you build.\n'
  fi
fi

# ── verdict ────────────────────────────────────────────────────────────────────
printf '\n────────────────────────────────────────\n'
printf '  %d passed, %d failed, %d warnings\n' "$PASS" "$FAIL" "$WARN"

if [ "$FAIL" -eq 0 ]; then
  printf '\n  \033[32mReady.\033[0m'
  if [ -z "${BRAIN_IMAP_HOST:-}" ]; then
    printf '  \033[33m(but you skipped the APPEND probe - do it before class)\033[0m'
  fi
  printf '\n\n'
  exit 0
fi

printf '\n  \033[31mNot ready\033[0m - fix the FAIL lines above.\n'
printf '  TROUBLESHOOT.md has every one of them.\n\n'
exit 1
