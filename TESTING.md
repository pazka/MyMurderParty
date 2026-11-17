# Testing

Safety net for upgrades (Node base image, Express / Socket.IO / TypeScript, Vite front, Actions): it pins
what the game server does today so a Dependabot PR is judged on its CI run.

## What ships

One image: `Back/` compiled with `tsc` into `Back/dist/` (run as `node index.js`), `Front/` (Vite + React, `tsc` type check) built
into `dist/public/`. Production config = `ENV=PROD` (`docker-compose.legacy.yml`, `.env.example`). All game state is **in memory**.

## Run it

```bash
# back tests: black-box, spawn the built server twice (ENV=DEV on localhost:8001, ENV=PROD on :80)
docker run --rm -v "$PWD/Back":/src:ro node:26-slim sh -c \
  'mkdir /a && cd /src && tar --exclude=./node_modules --exclude=./.env -cf - . | tar -xf - -C /a && cd /a \
   && npm ci && npm run build && node --test --test-reporter=spec test/server.test.js'

# container smoke in both box modes + patched-Node guardrail
docker build -t mymurderparty:smoke . && bash scripts/check-node-version.sh mymurderparty:smoke \
  && bash scripts/smoke.sh mymurderparty:smoke legacy && bash scripts/smoke.sh mymurderparty:smoke template
```

(Windows Git Bash: prefix `docker run` with `MSYS_NO_PATHCONV=1`, mount `"$(cygpath -w "$PWD/Back")"`.)

## CI (`.github/workflows/ci.yml`)

PRs, `main`, `agent/**`: `back tests (node 26)` (npm ci, tsc build, tests) and `container smoke` (builds
the real Dockerfile, front included; checks the image's Node with `scripts/check-node-version.sh`, and that the
script rejects an unpatched `node:24.21.0-alpine`). `release.yml` and `build-scan-push.yml` run the same Node check on
the candidate image before anything is pushed.

`scripts/check-node-version.sh IMAGE`: fails if the image's Node is EOL (not 22/24/26) or below the patched
minimum of its line (CVE-2026-111497: 22.23.5 / 24.22.3 / 26.13.1). Copied unchanged from the box standard
(pazka/hosh-management#5); the minimums are bumped there when Node ships a security release.

## What is covered

`Back/test/server.test.js` (15 tests, Node built-ins only; `test/sio-poll.js` is a tiny Socket.IO
long-polling client on `fetch`): `/info`, `/session` id format and cookie flags (DEV and PROD), redirect of
unknown routes, login rules and `you-are` / `new-user` events, reconnect with the session cookie, the full
room flow as the front drives it (create-and-join, unique name, password, users list, character choice and
conflict, shared objects, room broadcast and history, delete with password), `/healthz` (DEV and PROD, creates nothing), `ops/healthcheck.js`, the `PORT` override,
and the quirks below.

`scripts/smoke.sh IMAGE legacy`: the built image run **exactly like the box's legacy compose** (`ENV=PROD`, uid 1000,
read-only rootfs, tmpfs `/tmp`, cap_drop ALL, no-new-privileges, restart always, container port 80) — front
served, REST, PROD cookie flags, engine.io handshake, a whole two-player party over Socket.IO
(`Back/test/container-flow.js play`, run with the image's own node: session cookie, login, create-and-join,
join by code, character, shared objects, room message, `/rooms` + `/users`, delete, logout), no crash in the
logs, then a container restart comes back empty (`keep` → restart → `empty`: state is in memory). Since the
hosh-deploy migration it also checks uid / read-only rootfs / no capabilities, `/healthz`, the read-only
`ops/smoke.js`, and that the image HEALTHCHECK turns `healthy`.

`scripts/smoke.sh IMAGE template`: the same checks on the hosh-deploy compose itself
(`docker-compose.example.yml` + `.env.example`, image swapped, uid 10001, `PORT=8000`, published on the conf's
`BIND` 127.0.0.1:9137), after `scripts/register-check.sh` (CI copy of what `hosh-deploy register` refuses on
the box), plus the conf's `POST_DEPLOY` run inside the container exactly as the box runs it (argv, no shell).
Both modes run in CI (`container smoke`) and in `release.yml` before any push.

`scripts/browser-smoke.sh IMAGE` (CI `container smoke`, last step): the **front's client-side navigation** in a
real browser, so a react-router / React / Vite upgrade is judged on what players click, not only on "the
bundle is served". The built image runs hardened (uid 10001, read-only, cap_drop ALL) with `ENV=STAGING` and the
page is opened on `http://dev.localhost:9874/`: the front picks its server from the host name
(`Front/src/services/config.ts`), and any other name means production. The runner's Chrome resolves every
other host to nothing, and `scripts/browser-flow.mjs` drives it over the DevTools protocol with the image's own
node (built-in `fetch` + `WebSocket`, no package installed). It pins, for two players in two browser contexts:
`/` → `/new-user`; login → `/choose-party`; join button disabled until the code is `XXX-DDD`; create a party →
`/party/<id>` with the room name and `[id]` in the header; Scenario → `/party/<id>/scenario`; the Inventaire
button only on sub pages; Messagerie from a sub page → `/party/<id>/events` (relative to the party, not to the
sub page); Inventaire → `/party/<id>`; the character miniature → `/party/<id>/characters`; browser back/forward
over those entries; a reload of a deep link lands on `/party/<id>` of the same party; player 2 types the code in
lower case without the dash, it is formatted to `XXX-DDD` and joins the same party; logout from the room header
→ `/new-user`; no uncaught page error. Checked 2026-11-16: 29/29 on `main` (react-router 6.18) and on the
#30 lockfile (6.30.6); changing one relative `navigate()` in `PartyRoom.tsx` fails 3 checks.

