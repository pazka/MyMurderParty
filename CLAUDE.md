# CLAUDE.md — pazka/MyMurderParty

Murder-party game companion (https://murder.hosh.it): `Back/` Express + Socket.IO (TypeScript, in-memory
state), `Front/` CRA 5 React app; one image built by the root `Dockerfile`. Owner: Alexandre (pazka).
Read **TESTING.md** first.

## Maintenance (autonomous agent)
Goal: keep the base image, dependencies and Actions current **without changing behaviour**.
- **Gate = `ci` green**: `back tests (node 20|26)` + `container smoke`.
- **Branches**: work on `agent/<topic>`; CI runs without a PR. Never push to `main` (`deploy.yml` /
  `release.yml` publish from it), never tag. **The owner merges.**
- **Dependabot PRs**: green → summarise risk in a PR comment. Red → reproduce per TESTING.md, smallest fix on
  an `agent/` branch. Never weaken or delete a test; the Socket.IO events the front uses are a contract.
- When the base image major moves, move the test matrix to `[new, next]` and update TESTING.md.
- Security issues listed in TESTING.md are owner decisions; don't fix them silently inside a dependency PR.

## Rules
- Never commit a `.env` file; `Back/.env.example` documents the variables (dev values only).
- No new dependency without the owner's yes (tests use Node built-ins only).
- Run installs and tests in containers (TESTING.md), not on the owner's machine.
