#!/usr/bin/env bash
# Run SQL (from stdin) against the brain database inside a WSL rec distro.
#
# WSL shuts idle distros down and takes the containers with them, so bring the
# stack up and wait on pg_isready rather than assuming it is there.
# stdin is captured first: docker compose exec inherits it and would eat the SQL.
set -u
cat > /tmp/_q.sql
DC="sudo docker compose -f $HOME/brain/docker-compose.yml"
$DC up -d >/dev/null 2>&1 </dev/null
for i in $(seq 1 60); do
  if $DC exec -T postgres pg_isready -U brain -d brain >/dev/null 2>&1 </dev/null; then
    break
  fi
  sleep 2
done
exec $DC exec -T postgres psql -U brain -d brain -v ON_ERROR_STOP=1 -t -A -F "|" -f - < /tmp/_q.sql
