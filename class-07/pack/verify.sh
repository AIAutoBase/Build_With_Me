#!/usr/bin/env bash
#
# verify.sh - Class 7 preflight.
#
# The useful part of this script is that it fetches your calendar feed and tells you
# WHAT IS ACTUALLY IN IT - how many events, how many of them repeat, whether they carry
# timezones, whether any are all-day.
#
# Those four facts decide whether your parser is going to quietly lie to you. A feed full
# of RRULEs parsed by something that ignores RRULEs looks empty on a busy Tuesday, and
# every one-off event still shows perfectly.
#
#   export BRAIN_ICAL_URL='https://calendar.google.com/calendar/ical/.../basic.ics'
#   bash verify.sh
#
# The URL is read for this one run. Nothing is written to disk. Your real one lives in an
# n8n credential and that is where it stays.
#
# NOTE THE QUOTES around the URL. Secret calendar addresses routinely contain characters
# your shell will treat as syntax, and the failure looks like an empty variable.
#
set -uo pipefail   # deliberately NOT -e: every check should run and report

PASS=0; FAIL=0; WARN=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$*"; PASS=$((PASS+1)); }
no()   { printf '  \033[31mFAIL\033[0m  %s\n' "$*"; FAIL=$((FAIL+1)); }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$*"; WARN=$((WARN+1)); }
head_(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

printf '\nClass 7 preflight - a clock it can read\n'

# ── 1. the stack ───────────────────────────────────────────────────────────────
head_ "1. The stack"

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1; then
  UP=$(docker compose ps --status running 2>/dev/null | tail -n +2 | wc -l)
  if [ "$UP" -gt 0 ]; then ok "$UP container(s) running"; else no "no containers running"; fi
else
  warn "could not read docker compose state - run this beside your compose file"
fi

command -v curl >/dev/null 2>&1 && ok "curl present" || no "curl not found"

# ── 2. timezone, before anything about "today" ────────────────────────────────
head_ "2. Timezone"

ok "this host: $(date +%Z 2>/dev/null || echo '?')  ($(date '+%Y-%m-%d %H:%M'))"

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1; then
  CTZ=$(docker compose exec -T n8n printenv GENERIC_TIMEZONE 2>/dev/null | tr -d '\r')
  if [ -n "$CTZ" ]; then
    ok "n8n GENERIC_TIMEZONE is $CTZ"
    printf '        Confirm that is YOUR timezone. "What is on today" is a timezone\n'
    printf '        question before it is a calendar question.\n'
  else
    warn "GENERIC_TIMEZONE is not set - n8n will use UTC"
    printf '        Then "today" is the wrong day for part of every day. Set it and\n'
    printf '        RESTART the container - n8n reads env vars only at start.\n'
  fi
fi

# ── 3. the feed itself ─────────────────────────────────────────────────────────
head_ "3. Your calendar feed"

if [ -z "${BRAIN_ICAL_URL:-}" ]; then
  warn "BRAIN_ICAL_URL is not set - skipping the part that matters"
  printf "        export BRAIN_ICAL_URL='<your secret iCal URL>'   # keep the quotes\n"
  printf '        bash verify.sh\n'
  printf '\n        Unset it again afterwards. It is read access to your whole calendar.\n'
else
  TMP=$(mktemp 2>/dev/null || echo "/tmp/ical-probe-$$")
  CODE=$(curl -s -L -o "$TMP" -w "%{http_code}" --max-time 30 "$BRAIN_ICAL_URL" 2>/dev/null)

  if [ "$CODE" != "200" ]; then
    no "the feed returned HTTP $CODE"
    case "$CODE" in
      404) printf '        Address reset, or mistyped.\n' ;;
      401|403) printf '        That looks like the PUBLIC address, which needs the calendar\n        to be public. You want the SECRET one.\n' ;;
      000) printf '        No response at all - check the quotes around the URL.\n' ;;
    esac
  else
    SIZE=$(wc -c < "$TMP")
    if head -1 "$TMP" | grep -q "BEGIN:VCALENDAR"; then
      ok "feed fetched: $SIZE bytes, starts with BEGIN:VCALENDAR"
    else
      no "fetched $SIZE bytes but it is not an iCal feed"
      printf '        First line: %s\n' "$(head -1 "$TMP" | cut -c1-60)"
      printf '        If that looks like HTML, you copied the browser link, not the iCal one.\n'
    fi

    # ── the four facts that decide whether a parser will lie ──────────────────
    # grep -c PRINTS 0 and EXITS 1 when nothing matches, so `|| echo 0` appends a
    # SECOND zero and every later [ ] test dies with "integer expected". Found by
    # running this against a real feed rather than assuming it worked.
    count() { grep -c "$1" "$TMP" 2>/dev/null | head -1 | tr -dc '0-9'; }
    EV=$(count "^BEGIN:VEVENT"); EV=${EV:-0}
    RR=$(count "^RRULE");        RR=${RR:-0}
    TZ=$(count "TZID=");         TZ=${TZ:-0}
    AD=$(count "DTSTART;VALUE=DATE"); AD=${AD:-0}

    if [ "$EV" -gt 0 ]; then ok "$EV event(s) in the feed"; else no "no VEVENT blocks - the feed is empty"; fi

    printf '\n'
    if [ "$RR" -gt 0 ]; then
      warn "$RR of them REPEAT (they carry an RRULE)"
      printf '        \033[1mThis is the number that matters.\033[0m Those are stored ONCE, with a\n'
      printf '        repeat rule - not once per occurrence. A parser that ignores RRULE\n'
      printf '        shows them on the day they first happened, possibly years ago, and\n'
      printf '        today looks emptier than it is.\n'
      printf '        Your one-off events will still look perfect. That is the trap.\n'
    else
      ok "no recurring events in this feed - one less way to be wrong"
    fi

    printf '\n'
    if [ "$AD" -gt 0 ]; then
      warn "$AD all-day event(s) (DTSTART;VALUE=DATE)"
      printf '        All-day events are DATES, not timestamps. Treated as timestamps they\n'
      printf '        land at midnight and sort wrongly against timed events.\n'
    else
      ok "no all-day events"
    fi

    if [ "$TZ" -gt 0 ]; then
      ok "$TZ timezone reference(s) (TZID) - times carry a zone"
    else
      warn "no TZID anywhere - times are UTC (trailing Z) or floating"
      printf '        Floating times have no zone at all and mean "local, wherever you are".\n'
    fi

    printf '\n        Sample of what is in there (titles only):\n'
    grep "^SUMMARY" "$TMP" 2>/dev/null | head -5       | sed -e 's/^SUMMARY;[^:]*:/          /' -e 's/^SUMMARY:/          /' | cut -c1-78
  fi
  rm -f "$TMP" 2>/dev/null || true
