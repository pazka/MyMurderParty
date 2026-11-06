# Deploying murder.hosh.it

Deployment on the hosh.it box (box standard: hosh-migration `11-BOX-STANDARD.md`, template app). Releases
deploy themselves through **hosh-deploy** (§1); the move from the legacy hand-run compose is a one-time
on-box cutover (§1b). `.env.example` defaults already fit the box; there is **no secret**.

| | |
|---|---|
| App name (hosh-deploy, compose project, service, container, router, `/srv/…`) | `my-murder-party` |
| Image | `ghcr.io/pazka/my-murder-party:vX.Y.Z` |
| Host | `murder.hosh.it` |
| Upstream | container `:8000` (`PORT=8000`) → `127.0.0.1:9137` |
| Data | none: all game state is in memory (no volume, nothing written to disk) |
| Env file | `/srv/my-murder-party/my-murder-party.env` (600, no secret) |

## 1. How releases go live (hosh-deploy)

Every **stable** release (`release` workflow on a tag `vX.Y.Z`; prerelease tags `vX.Y.Z-rc.N` and the
`DEPLOY_TRIGGER=main` mode never deploy) ends with the **`deploy`** job: GitHub connects to the box as `deployer`
with this repo's `HOSH_DEPLOY_KEY` (bound to my-murder-party only) and runs
`hosh-deploy deploy my-murder-party vX.Y.Z`. The box pulls the image, swaps the tag in `my-murder-party.env`,
waits healthy, checks `/healthz` on the loopback port and through Traefik, runs `POST_DEPLOY`
(`node /app/ops/smoke.js http://127.0.0.1:8000`, read-only) inside the container and **rolls back by itself**
if any check fails (the workflow then goes red). Nothing from the repo runs on the host.

- While `HOSH_DEPLOY_KEY` is not set (before the cutover) the `deploy` job only prints a notice: a release
  just builds, smokes (legacy + template mode), scans and pushes `:vX.Y.Z`, `:<sha>`, `:latest` as before.
- Redeploy / roll forward / back: Actions → **deploy** → `vX.Y.Z`, `rollback` or `status`.
- On the box: `sudo hosh-deploy deploy|rollback|status my-murder-party …`. Log: `/var/log/hosh-deploy.log`.
- Repo variable `HOSH_AUTODEPLOY=false` stops auto-deploy after releases (manual dispatch still works).
- **A deploy restarts the server: every running game ends** (in-memory state, as with the legacy deploys).
  Prefer releasing when nobody plays (`/healthz` → `users`, `rooms`).

## 1b. Cutover from the legacy compose (once; on-box Claude in an owner-opened sudo window)

Today the box runs the legacy compose (`docker-compose.legacy.yml` in this repo is its copy; container
`my-murder-party-app-1`, `127.0.0.1:9674:80`, router for `murder.hosh.it` in
`/root/hosh-deploy/edge/traefik/dynamic/routes.yml`). Box rules: `ACTIONS-LOG.md` intent BEFORE, result +
revert AFTER; `scripts/smoke.sh murder` BEFORE and AFTER.

**Prerequisites (owner):**
1. **GHCR package `my-murder-party` public** (package settings → visibility; the repo is public). Root pulls
   anonymously; a private package makes every hosh-deploy fail at pull (11-BOX-STANDARD §6).
2. A release built from a commit that contains this file (e.g. tag **`v1.2.0`**; before step D it only builds
   and pushes). Below, `vX.Y.Z` = that tag.

Data move: **none**. State is in memory; there is no bind mount or volume to copy, and the legacy compose has
no `.env` (only `ENV=PROD`, which `.env.example` already sets). Games running at the switch end (check `rooms`
and `users` on `/healthz` / `curl -s 127.0.0.1:9674/rooms` first).

```sh
# A — release checkout (provides docker-compose.example.yml, .env.example, deploy/*). The checkout must NOT
#     contain a docker-compose.yml (register would validate it instead of the example): since this release it does not.
sudo mkdir -p /srv/my-murder-party && sudo chmod 750 /srv/my-murder-party && cd /srv/my-murder-party
[ -d .git ] || { sudo git init -q && sudo git remote add origin https://github.com/pazka/MyMurderParty; }
sudo git fetch -q --depth 1 origin tag vX.Y.Z && sudo git checkout -q vX.Y.Z
# B — env file from the template (no secret: nothing for the owner to add)
[ -e my-murder-party.env ] || sudo install -m 600 .env.example my-murder-party.env
# C — pin the box config (validates the compose hardening: uid 10001, read-only, cap_drop ALL, …)
sudo hosh-deploy register my-murder-party
# D — GitHub key (owner runs these with `!` if the agent is blocked)
ssh-keygen -q -t ed25519 -N '' -C hosh-deploy:my-murder-party -f /tmp/my-murder-party-deploy
sudo /home/pazka/MIGRATION/scripts/setup-hosh-deploy.sh key my-murder-party /tmp/my-murder-party-deploy.pub
gh secret set HOSH_DEPLOY_KEY -R pazka/MyMurderParty < /tmp/my-murder-party-deploy && shred -u /tmp/my-murder-party-deploy /tmp/my-murder-party-deploy.pub
```
**E — take the legacy router out, then the first deploy (site down for ~1–2 min between the two).**
hosh-deploy writes its own router `my-murder-party@file` for `Host(murder.hosh.it)` after the loopback check
and then checks `https://murder.hosh.it/healthz`: with the legacy router for the same host still loaded, two
routers with the same rule compete and the check may reach the legacy v1.1.x (which answers `/healthz` with a
302) ⇒ automatic rollback. So the legacy router goes first, while the legacy **container keeps running** (fast
rollback):
```sh
# E1 — coordinator: delete the murder.hosh.it router + its service from routes.yml (Traefik hot-reloads)
sudoedit /root/hosh-deploy/edge/traefik/dynamic/routes.yml
curl -s 127.0.0.1:8899/api/http/routers | grep -c 'murder.hosh.it'      # → 0
# E2 — first deploy = CI (writes the route, POST_DEPLOY, rollback on failure)
gh workflow run deploy -R pazka/MyMurderParty -f version=vX.Y.Z
gh run watch -R pazka/MyMurderParty "$(gh run list -R pazka/MyMurderParty -w deploy -L 1 --json databaseId -q '.[0].databaseId')"
```
**F — only when E2 is green:** stop the legacy compose (find its directory from the container, keep the files):
```sh
d="$(sudo docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' my-murder-party-app-1)"
cd "$d" && sudo docker compose down          # no -v, no --remove-orphans (the new project may share its name)
```
Then commit `routes.yml` + `my-murder-party.yml` in `/root/hosh-deploy`, update the box smoke harness
(`scripts/smoke.sh` `svc_murder`: same host, add the `/healthz` JSON check of §3), run `scripts/smoke.sh all`
(AFTER), port registry: 9137 live, 9674 free.

