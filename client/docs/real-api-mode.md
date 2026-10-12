# Real API mode

How to run the Next.js client against the Nest MySQL backend (instead of in-browser mocks), including data that came from the Clockify history import.

## What this is

With `NEXT_PUBLIC_USE_MOCK_API=false`, `apiFetch` calls `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`). Auth is Google OAuth (or `POST /api/auth/dev-login` in non-production). Historical time data is whatever lives in MySQL — typically populated by `pnpm import:clockify` on the backend.

## Surface

| Concern | Location |
|---------|----------|
| Mock switch | `NEXT_PUBLIC_USE_MOCK_API` in `client/.env` |
| API base | `NEXT_PUBLIC_API_URL` |
| Response adapters | `client/lib/api-mappers/` (one file per resource) used from `queries.ts` / auth |
| Mock bootstrap | `MockBootstrap` only injects a token when mock mode is on |

## Contract mapping (FE ← BE)

| Backend | Frontend |
|---------|----------|
| `role`: `admin` / `manager` / `member` | `ADMIN` / `LEADER` / `MEMBER` |
| `avatarUrl` | `picture` |
| `isActive` | `status` `APPROVED` / `REJECTED` |
| pagination `{ items }` | `{ data }` |
| reports `{ groupBy, from, to, items }` | `ReportSummaryItem[]` |
| day items use `day` | mapped to `id` + `name` |
| time entry without `duration` | derived from `startedAt`/`endedAt` |

## Setup

1. Start MySQL + Nest (`clockify-backend`), migrations applied.
2. Optionally run `pnpm import:clockify` for Clockify.com history.
3. In `client/.env`: `NEXT_PUBLIC_USE_MOCK_API=false` and `NEXT_PUBLIC_API_URL=http://localhost:3000`.
4. `pnpm dev` in `client/`, open the app, sign in with a `@certi.org.br` Google account (or dev-login).

## What this does NOT do

- It does not sync live with Clockify.com from the frontend.
- It does not remove the mock handlers — they remain available when `NEXT_PUBLIC_USE_MOCK_API=true`.

## Gotchas

- Symptom: reports empty after login → import not run, or filters exclude your user; check `time_entries` counts in MySQL.
- Symptom: 401 on every call → no token; complete Google callback or use dev-login.
- Symptom: role gates wrong → confirm mapper maps `manager` → `LEADER`.
