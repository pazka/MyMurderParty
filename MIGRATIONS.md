# Migrations

One entry per toolchain migration: what changed, how it was proven, how to roll back.
Images: `ghcr.io/pazka/my-murder-party:<git sha>` (pushed by `deploy.yml` for every `main` commit).

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