**Rollback** (any time, nothing to restore: no data):
1. `sudo docker compose --project-directory /srv/my-murder-party --env-file /srv/my-murder-party/my-murder-party.env -f /srv/my-murder-party/docker-compose.yml stop`
2. `sudo rm /root/hosh-deploy/edge/traefik/dynamic/my-murder-party.yml` and put the legacy router back
   (`sudo git -C /root/hosh-deploy checkout -- edge/traefik/dynamic/routes.yml`, or `git revert` of the
   cutover commit once committed)
3. legacy: `cd <legacy dir> && sudo docker compose up -d` (unchanged compose, image `v1.1.1` or any later tag:
   the image still runs as before under the legacy compose — CI checks it on every commit)
4. optional: `sudo /home/pazka/MIGRATION/scripts/setup-hosh-deploy.sh unkey my-murder-party`,
   `sudo rm /etc/hosh-deploy/apps/my-murder-party.conf`, delete the `HOSH_DEPLOY_KEY` secret.

Gotcha: both composes may share the compose project name `my-murder-party` (legacy dir named after the app).
That only gives an "orphan container" warning; never run `down --remove-orphans` in either directory.

## 2. Variables (`my-murder-party.env`, mode 600)

| Variable | Default | Who | Meaning |
|---|---|---|---|
| `APP_IMAGE` | `ghcr.io/pazka/my-murder-party:v1.2.0` | hosh-deploy | image tag (the only line it rewrites) |
| `APP_BIND` | `127.0.0.1:9137` | box | loopback publish (must equal `BIND` in `deploy/hosh-deploy.conf`) |
| `ENV` | `PROD` | box | config set: CORS `https://murder.hosh.it` only, session cookie `Domain=.hosh.it; HttpOnly; Secure; SameSite=Strict`, listen `0.0.0.0` |
| `PORT` | `8000` (set in the compose, not the env file) | compose | listen port; unset = 80 (PROD), which the legacy compose relies on |

## 3. Capability checks (what "works" means — not just a 200)

- `GET /healthz` → 200 `{"status":"ok","version":"x.y.z","users":n,"rooms":n,"sockets":n}` (store answers,
  `version.txt` readable, Socket.IO attached; read-only). `HEAD` too.
- `GET /` → 200 HTML with `<div id="root">` and the `/assets/index-*.js` bundle.
- `GET /info` → `x.y.z`; `GET /rooms`, `GET /users` → JSON arrays, no `password` / `sessionId` fields.
- `GET /session` → `ABC-123` + `Set-Cookie: sessionId=…; Domain=.hosh.it; HttpOnly; Secure; SameSite=Strict`.
- `OPTIONS /rooms` with `Origin: https://murder.hosh.it` → `Access-Control-Allow-Origin: https://murder.hosh.it`.
- `GET /socket.io/?EIO=4&transport=polling` → `0{"sid":…}`; connect `40` → `you-are null` + `all-rooms`
  (`ops/smoke.js` = POST_DEPLOY does all of the above without creating a user or room).
- Full game (CI only, it creates and deletes a room): `Back/test/container-flow.js play` — two players, login,
  create-and-join, join by code, character, objects, room message, delete, logout.

## 4. What runs

| Item | Value |
|---|---|
| Edge | `/root/hosh-deploy/edge/traefik/dynamic/my-murder-party.yml` (router `my-murder-party@file`, resolver `le`, HSTS) |
| Hardening | uid 10001, read-only rootfs, tmpfs `/tmp` 16m, cap_drop ALL, no-new-privileges, pids 128, mem 512m |
| Health | compose healthcheck + image `HEALTHCHECK`: `node /app/ops/healthcheck.js` (GET `/healthz`) |
| Outbound | none (the server calls nothing; the front loads everything from its own origin) |
| Writes | none (no volume; `/tmp` unused) |

## 5. Decisions / known limits

- No volume (like blueprincedraw): state is in memory by design; a deploy or restart ends every game.
- The image keeps working with the legacy compose (port 80 by default, any uid) until the cutover is done.
- Logs are plain text, not JSON lines; client IPs appear only in the Socket.IO connection log line (the app
  trusts no `X-Forwarded-For`, so behind Traefik that is the docker gateway address).
- `/test` (cheat page) is still routed in production (TESTING.md known issue, owner decision).
