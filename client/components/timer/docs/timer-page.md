# Timer page

How the `/timer` screen works today — for developers maintaining the timer bar and the recent entries feed.

## What this is

The primary time-tracking surface: a sticky bar to start/stop a running timer (or open manual entry), plus a feed of the signed-in user's recent completed entries grouped like Clockify (week → day → row).

Invariants:

- Only the current user's entries appear (`userId` from auth).
- The feed window is the last ~14 local days (`getRecentEntriesFromUtc` … `getRecentEntriesToUtc`).
- Running entries are not listed in the feed; they live only on the timer bar via `useTimer`.
- There is no billable toggle on this screen.

## Surface

| Item | Value |
|------|--------|
| Route | `/timer` |
| Bar | `TimerBar` |
| Feed | `EntriesList` → `EntryRow` |
| Current timer | `GET/POST/PATCH` via `useTimer` |
| Recent entries | `GET /api/time-entries` with `from`/`to`/`userId`/`limit=200` |
| Manual create | `POST /api/time-entries` from the bar toggle or empty-state |

## Layout

1. **Timer bar** (sticky): description → project combobox → tags → elapsed `HH:MM:SS` → START/STOP → timer/manual mode toggle (manual opens `ManualEntryDialog`).
2. **Week buckets**: label `Esta semana` / `Semana passada` / date range; right side shows week total as `HH:MM:SS`.
3. **Day headers** inside each week: compact label (`Hoje` / `Ontem` / `EEE, d MMM` in `pt-BR`); day total on the right.
4. **Rows**: description (opens edit), project with client color, tags icon (tooltip), start–end, duration, play (restart), ⋮ menu (edit / duplicate / delete).

## Rules and behavior

1. START may omit project; STOP requires a project (toast if missing).
2. While running, description/project/tags patch the current entry (description debounced 500ms).
3. Stopping clears the draft fields for the next start.
4. Day keys and week Mondays use `America/Sao_Paulo` (`weekStartKeyForDay`, `formatWeekBucketLabel`, `formatCompactDayLabel`).
5. Restart on a row calls `start` with that entry's project, description, and tags.

## What this does NOT do

- Billable / `$` controls.
- Collapsed “same description” group counts.
- Calendar or timesheet views.
- Showing other users' entries on this page.

## Gotchas

- Symptom: new entry missing from the list after stop → cause: `to` must be end-of-today Brasília, not “now” at page load → fix: keep `getRecentEntriesToUtc`.
- Symptom: week label wrong around Sunday/Monday → cause: weeks are Monday-based → fix: use `mondayOfWeek` / `weekStartKeyForDay`, not `startOfWeek` with Sunday.
- Symptom: tags disabled → cause: no project selected → expected; select a project first.
- Symptom: clearing description does nothing → cause: `jsonBody` used to drop `null`/`''`; PATCH omitted `description` → fix: `jsonBody` only omits `undefined`, and edit sends `''`.
