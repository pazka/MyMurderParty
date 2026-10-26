# Testing

Safety net for upgrades (Node base image, Express / Socket.IO / TypeScript, Vite front, Actions): it pins
what the game server does today so a Dependabot PR is judged on its CI run.

## What ships

One image: `Back/` compiled with `tsc` into `Back/dist/` (run as `node index.js`), `Front/` (Vite + React, `tsc` type check) built
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

`Back/test/server.test.js` (12 tests, Node built-ins only; `test/sio-poll.js` is a tiny Socket.IO
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

## Dependency majors (2026-10-19, branch `agent/deps-majors`)

- **cookie 0.5 → 2** (#11): ESM-only, `parseCookie` / `stringifySetCookie`, no default export. Parsing goes
  through `Back/services/cookies.ts`, which keeps cookie 0.5's rules (cookie 2 no longer strips quotes);
  `tsconfig` `module: node20` (still CommonJS output; types for the `require(esm)`), typescript `^5.9.3`.
  cookie 2 declares Node >= 22: on Node 20 `npm ci` warns (EBADENGINE) but it runs (`require(esm)`).
- **dotenv 16 → 18** (#12): `config({ quiet: true })`, no startup banner as before.
- **cross-env 7 → 10** (#14, #16), npm minor/patch group (#10).
- **TypeScript 7 not taken** (#13, #15): the `typescript` 7 package has no JS compiler API. CRA 5
  (`react-scripts`, fork-ts-checker) fails ("Cannot find module 'typescript'"); in Back `tsc` 7 compiles the
  same JS but `npm run dev` (nodemon → ts-node) crashes. Back stays on TS 5.9, Front on 4.9.
  Superseded on 2026-10-26: Back (below), Front moved off CRA to Vite (below).
- Tests: cookie parsing (other cookies, URL-decoding, first wins, quotes, bad escapes) and quiet startup log.

## Back on TypeScript 7 (2026-10-26, MIGRATIONS.md)

- `typescript` 7.0.2 (exact pin; native `tsc`, picked from the `@typescript/typescript-<os>-<arch>`
  optional package, a static binary: no install script, works on node:20-slim / node:26-slim). Emitted
  JS is the same as TS 5.9's (only diff: `var _a, _b;` split into two `var` lines in
  `services/socketService/userEvents.js`); the image's runtime files are otherwise identical.
- `npm run dev` no longer uses ts-node (TS 7 has no JS compiler API): `tsc` once, then `Back/dev.mjs`
  (Node built-ins only) watches the sources, reruns `tsc` on change, and `node --watch dist/index.js`
  restarts the server. Same cwd as before (`.env`, `version.txt`, `public/`). `tsc --watch` of 7.0.2 was not
  used: it missed edits inside containers. `nodemon`, `ts-node-dev` (and its `ts-node`) are removed;
  `tsconfig.json` drops the `ts-node` block and excludes `dev.mjs` from the build.
- Tested: back 12/12 on node 20 and 26 (TESTING.md command), hardened smoke OK, image file list identical to
  the previous image, dev loop in node:20-slim and node:26-slim (edit `index.ts` → `/info` serves the
  change after a restart; SIGTERM leaves no `tsc`/`node` behind).

## Front off Create React App: Vite 8 + TypeScript 7 (2026-10-26, MIGRATIONS.md)

- `react-scripts` 5 (peers TS ^3||^4, needs TypeScript's JS API) replaced by `vite` 8.3.4 +
  `@vitejs/plugin-react` 6.1.2 (exact pins, released >= 7 days before; whole new lockfile subtree resolved
  with `--before`). `typescript` 7.0.2. `web-vitals` and `cross-env` (unused) removed. Rolldown,
  lightningcss and tsc are native optional packages: no install script.
- `npm start` = Vite dev server on :3000 (the Back's DEV CORS origin), `npm run build` / `npm run ci` =
  `tsc` (type check, as CRA did) then `vite build` into `Front/build/` (the Dockerfile copy is unchanged).
  `vite.config.mts`: output `build/`, base `/`, sourcemaps (as CRA), target ES2020 (`chrome87`, `edge88`,
  `firefox78`, `safari14`) in place of CRA's browserslist.
- CRA-isms: `index.html` moved to `Front/` with the `/src/index.tsx` module entry (`%PUBLIC_URL%` → `/`);
  `react-app-env.d.ts` → `vite-env.d.ts`; `App.scss` `url('/images/drawer.jpg')` (CRA resolved it from `src/`)
  → `./images/drawer.jpg`; three unused auto-imports of Node modules (`child_process`, `process`,
  `diagnostics_channel`) removed (Babel dropped them; TS 7 no longer loads `@types/node` implicitly).
  No `process.env` in `src/`, no Front tests (nothing to port; no vitest).
- Output: `assets/` instead of `static/{js,css,media}`, no `asset-manifest.json`; same media files (byte-equal),
  main JS 656 kB (gzip 205 kB) vs 710 kB (224 kB) with CRA.
- Tested: hardened smoke OK; Playwright (Chromium, phone viewport) on the built image vs the previous image,
  `ENV=DEV`, two players: new user → choose party → create party → scenario / messagerie / characters →
  character page (react-markdown) → choose character → second player joins by code → sees the character
  taken → QR scanner opens (react-qr-reader, fake camera) → `/objects/<game>` QR sheet (qrcode.react) + print
  (react-to-print) → `/test` → logout. Same page texts and URLs at every step, same Socket.IO frames (as a
  multiset, ids masked), same `/rooms`, no page errors; screenshots differ only in random ids and the fake
  camera frame. Vite dev server checked against the Back (login + create party, no errors).

## Known issues (kept)

- State is in memory: a restart or redeploy ends every game.
- `/test` (cheat page: all users, all rooms, delete) is routed in production.
- `Back/dist/` is committed but the image rebuilds it.
- Image runs as root by default (it works as uid 1000, see the smoke); no HEALTHCHECK.
