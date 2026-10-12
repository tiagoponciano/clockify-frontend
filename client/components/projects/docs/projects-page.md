# Projects page

How the `/projects` screen works today — for developers maintaining list filters, tracked totals, and project CRUD.

## What this is

A management list of projects in the NEO shell. It loads projects and clients from the API, joins all-time tracked seconds from the reports summary (`groupBy=project`), and lets managers create, edit, and archive projects.

Invariants:

- Tracked time is not stored on the project row; it comes from `GET /api/reports/summary`.
- Archive is soft (`isArchived: true` via PATCH). DELETE is not used from this UI.
- Name search is client-side only.
- Project favorites are stored in `localStorage` per user (`clockify.favoriteProjects.<userId>`), not on the server.

## Surface

| Item | Value |
|------|--------|
| Route | `/projects` |
| View | `ProjectsView` |
| Create / update | `POST /api/projects`, `PATCH /api/projects/:id` |
| List | `GET /api/projects?clientId&includeArchived` |
| Tracked | `GET /api/reports/summary?groupBy=project&from=2015-01-01…&to=endOfToday` |
| Who can mutate | `ADMIN` / `LEADER` (`canManageResources`) |

## Filters

| Control | Behavior |
|---------|----------|
| Status | `active` (default): non-archived; `archived`: only archived; `all`: both (`includeArchived=true`) |
| Client | Passes `clientId` to projects list and tracked report |
| Search | Case-insensitive substring on project name |

## Rules and behavior

1. Table columns: name (+ client color swatch), client name, tracked duration, status, actions (managers).
2. Create/edit dialog requires name and client.
3. Archive sets `isArchived: true`; archived rows hide the archive action.
4. Members see the list read-only (no create button, no edit/archive actions); anyone can toggle favorites.
5. Favorite projects sort to the top of the list and appear first in the timer project combobox.

## What this does NOT do

- Billing, amount, budget/progress, access/members, favorites
- Server-side name search
- Hard delete

## Gotchas

- Symptom: tracked always 0 → reports query failed or project ids do not match summary `id`.
- Symptom: create 403 → user role is not admin/manager on the backend.
- Symptom: empty client dropdown on create → only active clients are offered; inactive clients still appear in the filter list when loaded.
