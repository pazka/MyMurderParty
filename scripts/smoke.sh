#!/usr/bin/env bash
# Container smoke test (upgrade safety net, see TESTING.md). Runs the BUILT image in one of the two ways the
# box runs it, and checks real capability:
#   legacy   (default) exactly the box's legacy compose (docker-compose.legacy.yml): ENV=PROD, uid 1000,
#            read-only rootfs, tmpfs /tmp, cap_drop ALL, no-new-privileges, restart always, container port 80.
#   template the hosh-deploy compose itself (docker-compose.example.yml + .env.example, image swapped for
#            IMAGE): uid 10001, read-only, tmpfs, cap_drop ALL, no-new-privileges, pids/mem limits, PORT=8000
#            published on BIND of deploy/hosh-deploy.conf; first runs the box's `hosh-deploy register` checks
#            (scripts/register-check.sh) and, after the checks, the conf's POST_DEPLOY inside the container.
# Checks: front, REST, PROD session cookie, /healthz, Socket.IO handshake, read-only smoke (Back/ops/smoke.js,
# the POST_DEPLOY), a whole two-player party driven over Socket.IO by Back/test/container-flow.js (run with
# the image's own node), the container's health status, and that a restart starts from an empty server
# (state is in memory).
#
#   docker build -t mymurderparty:smoke . && bash scripts/smoke.sh mymurderparty:smoke [legacy|template]
set -euo pipefail

IMAGE="${1:-mymurderparty:smoke}"
MODE="${2:-legacy}"
TMP="$(mktemp -d)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
conf() { sed -n "s/^$1=//p" "$ROOT/deploy/hosh-deploy.conf"; }

dk() { MSYS_NO_PATHCONV=1 docker "$@"; }  # Git Bash on Windows rewrites /paths in args
fail() { echo "SMOKE FAIL ($MODE): $*" >&2; exit 1; }
step() { echo "== [$MODE] $*"; }
code() { # code <expected> <curl args...>   body saved to $TMP/body
  local want="$1"; shift
  local got
  got="$(curl -sS -o "$TMP/body" -w '%{http_code}' "$@")"
  [ "$got" = "$want" ] || { head -c 300 "$TMP/body" >&2; echo >&2; fail "expected $want got $got for: $*"; }
}

case "$MODE" in
  legacy)
    NAME="mmp-smoke-$$"
    PORT="${SMOKE_PORT:-18674}"
    UID_WANT=1000
    INNER=80
    ;;
  template)
    NAME="$(conf SERVICE)"
    PORT="$(conf BIND)"; PORT="${PORT##*:}"
    UID_WANT=10001
    INNER=8000
    SRV="$TMP/srv"     # stands for /srv/<app> on the box
    mkdir -p "$SRV/deploy"
    cp "$ROOT/docker-compose.example.yml" "$ROOT/.env.example" "$SRV/"
    cp "$ROOT/deploy/hosh-deploy.conf" "$ROOT/deploy/traefik-route.yml.tmpl" "$SRV/deploy/"
    ENVF="$SRV/$(conf ENV_FILE)"
    # what the box does: install -m 600 .env.example <app>.env; hosh-deploy then rewrites only the image line
    install -m 600 "$ROOT/.env.example" "$ENVF"
    sed -i "s|^$(conf IMAGE_VAR)=.*|$(conf IMAGE_VAR)='$IMAGE'|" "$ENVF"
    compose() { dk compose --project-directory "$SRV" --env-file "$ENVF" -f "$SRV/docker-compose.yml" "$@"; }
    ;;
  *) fail "mode must be legacy or template" ;;
esac
BASE="http://127.0.0.1:${PORT}"

