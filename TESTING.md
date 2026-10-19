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

## Changes and upgrades (2026-10-19)

- **Node 26**: Dockerfile on `node:26-slim` (supersedes Dependabot #4); back 10/10 and hardened smoke on
  Node 20 and 26.
- **No session ids or room passwords leave the server.** Users sent to other people (`/users`,
  `all-users`, `new-user`, room members and characters, event senders) are `{id, name, lastActivity}`;
  rooms (`/rooms`, `all-rooms`, `update-room`) have no `password`. Only `you-are` (your own user) still
  carries your `sessionId`. Code: `Back/services/publicView.ts`.
- Rooms are built from `name`, `password`, `gameConfigName` only; `roomHistory` is initialised by the
  server (a client could inject members/characters or omit the history before).
- A missing join/delete password counts as `""` (rooms are created with an empty one and joined by code).
- CORS: the config key is `origin` (was `origins`, so no allow-list applied); PROD allows
  `https://murder.hosh.it` only.
- Logout releases only the leaving player's character (a shadowed variable released the first character of
  every room).
- `Back/.env` replaced by `Back/.env.example` (dev values only; `.env` is git-ignored).

Each change has a test that fails on the old code (checked: 6 failures on `main` before the fix).

## Known issues (kept)

- State is in memory: a restart or redeploy ends every game.
- `/test` (cheat page: all users, all rooms, delete) is routed in production.
- `Back/dist/` is committed but the image rebuilds it.
- Image runs as root by default (it works as uid 1000, see the smoke); no HEALTHCHECK.
