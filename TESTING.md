# Testing

Safety net for upgrades (Node base image, Express / Socket.IO / TypeScript, CRA front, Actions): it pins
what the game server does today so a Dependabot PR is judged on its CI run.

## What ships

One image: `Back/` compiled with `tsc` into `Back/dist/` (run as `node index.js`), `Front/` (CRA 5) built
into `dist/public/`. Production config = `ENV=PROD` (docker-compose.yml). All game state is **in memory**.

## Run it

```bash
# back tests: black-box, spawn the built server twice (ENV=DEV on localhost:8001, ENV=PROD on :80)
docker run --rm -v "$PWD/Back":/src:ro node:20-slim sh -c \
  'mkdir /a && cd /src && tar --exclude=./node_modules --exclude=./.env -cf - . | tar -xf - -C /a && cd /a \
   && npm ci && npm run build && node --test --test-reporter=spec test/server.test.js'

# container smoke (hardened: uid 1000, read-only rootfs, cap_drop ALL)
docker build -t mymurderparty:smoke . && bash scripts/smoke.sh mymurderparty:smoke

# next base before Dependabot's PR lands
sed 's/node:20-slim/node:26-slim/g' Dockerfile | docker build -f - -t mymurderparty:next .
```

(Windows Git Bash: prefix `docker run` with `MSYS_NO_PATHCONV=1`, mount `"$(cygpath -w "$PWD/Back")"`.)

## CI (`.github/workflows/ci.yml`)

PRs, `main`, `agent/**`: `back tests (node 20|26)` (npm ci, tsc build, tests) and `container smoke` (builds
the real Dockerfile, front included).

## What is covered

`Back/test/server.test.js` (7 tests, Node built-ins only; `test/sio-poll.js` is a tiny Socket.IO
long-polling client on `fetch`): `/info`, `/session` id format and cookie flags (DEV and PROD), redirect of
unknown routes, login rules and `you-are` / `new-user` events, reconnect with the session cookie, the full
room flow as the front drives it (create-and-join, unique name, password, users list, character choice and
conflict, shared objects, room broadcast and history, delete with password), and the quirks below.

`scripts/smoke.sh`: the built image with `ENV=PROD`, hardened — front served, REST, PROD cookie flags,
engine.io handshake, no crash in the logs.

## Upgrades checked (2026-10-19)

- **Node 20 → 26** (Dependabot #4): back 7/7 on 26.12, image (incl. CRA front build) builds on
  `node:26-slim`, hardened smoke OK → **go**.

## Known issues (pinned, not changed)

- **`GET /users` returns every user with their `sessionId`**: anyone can take over any player's session.
- `GET /rooms` and the `all-rooms` broadcast include **room passwords in clear**.
- PROD CORS uses the key `origins` (the `cors` package and Socket.IO read `origin`), so the allow-list is
  not applied.
- State is in memory: a restart or redeploy ends every game.
- `createNewRoom` trusts the client's room shape: a room created without `roomHistory` cannot be joined
  (`reading 'push'`). The front always sends it.
- `userLeaveAllRooms` compares `userId === userId` (shadowed variable): on logout the first character of
  every room is released.
- `Back/dist/` is committed but the image rebuilds it; `Back/.env` is tracked in git (not read by this
  work; now kept out of the Docker build context).
- Image runs as root by default (it works as uid 1000, see the smoke); no HEALTHCHECK.
