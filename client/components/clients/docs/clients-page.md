# Clients page

How the `/clients` screen works today — for developers maintaining client CRUD and colors.

## What this is

A management list of clients with color assignment. Managers can quick-add a client by name, edit name/color, and deactivate. Members see a read-only list.

Invariants:

- Color is `#RRGGBB` (same rule as backend `IsHexColor`).
- Color is chosen only on edit; create omits `color` and the backend defaults to `#4A90D9`.
- Deactivate is soft (`isActive: false` via PATCH).
- Name search is client-side only.

## Surface

| Item | Value |
|------|--------|
| Route | `/clients` |
| View | `ClientsView` |
| List | `GET /api/clients?includeInactive` |
| Create | `POST /api/clients` `{ name, color? }` |
| Update | `PATCH /api/clients/:id` `{ name?, color?, isActive? }` |
| Who can mutate | `ADMIN` / `LEADER` |

## Filters

| Control | Behavior |
|---------|----------|
| Status | `active` (default), `inactive`, `all` (`includeInactive=true` when not active-only) |
| Search | Case-insensitive substring on name |

## Color UI

`ClientColorField` appears only in the edit dialog (`ClientFormDialog`). Preset swatches plus a hex text input; invalid hex blocks edit submit. Quick-add has name only. The table shows a color swatch next to the name, not a dedicated color column.

## What this does NOT do

- Address, currency, billing
- Hard delete
- Server-side name search

## Gotchas

- Symptom: create without color → backend applies default `#4A90D9`; change color via edit.
- Symptom: inactive clients missing → status filter is `active` and `includeInactive` is false.
- Symptom: projects create dialog empty of a client → that client is inactive; reactivate via PATCH `isActive: true` (not exposed as a button yet; edit does not re-activate).
