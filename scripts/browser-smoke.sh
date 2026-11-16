#!/usr/bin/env bash
# Browser test of the built front (client-side navigation), see scripts/browser-flow.mjs and TESTING.md.
# Runs the BUILT image hardened (uid 10001, read-only rootfs, tmpfs /tmp, cap_drop ALL, no-new-privileges)
# with ENV=STAGING, so the front talks to the page's own origin http://dev.localhost:9874 and never to
# https://murder.hosh.it (Front/src/services/config.ts picks the server from the host name). Chrome is the
# runner's google-chrome, started with every other host name resolving to nothing; the test runs with the
# image's own node (built-in fetch + WebSocket, no package installed).
#
#   docker build -t mymurderparty:smoke . && bash scripts/browser-smoke.sh mymurderparty:smoke
set -euo pipefail

IMAGE="${1:-mymurderparty:smoke}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="mmp-browser-$$"
PORT=9874            # the STAGING origin of both configs (Back and Front): http://dev.localhost:9874
CDP_PORT=9339
PROFILE="$(mktemp -d)"
CHROME_PID=""

dk() { MSYS_NO_PATHCONV=1 docker "$@"; }
cleanup() {
  [ -n "$CHROME_PID" ] && kill "$CHROME_PID" 2>/dev/null || true
  dk rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$PROFILE"
}
trap cleanup EXIT
fail() { echo "BROWSER SMOKE FAIL: $*" >&2; dk logs "$NAME" 2>&1 | tail -40 >&2 || true; exit 1; }

echo "== start $IMAGE (ENV=STAGING, hardened) on 127.0.0.1:$PORT"
dk run -d --name "$NAME" \
  --user 10001:10001 --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  -e ENV=STAGING -e PORT=8000 -p "127.0.0.1:$PORT:8000" "$IMAGE" >/dev/null
for _ in $(seq 1 60); do
  curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1 && break
  sleep 0.5
done
curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null || fail "server did not answer /healthz"

echo "== start Chrome (every host but dev.localhost/localhost resolves to nothing)"
"${CHROME:-google-chrome}" --headless=new --no-sandbox --disable-gpu --mute-audio --no-first-run \
  --remote-debugging-port="$CDP_PORT" --user-data-dir="$PROFILE" \
  "--host-resolver-rules=MAP dev.localhost 127.0.0.1, MAP localhost 127.0.0.1, MAP * ~NOTFOUND" \
  about:blank >/dev/null 2>&1 &
CHROME_PID=$!

echo "== browser flow (image's own node)"
dk run --rm --network host --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges \
  -e CDP_PORT="$CDP_PORT" -v "$ROOT/scripts:/s:ro" --entrypoint node "$IMAGE" \
  /s/browser-flow.mjs "http://dev.localhost:$PORT/" || fail "browser flow"

dk logs "$NAME" 2>&1 | grep -qiE 'unhandled|TypeError|ReferenceError' && fail "server logged an error" || true
echo "browser smoke OK"
