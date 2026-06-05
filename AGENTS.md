# AGENTS.md

## Quick Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (localhost:5173) |
| Build | `pnpm build` |
| Run production | `pnpm start` |
| Unit tests | `pnpm test` |
| Unit tests + coverage | `pnpm test:coverage` |
| E2E tests | `pnpm test:e2e` |

## Architecture

React Router v7 (SSR) + Vite + TypeScript. Single-page file upload manager.

**Entry points:** `app/root.tsx` (root layout), `app/routes.ts` (route config), `app/routes/home.tsx` (UI + loader), `app/routes/api.upload.tsx` (POST upload), `app/routes/api.upload.$filename.tsx` (GET file / DELETE file)

**Library modules:** `app/lib/uploads.server.ts` (disk ops), `app/lib/files.ts` (formatting / mime inference), `app/lib/file.schema.ts` / `upload.schema.ts` (Zod schemas), `app/lib/error.ts` (error formatting)

**Zod v4.4.3:** Always import as `import * as z from "zod"`. Server uses `parse()` (throws), client uses `safeParse()`. Types via `z.infer`.

## Testing Quirks

**E2E tests** (`e2e/upload.spec.ts`): Each test gets an isolated temp uploads dir injected via a cookie fixture. The dev server starts automatically via Playwright's `webServer`. Tests must wait for hydration before interacting with the file input — use `gotoReady(page)` helper which waits for `[data-hydrated]` attribute. Click-driven tests don't need this (button is disabled until hydrated).

**Unit tests:** Run in Node environment, exclude `e2e/**`. Coverage targets `app/lib/**/*.ts` and `app/routes/**/*.ts` (excluding `*.test.ts`).

## Constraints

- Upload limit: 20 MB (`MAX_FILE_SIZE`)
- Files stored in `uploads/` directory with `uuid__originalname` naming
- Per-test uploads dir controlled via `unique-uploads-dir` cookie
- `tsconfig.json`: `~/*` path alias maps to `./app/*`
- `.gitignore`: `node_modules`, `uploads/`, `test-results/`, `.react-router/`, `build/`, `coverage/`
