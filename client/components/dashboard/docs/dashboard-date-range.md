# Dashboard date range

How the shared dashboard and reports period filter works today — for anyone wiring charts or extending presets.

## What this is

The dashboard and reports headers expose a Clockify-style period control: preset list on the left, dual-month range calendar on the right. The selected range drives report summaries, time-entry fetch, KPIs, and report charts.

**Invariants**

1. All day boundaries use timezone `America/Sao_Paulo`.
2. Week-based presets always start on Monday and end on Sunday (never Sunday-start weeks).
3. Default on load is preset `thisWeek`.

## Surface

| Piece | Location | Role |
|-------|----------|------|
| `DateRangePicker` | `client/components/dashboard/date-range-picker.tsx` | Popover UI (presets + calendar) |
| `Calendar` | `client/components/ui/calendar.tsx` | DayPicker wrapper (`weekStartsOn={1}`) |
| `useDashboard` | `client/hooks/use-dashboard.ts` | Holds `range` state; passes `from`/`to` to APIs |
| `ReportsView` | `client/components/reports/reports-view.tsx` | Holds the Reports `range` state; passes `from`/`to` to summary queries |
| Helpers | `client/lib/datetime/ranges.ts` | `getPresetRange`, `getCustomRange`, `DATE_RANGE_PRESETS` |

Controlled API:

```ts
value: DashboardDateRange
onChange: (range: DashboardDateRange) => void
```

## Data shapes

`DashboardDateRange`:

| Field | Meaning |
|-------|---------|
| `from` | ISO UTC start (local day 00:00:00.000 in Brasília) |
| `to` | ISO UTC end (local day 23:59:59.999 in Brasília) |
| `days` | Inclusive `yyyy-MM-dd` keys for each local day in the range (chart X-axis) |
| `label` | Longer display string |
| `shortLabel` | Trigger label (`Esta semana`, `Hoje`, or `dd/MM/yyyy – dd/MM/yyyy`) |
| `presetId` | One of the preset ids below, or `'custom'` |

## Rules and behavior

### Presets

| `presetId` | UI label | Range |
|------------|----------|-------|
| `today` | Hoje | Today only |
| `yesterday` | Ontem | Yesterday only |
| `thisWeek` | Esta semana | Monday–Sunday of the current week |
| `lastWeek` | Semana passada | Previous Monday–Sunday |
| `pastTwoWeeks` | Últimas duas semanas | Monday of previous week → Sunday of current week |
| `thisMonth` | Este mês | 1st → last day of current month |
| `lastMonth` | Mês passado | Previous calendar month |
| `thisYear` | Este ano | Jan 1 → Dec 31 of current year |
| `lastYear` | Ano passado | Previous calendar year |

Selecting a preset applies immediately and closes the popover.

### Custom range

1. Open the calendar (two months, Monday-first columns, `pt-BR` locale).
2. Click start day, then end day.
3. On the second click, `presetId` becomes `'custom'`, trigger shows `dd/MM/yyyy – dd/MM/yyyy`, popover closes.

The popover is bounded by the viewport and scrolls vertically when the two stacked months do not fit on a small screen.

### Downstream

`useDashboard` sends `range.from` / `range.to` to `/api/reports/summary` and `/api/time-entries` (entries still capped at `limit: 500`). `ReportsView` sends the same bounds to its day and project summary queries. Both chart surfaces receive `range.days` unchanged — one bar per day, including month/year ranges.

## What this does NOT do

- Persist the selection in the URL or `localStorage`
- Drive the timer entries list window
- Raise the 500-entry fetch limit for long ranges
- Offer prev/next chevrons for week stepping (replaced by this picker)

## Gotchas

- **Week start:** any code that assumes Sunday-start weeks will disagree with `thisWeek` / `lastWeek` / `pastTwoWeeks`.
- **Partial calendar click:** the first day click is held in local pending state and does not commit until the end day is chosen (closing the popover discards the pending start).
- **Year charts:** selecting `thisYear` / `lastYear` builds up to 365 chart days while entries remain capped at 500 rows — totals from reports and the chart can diverge if the user has more than 500 entries in range.