cleanup() {
  cd /
  if [ "${SMOKE_OK:-0}" != 1 ]; then echo "---- container log ----"; dk logs "$NAME" 2>&1 | tail -n 40 || true; fi
  if [ "$MODE" = template ]; then compose down -v >/dev/null 2>&1 || true; fi
  dk rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

wait_up() {
  for _ in $(seq 1 60); do
    curl -fsS -o /dev/null "$BASE/info" 2>/dev/null && return 0
    [ "$(dk inspect --format '{{.State.Running}}' "$NAME" 2>/dev/null)" = true ] || fail "container not running"
    sleep 1
  done
  fail "server not answering on $BASE"
}

if [ "$MODE" = legacy ]; then
  step "start $IMAGE like the legacy compose (ENV=PROD, uid 1000, read-only, tmpfs /tmp, cap_drop ALL, no-new-privileges, :80)"
  dk run -d --name "$NAME" --user 1000:1000 --read-only --tmpfs /tmp --cap-drop ALL \
    --security-opt no-new-privileges:true --restart always -e ENV=PROD -p "127.0.0.1:${PORT}:80" "$IMAGE" >/dev/null
else
  step "hosh-deploy register checks on the template compose"
  bash "$ROOT/scripts/register-check.sh" "$SRV"
  step "start $IMAGE with docker-compose.example.yml (uid 10001, PORT=8000, $(conf BIND))"
  compose up -d --pull never --quiet-pull 2>&1 | tail -n 3
fi
wait_up
dk logs "$NAME" 2>&1 | grep -q "Server is Fire at http://0.0.0.0:$INNER" || fail "startup line (0.0.0.0:$INNER) missing"

step "runs as uid $UID_WANT, read-only rootfs, no capabilities"
[ "$(dk exec "$NAME" node -e 'process.stdout.write(String(process.getuid()))')" = "$UID_WANT" ] || fail "uid"
[ "$(dk inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$NAME")" = true ] || fail "rootfs writable"
if dk exec "$NAME" node -e 'require("fs").writeFileSync("/app/x", "x")' 2>/dev/null; then fail "wrote to /app"; fi
dk exec "$NAME" grep -q '^CapEff:[[:space:]]*0*$' /proc/1/status || fail "capabilities left"

step "front (Vite build in public/)"
code 200 "$BASE/"
grep -q '<div id="root">' "$TMP/body" || fail "front index not served"

step "REST"
code 200 "$BASE/info"
grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' "$TMP/body" || fail "/info: $(cat "$TMP/body")"
VERSION="$(cat "$TMP/body")"
code 200 "$BASE/users"
[ "$(cat "$TMP/body")" = "[]" ] || fail "/users not empty on a fresh start"
code 200 "$BASE/rooms"
[ "$(cat "$TMP/body")" = "[]" ] || fail "/rooms not empty on a fresh start"
code 302 "$BASE/no/such/page"

step "/healthz"
code 200 "$BASE/healthz"
python3 -c 'import json,sys; h=json.load(open(sys.argv[1])); assert h=={"status":"ok","version":sys.argv[2],"users":0,"rooms":0,"sockets":0}, h' \
  "$TMP/body" "$VERSION" || fail "/healthz: $(cat "$TMP/body")"
dk exec "$NAME" node /app/ops/healthcheck.js || fail "image healthcheck command"

step "PROD session cookie"
curl -sS -D "$TMP/h" -o "$TMP/body" "$BASE/session" >/dev/null
grep -Eq '^[A-Z]{3}-[0-9]{3}$' "$TMP/body" || fail "session id format: $(cat "$TMP/body")"
grep -qi '^set-cookie: sessionId=.*Domain=.hosh.it.*HttpOnly.*Secure.*SameSite=Strict' "$TMP/h" \
  || fail "PROD cookie flags: $(grep -i set-cookie "$TMP/h")"

step "Socket.IO handshake"
code 200 "$BASE/socket.io/?EIO=4&transport=polling"
grep -q '"sid"' "$TMP/body" || fail "no engine.io sid"

if [ "$MODE" = template ]; then
  step "POST_DEPLOY inside the container, as hosh-deploy runs it (argv, no shell): $(conf POST_DEPLOY)"
  read -r -a argv <<< "$(conf POST_DEPLOY)"
  dk exec "$NAME" "${argv[@]}" || fail "POST_DEPLOY"
else
  step "read-only smoke (ops/smoke.js) inside the container"
  dk exec "$NAME" node /app/ops/smoke.js "http://127.0.0.1:$INNER" || fail "ops/smoke.js"
fi
code 200 "$BASE/users"
[ "$(cat "$TMP/body")" = "[]" ] || fail "the read-only smoke created a user"

step "a whole party over Socket.IO (2 players, room, character, objects, message; then cleaned up)"
flow() { dk run --rm --network host --read-only --cap-drop ALL --security-opt no-new-privileges:true \
  -v "$ROOT/Back/test:/t:ro" --entrypoint node "$IMAGE" /t/container-flow.js "$BASE" "$@"; }
flow play || fail "party flow"

step "no crash in logs"
if dk logs "$NAME" 2>&1 | grep -E 'TypeError|UnhandledPromiseRejection|Uncaught'; then fail "errors in container log"; fi

step "container health status (image HEALTHCHECK / compose healthcheck)"
for _ in $(seq 1 60); do
  h="$(dk inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$NAME")"
  [ "$h" = healthy ] && break
  [ "$h" = unhealthy ] || [ "$h" = none ] && fail "health: $h"
  sleep 1
done
[ "$h" = healthy ] || fail "not healthy after 60 s ($h)"

step "restart: the server comes back empty (state in memory)"
flow keep || fail "could not leave a room before the restart"
dk restart "$NAME" >/dev/null
wait_up
flow empty || fail "state survived a restart"

SMOKE_OK=1
echo "SMOKE OK ($MODE, $IMAGE)"