fi

# ── 4. what P2 needs ───────────────────────────────────────────────────────────
head_ "4. Documents with dates in them (for P2)"

printf '  ....  check this by hand - only you know your table name:\n\n'
printf '        docker compose exec -T postgres psql -U brain -d brain \\\n'
printf "          -c \"SELECT source, COUNT(*) FROM kb GROUP BY source;\"\n\n"
printf '        P2 extracts dates from these documents. A knowledge base with no dates\n'
printf '        in it has nothing to propose - a lease, a warranty or an invoice with\n'
printf '        terms is what you want in there.\n'

# ── verdict ────────────────────────────────────────────────────────────────────
printf '\n────────────────────────────────────────\n'
printf '  %d passed, %d failed, %d warnings\n' "$PASS" "$FAIL" "$WARN"

if [ "$FAIL" -eq 0 ]; then
  printf '\n  \033[32mReady.\033[0m'
  [ -z "${BRAIN_ICAL_URL:-}" ] && printf '  \033[33m(but you skipped the feed check - do it before class)\033[0m'
  printf '\n\n'
  [ -n "${BRAIN_ICAL_URL:-}" ] && printf '  Now unset it:  unset BRAIN_ICAL_URL\n\n'
  exit 0
fi

printf '\n  \033[31mNot ready\033[0m - fix the FAIL lines above.\n'
printf '  TROUBLESHOOT.md has every one of them.\n\n'
exit 1
