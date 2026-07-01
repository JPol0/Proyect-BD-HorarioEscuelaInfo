# AGENTS

- Monorepo managed by `pnpm` workspaces (`pnpm-workspace.yaml`); run installs from repo root.
- Dependencies are pinned with `save-exact=true` in `.npmrc`; prefer `pnpm add` at root or `pnpm --filter <pkg> add`.
- Packages: `frontend/` (Vite + React + TS) and `backend/` (Express + TS). Both are ESM (`"type": "module"`).

## Architecture

Both packages follow hexagonal (clean) architecture:

| Layer        | `backend/`         | `frontend/`                        |
|-------------|--------------------|-------------------------------------|
| Domain      | `src/domain/`      | `src/core/domain/`                 |
| Application | `src/application/` (ports + useCases) | `src/core/application/` (ports + useCases) |
| Infrastructure | `src/infrastructure/` (database + http) | `src/core/infrastructure/` (adapters) |
| UI          | —                  | `src/ui/` (components/ + pages/)   |

## Commands
- Root scripts proxy to `pnpm -r` or manage Docker containers:
  - `pnpm dev`: Starts both backend and frontend dev servers.
  - `pnpm build`: Builds all packages.
  - `pnpm lint` / `pnpm lint:fix`: Lints and fixes TypeScript code across packages.
  - `pnpm db:up`: Starts the PostgreSQL Docker container in detached mode.
  - `pnpm db:down`: Stops the PostgreSQL Docker container.
  - `pnpm db:logs`: Displays and follows logs from the PostgreSQL container.
- Frontend: `pnpm --filter frontend dev|build|preview|lint|lint:fix` (build uses `tsc -b`).
- Backend: `pnpm --filter backend dev|build|lint|lint:fix` (dev uses `tsx watch src/server.ts`, start runs `node dist/server.js`).

## Linting
- ESLint uses `.eslintrc.cjs` in each package with `eslint-config-standard-with-typescript`.
- Backend ESLint uses `backend/tsconfig.json`; frontend ESLint uses `frontend/tsconfig.app.json` + `frontend/tsconfig.node.json`.

## Database specifics
- PostgreSQL runs via Docker container defined in [docker-compose.yml]
- Schema initialization: PostgreSQL automatically runs all SQL scripts in [database/] when initialized.
  - [01-schema.sql] creates tables.
  - [02-seed.sql] seeds initial mock data.
- Connection settings: Configured via environment variables in `.env` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).

## Frontend specifics
- Built with Vite + React + Tailwind CSS v4 (`@tailwindcss/vite` plugin).
- UI components use `@heroui/react` / `@heroui/styles`.
- Tailwind theme customizations live in `src/index.css` via `@theme` directive.
- `preview` command serves production build locally.

## Backend specifics
- Automatic restart on changes via `tsx watch`.
- Compiled output goes to `backend/dist/`.
- Manual API tests live in `backend/request/` (`.http` files for REST Client).

## Tests
- No test scripts are configured yet; avoid running `pnpm test` unless you add them.

## Entry Points
- Backend: `backend/src/server.ts` (Express app, `/health`, listens on `PORT` or 3000).
- Frontend: `frontend/src/main.tsx` renders `App`.
