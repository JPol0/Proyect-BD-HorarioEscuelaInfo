# AGENTS

- Monorepo managed by `pnpm` workspaces (`pnpm-workspace.yaml`); run installs from repo root.
- Dependencies are pinned with `save-exact=true` in `.npmrc`; prefer `pnpm add` at root or `pnpm --filter <pkg> add`.
- Packages: `frontend/` (Vite + React + TS) and `backend/` (Express + TS). Both are ESM (`"type": "module"`).

## Commands
- Root scripts proxy to `pnpm -r`: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm lint:fix`.
- Frontend: `pnpm --filter frontend dev|build|lint|lint:fix|preview`.
- Backend: `pnpm --filter backend dev|build|lint|lint:fix` (dev uses `tsx watch src/server.ts`, `start` runs `node dist/server.js`).

## Linting
- ESLint uses `.eslintrc.cjs` in each package with `eslint-config-standard-with-typescript`.
- Backend ESLint uses `backend/tsconfig.json`; frontend ESLint uses `frontend/tsconfig.app.json` + `frontend/tsconfig.node.json`.

## Tests
- No test scripts are configured yet; avoid running `pnpm test` unless you add them.

## Entry Points
- Backend: `backend/src/server.ts` (Express app, `/health`, listens on `PORT` or 3000).
- Frontend: `frontend/src/main.tsx` renders `App`.
