#!/usr/bin/env bash
# Visual regression of the built image (hosh-management AGENTS.md §3, use cases in TESTING.md
# "Visual use cases"). Pattern of pazka/plats visual/, runner as scripts/browser-smoke.sh:
#   visual/run.sh [IMAGE]                (default mymurderparty:smoke)
# Starts the image hardened (uid 10001, read-only rootfs, tmpfs /tmp, cap_drop ALL, no-new-privileges) with
# ENV=STAGING on http://dev.localhost:9874 (the front's STAGING origin, Front/src/services/config.ts), starts
# two headless Chromes on the runner (mouse / touch) where every other host name resolves to nothing, then
# runs visual/shoot.mjs with the image's own node (built-in fetch + WebSocket, no package installed): every
# use case at 1400 / 1024 / 390, compared with visual/baseline/. Shots, diffs and report.json: $OUT.
#   CHROME=/path/to/chrome (default google-chrome)   OUT=visual/out   VISUAL_PRINT_NEW=1 (CI: failing
#   shots printed in the log, visual/from-log.mjs writes them back as files).
# New baselines (QA, in a PR that says the change is wanted): take them from the CI log of the runner's
# Chrome with visual/from-log.mjs, look at every picture, commit them.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
IMAGE="${1:-mymurderparty:smoke}"
OUT="${OUT:-visual/out}"
NAME="mmp-visual-$$"
PORT=9874
CDP_DESKTOP=9341
CDP_PHONE=9342
P1="$(mktemp -d)"; P2="$(mktemp -d)"
PIDS=()
dk() { MSYS_NO_PATHCONV=1 docker "$@"; }
cleanup() {
  for p in "${PIDS[@]}"; do kill "$p" 2>/dev/null || true; done
  dk rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$P1" "$P2"
}
trap cleanup EXIT

dk run -d --name "$NAME" \
  --user 10001:10001 --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  -e ENV=STAGING -e PORT=8000 -p "127.0.0.1:$PORT:8000" "$IMAGE" >/dev/null
for _ in $(seq 1 60); do
  curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1 && break
  sleep 0.5
done
curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null || { dk logs "$NAME" | tail -40; exit 1; }
test "$(dk exec "$NAME" id -u)" = 10001

RULES="MAP dev.localhost 127.0.0.1, MAP localhost 127.0.0.1, MAP * ~NOTFOUND"  # = visual/cdp.mjs RESOLVER_RULES
COMMON=(--headless=new --no-sandbox --disable-gpu --mute-audio --no-first-run --hide-scrollbars
  --force-color-profile=srgb --font-render-hinting=none --disable-features=Translate,MediaRouter
  --disable-background-networking "--host-resolver-rules=$RULES")
"${CHROME:-google-chrome}" "${COMMON[@]}" \
  --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 \
  --remote-debugging-port=$CDP_DESKTOP --user-data-dir="$P1" about:blank >/dev/null 2>&1 &
PIDS+=($!)
"${CHROME:-google-chrome}" "${COMMON[@]}" \
  --remote-debugging-port=$CDP_PHONE --user-data-dir="$P2" about:blank >/dev/null 2>&1 &
PIDS+=($!)

rm -rf "$OUT"; mkdir -p "$OUT"; chmod 777 "$OUT"
set +e
dk run --rm --network host --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges \
  -e CDP_DESKTOP=$CDP_DESKTOP -e CDP_PHONE=$CDP_PHONE -e OUT=/out -e BASELINE=/v/baseline/ \
  -e VISUAL_PRINT_NEW="${VISUAL_PRINT_NEW:-}" \
  -v "$ROOT/visual:/v:ro" -v "$ROOT/$OUT:/out" --entrypoint node "$IMAGE" \
  /v/shoot.mjs "http://dev.localhost:$PORT" "$@"
rc=$?
set -e
dk logs "$NAME" 2>&1 | grep -qiE 'unhandled|TypeError|ReferenceError' && { echo "VISUAL FAIL: server logged an error" >&2; rc=1; }
exit $rc
