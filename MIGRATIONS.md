# Migrations

One entry per toolchain migration: what changed, how it was proven, how to roll back.
Images: `ghcr.io/pazka/my-murder-party:<git sha>` (pushed by `build-scan-push.yml`, named
`deploy.yml` until 2026-11-06, for every `main` commit).

## 2026-11-06 — hosh-deploy template app (pazka/hosh-management#5)

- **Why**: the legacy box deploy is manual (a Node security fix needed hand work on the box). Box standard
  (hosh-migration 11-BOX-STANDARD.md, Decision #16): releases deploy themselves through `hosh-deploy`.
- **Changed**: `PORT` env overrides the listen port (unset = 80 in PROD as before); `GET /healthz`;
  `Back/ops/healthcheck.js` (image `HEALTHCHECK`) and `Back/ops/smoke.js` (`POST_DEPLOY`, read-only);
  `deploy/hosh-deploy.conf`, `deploy/traefik-route.yml.tmpl`, `docker-compose.example.yml`, `.env.example`,
  `DEPLOY.md`; `docker-compose.yml` → `docker-compose.legacy.yml` (must not exist in `/srv/my-murder-party`, or
  `hosh-deploy register` would validate it instead of the example); workflow `deploy.yml` (build-scan-push) →
  `build-scan-push.yml`, new `deploy.yml` (hosh-deploy), `release.yml` smoke in both modes before any push +
  `deploy` job (stable tags only; no-op without `HOSH_DEPLOY_KEY`).
- **Runtime behaviour**: unchanged under the legacy compose (port 80, uid 1000, ENV=PROD); `/healthz` answers
  instead of redirecting to `/`; the container now reports a health status.
- **Proof**: CI `container smoke` legacy + template modes; back tests 15/15.
- **Rollback**: `git revert` the merge; on the box, the legacy compose keeps working with any image (DEPLOY.md §6).

## 2026-11-06 — Node 26.13.0 pinned by digest, Node 20 out of CI (pazka/hosh-management#5)

- **Why**: CVE-2026-111497 (Brotli RCE in `node:zlib`, actively exploited) is fixed in Node 26.12.1; Node 20
  is EOL. The floating `node:26-slim` tag gave no proof of which 26.x went into an image.
- **Changed**: `Dockerfile` both stages `node:26.13.0-slim@sha256:5adad64f…68072` (same variant);
  `ci.yml` matrix `['26']`; new `scripts/check-node-version.sh` (box-standard guardrail) run on the built image
  in `ci.yml` (container smoke), `release.yml` and `deploy.yml` (before any push), plus a permanent
  negative check that it rejects `node:24.21.0-alpine`.
- **Runtime behaviour**: unchanged (same app code; base image patch-level only).
- **Proof**: CI on the PR (back tests on Node 26, guardrail log `Node 26.13.0 in mymurderparty:smoke: OK`,
  hardened smoke).
- **Rollback**: redeploy the previous image (`git revert` the merge commit, or the previous release tag).

## 2026-10-26 — Back: TypeScript 5.9.3 → 7.0.2, dev loop without ts-node

- **Why**: Dependabot #13 (closed): TS 7 compiles Back, but `npm run dev` (nodemon → ts-node) crashed
  because the `typescript` 7 package has no JS compiler API.
- **Changed**: `Back/package.json` (`typescript` 7.0.2 exact; `nodemon`, `ts-node-dev` removed; `dev` =
  `tsc && node dev.mjs`), `Back/package-lock.json`, `Back/tsconfig.json` (no `ts-node` block, `exclude`
  `dev.mjs`), new `Back/dev.mjs` (Node built-ins: watch → `tsc` → `node --watch dist/index.js`).
- **Runtime behaviour**: unchanged. Emitted JS identical except one `var _a, _b;` split into two
  declarations; image runtime files otherwise identical to the previous image.
- **Proof**: back tests 12/12 on node 20 and 26, hardened container smoke, dev loop exercised in
  node:20-slim and node:26-slim. Details in TESTING.md ("Back on TypeScript 7").
- **Rollback**: redeploy the previous image `ghcr.io/pazka/my-murder-party:90196ebdbfc3be36dc5cd20b50ab9510070041c7`
  (or `git revert` the merge commit).

## 2026-10-26 — Front: Create React App → Vite 8, TypeScript 4.9.5 → 7.0.2

- **Why**: Dependabot #15 (closed): `react-scripts` 5 peers TypeScript ^3||^4 and fails with TS 7
  ("Cannot find module 'typescript'"); CRA is unmaintained.
- **Changed**: `Front/package.json` + lockfile (`react-scripts`, `web-vitals`, `cross-env` out; `vite` 8.3.4,
  `@vitejs/plugin-react` 6.1.2, `typescript` 7.0.2 exact), `Front/vite.config.mts` (new), `Front/index.html`
  (from `public/`), `src/vite-env.d.ts` (was `react-app-env.d.ts`), `tsconfig.json` (ES2020, `bundler`
  resolution), `src/App.scss` (relative image URL), three unused Node imports removed, Dockerfile/README/
  smoke comments.
- **Runtime behaviour**: unchanged (browser check below). Build output paths changed (`/assets/…` instead of
  `/static/…`): the Back serves `public/` as a whole, nothing references those paths.
- **Proof**: hardened smoke + Playwright comparison against the previous image. Details in TESTING.md
  ("Front off Create React App").
- **Rollback**: redeploy the previous image `ghcr.io/pazka/my-murder-party:f4e222fa885612138b9185dd19c003856eb5b1a1`
  (or `git revert` the merge commit).
