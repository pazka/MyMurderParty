#!/usr/bin/env bash
# Container smoke test (upgrade safety net, see TESTING.md).
# Runs the BUILT image with ENV=PROD like docker-compose.yml, hardened (non-root, read-only rootfs,
# cap_drop ALL, no-new-privileges: the app keeps its state in memory), and checks the front, the REST
# endpoints, the PROD session cookie, the Socket.IO handshake, a whole two-player party driven over
# Socket.IO by Back/test/container-flow.js (run with the image's own node), and that a container restart
# starts from an empty server (state is in memory).
#
#   docker build -t mymurderparty:smoke . && bash scripts/smoke.sh mymurderparty:smoke
set -euo pipefail

IMAGE="${1:-mymurderparty:smoke}"
NAME="mmp-smoke-$$"
PORT="${SMOKE_PORT:-18674}"
BASE="http://127.0.0.1:${PORT}"
TMP="$(mktemp -d)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

dk() { MSYS_NO_PATHCONV=1 docker "$@"; }  # Git Bash on Windows rewrites /paths in args
cleanup() {
  cd /
  if [ "${SMOKE_OK:-0}" != 1 ]; then echo "---- container log ----"; dk logs "$NAME" 2>&1 | tail -n 40 || true; fi
  dk rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT
fail() { echo "SMOKE FAIL: $*" >&2; exit 1; }
step() { echo "== $*"; }
code() { # code <expected> <curl args...>   body saved to $TMP/body
  local want="$1"; shift
  local got
  got="$(curl -sS -o "$TMP/body" -w '%{http_code}' "$@")"
  [ "$got" = "$want" ] || { head -c 300 "$TMP/body" >&2; echo >&2; fail "expected $want got $got for: $*"; }
}

step "start $IMAGE (ENV=PROD, uid 1000, read-only rootfs, cap_drop ALL, no-new-privileges)"
# exactly the box's legacy compose (/root/hosh-deploy/murder: user 1000:1000, read_only, tmpfs /tmp,
# no-new-privileges, cap_drop ALL, restart always, 127.0.0.1:9674:80, ENV=PROD)
dk run -d --name "$NAME" --user 1000:1000 --read-only --tmpfs /tmp --cap-drop ALL \
  --security-opt no-new-privileges:true --restart always -e ENV=PROD -p "127.0.0.1:${PORT}:80" "$IMAGE" >/dev/null
wait_up() {
  for _ in $(seq 1 60); do
    curl -fsS -o /dev/null "$BASE/info" 2>/dev/null && return 0
    [ "$(dk inspect --format '{{.State.Running}}' "$NAME")" = true ] || fail "container exited"
    sleep 1
  done
  fail "server not answering on $BASE"
}
wait_up
dk logs "$NAME" 2>&1 | grep -q 'Server is Fire at http://0.0.0.0:80' || fail "startup line (0.0.0.0:80) missing"

step "front (Vite build in public/)"
code 200 "$BASE/"
grep -q '<div id="root">' "$TMP/body" || fail "front index not served"

step "REST"
code 200 "$BASE/info"
grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' "$TMP/body" || fail "/info: $(cat "$TMP/body")"
code 200 "$BASE/users"
[ "$(cat "$TMP/body")" = "[]" ] || fail "/users not empty on a fresh start"
code 200 "$BASE/rooms"
[ "$(cat "$TMP/body")" = "[]" ] || fail "/rooms not empty on a fresh start"
code 302 "$BASE/no/such/page"

step "PROD session cookie"
curl -sS -D "$TMP/h" -o "$TMP/body" "$BASE/session" >/dev/null
grep -Eq '^[A-Z]{3}-[0-9]{3}$' "$TMP/body" || fail "session id format: $(cat "$TMP/body")"
grep -qi '^set-cookie: sessionId=.*Domain=.hosh.it.*HttpOnly.*Secure.*SameSite=Strict' "$TMP/h" \
  || fail "PROD cookie flags: $(grep -i set-cookie "$TMP/h")"

step "Socket.IO handshake"
code 200 "$BASE/socket.io/?EIO=4&transport=polling"
grep -q '"sid"' "$TMP/body" || fail "no engine.io sid"

step "a whole party over Socket.IO (2 players, room, character, objects, message; then cleaned up)"
flow() { dk run --rm --network host --read-only --cap-drop ALL --security-opt no-new-privileges:true \
  -v "$ROOT/Back/test:/t:ro" --entrypoint node "$IMAGE" /t/container-flow.js "$BASE" "$@"; }
flow play || fail "party flow"

step "no crash in logs"
if dk logs "$NAME" 2>&1 | grep -E 'TypeError|UnhandledPromiseRejection|Uncaught'; then fail "errors in container log"; fi

step "restart: the server comes back empty (state in memory)"
flow keep || fail "could not leave a room before the restart"
dk restart "$NAME" >/dev/null
wait_up
flow empty || fail "state survived a restart"

SMOKE_OK=1
echo "SMOKE OK ($IMAGE)"