To run it locally without Docker: build `Back/` and `Front/`, copy `Front/build` to `Back/dist/public`, start
`ENV=STAGING PORT=9874 node index.js` in `Back/dist`, then `node scripts/browser-flow.mjs http://dev.localhost:9874/`
(Node ≥ 22; it starts `google-chrome`, or `$CHROME`, itself).

## Visual use cases (visual regression, hosh-management AGENTS.md §3)

`visual/run.sh IMAGE` (CI `container smoke`, after the browser flow): the built image runs hardened (uid 10001,
read-only, cap_drop ALL) with `ENV=STAGING` on `http://dev.localhost:9874`, two headless Chromes of the runner
(mouse for 1400 / 1024, touch for 390) resolve every other host to nothing, and `visual/shoot.mjs` runs with the
image's own node (no package): every case below at **1400, 1024 and 390 px**, a new player (new browser
context) for each shot, compared with `visual/baseline/<id>-<width>.png` (tolerance: channel 24, 0.1 % of the
pixels). Copied from pazka/plats `visual/`. Each shot starts at `/` and is reached with the clicks listed.

| id | page / state | steps |
|---|---|---|
| H1-new-user | logged out: `/` → `/new-user`, login form | none |
| C1-choose-party | logged in, no party: `/choose-party` (hello, join by code with the button disabled, create a party with the game list) | login "Visual Alice" |
| C2-choose-party-code-typed | join form filled: `abc123` typed, formatted to `ABC-123`, Join enabled | login, type the code |
| P1-party-inventory | in a party (default game "La mort du mysterieux Dr Vaticant"): header, portrait, QR button, Scenario / Messagerie, empty inventory | login, create a party |
| P2-party-scenario | `/party/<id>/scenario` (game text, no character yet), Inventaire button shown | + Scenario |
| P3-party-messagerie | `/party/<id>/events`: message box, history "Visual Alice joined the party" | + Messagerie |
| P4-party-characters | `/party/<id>/characters`: the 12 characters in the frame + "Anonyme" | + click the portrait |
| P5-party-character-page | `/party/<id>/characters/<first>`: name, Incarner, markdown scenario | + click the first character |
| P6-tutorial-inventory | in a party of the "Tutorial Game" (empty inventory) | login, pick Tutorial Game, create |
| P7-tutorial-scenario | its scenario page | + Scenario |

Pinned so a diff means a real change: the room header shows "Visual party" and `[ABC-123]` (party ids are drawn
by the server, room names must be unique); a player without a character gets one of two "?" portraits at random
(`CharacterMiniature.tsx`), the harness shows `whoman.png` for both; animations, transitions and the caret are off.
Game pictures (characters, objects, maps) come from `https://sharing.hosh.it`, which the harness resolves to
nothing: they are drawn as broken images, the same way on every run, so **those pictures are not covered**.

Not covered, and why:
- `/objects/<game>` (printable QR sheet) and `/test`: no link leads there and the server redirects every
  unknown path to `/` (`Back/index.ts`), so a player cannot reach them today.
- QR scanner pop-up (needs a camera), an object page and object combination (the starting inventory is empty;
  objects come from scanning), a chosen character, a second player, error snackbars: not yet.

New or changed baselines (a wanted visual change, said in the PR): CI prints every failing shot in the log
(`VISUAL-PNG` lines); `node visual/from-log.mjs <job log> visual/baseline --chrome` writes them back with
their sha256 checked. Look at every picture before committing it. Baselines are only meaningful for the
runner's Chrome (`visual/baseline/chrome.txt`); a local run with another Chrome differs by its fonts.
Local run: `docker build -t mymurderparty:smoke . && CHROME=/path/to/chrome bash visual/run.sh`.

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

## Node 26.13.0 pinned, Node 20 dropped (2026-11-06, MIGRATIONS.md)

- CVE-2026-111497 (Brotli RCE in `node:zlib`, exploited) is fixed in 26.12.1; Node 20 is EOL. Both stages
  are `node:26.13.1-slim@sha256:…` (Dependabot `docker` bumps tag + digest). CI matrix is Node 26 only.

## Known issues (kept)

- State is in memory: a restart or redeploy ends every game.
- `/test` (cheat page: all users, all rooms, delete) is routed in production.
- `Back/dist/` is committed but the image rebuilds it.
- Image runs as root by default (both composes set a non-root user: legacy 1000, hosh-deploy 10001).
- Logs are plain text (not JSON lines as the box contract asks); the app trusts no `X-Forwarded-For` (it never
  reads the client IP).
