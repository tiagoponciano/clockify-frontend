import { addDays } from 'date-fns';
import { formatLocal } from './core';
import {
  dayBoundsUtc,
  enumerateDays,
  localTodayNoon,
  mondayOfWeek,
  toDayKey,
} from './day-keys';

export type DateRangePresetId =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'pastTwoWeeks'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear';

export type DateRangeSelectionId = DateRangePresetId | 'custom';

export type DashboardDateRange = {
  from: string;
  to: string;
  days: string[];
  label: string;
  shortLabel: string;
  presetId: DateRangeSelectionId;
};

function formatSlashRange(fromIso: string, toIso: string): string {
  return `${formatLocal(fromIso, 'dd/MM/yyyy')} – ${formatLocal(toIso, 'dd/MM/yyyy')}`;
}

function buildRangeFromKeys(
  startKey: string,
  endKey: string,
  presetId: DateRangeSelectionId,
  shortLabel: string,
  label?: string,
): DashboardDateRange {
  const orderedStart = startKey <= endKey ? startKey : endKey;
  const orderedEnd = startKey <= endKey ? endKey : startKey;
  const days = enumerateDays(orderedStart, orderedEnd);
  const { from, to } = dayBoundsUtc(orderedStart, orderedEnd);
  const slash = formatSlashRange(from, to);
  return {
    from,
    to,
    days,
    label: label ?? slash,
    shortLabel,
    presetId,
  };
}

/** Segunda 00:00 → domingo 23:59:59.999 no fuso de Brasília, com offset de semanas. */
export function getWeekRange(weekOffset = 0): {
  from: string;
  to: string;
  days: string[];
  label: string;
  shortLabel: string;
} {
  const monday = addDays(mondayOfWeek(localTodayNoon()), weekOffset * 7);
  const sunday = addDays(monday, 6);
  const startKey = toDayKey(monday);
  const endKey = toDayKey(sunday);
  const { from, to } = dayBoundsUtc(startKey, endKey);
  const days = enumerateDays(startKey, endKey);
  const startLabel = formatLocal(from, 'd MMM');
  const endLabel = formatLocal(to, 'd MMM');
  const isCurrentWeek = weekOffset === 0;

  return {
    from,
    to,
    days,
    label: isCurrentWeek ? `Esta semana (${startLabel} – ${endLabel})` : `${startLabel} – ${endLabel}`,
    shortLabel: isCurrentWeek ? 'Esta semana' : `${startLabel} – ${endLabel}`,
  };
}

export const DATE_RANGE_PRESETS: { id: DateRangePresetId; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'thisWeek', label: 'Esta semana' },
  { id: 'lastWeek', label: 'Semana passada' },
  { id: 'pastTwoWeeks', label: 'Últimas duas semanas' },
  { id: 'thisMonth', label: 'Este mês' },
  { id: 'lastMonth', label: 'Mês passado' },
  { id: 'thisYear', label: 'Este ano' },
  { id: 'lastYear', label: 'Ano passado' },
];

export function getPresetRange(id: DateRangePresetId): DashboardDateRange {
  const today = localTodayNoon();
  const todayKey = toDayKey(today);

  switch (id) {
    case 'today': {
      return buildRangeFromKeys(todayKey, todayKey, 'today', 'Hoje', `Hoje (${formatLocal(dayBoundsUtc(todayKey, todayKey).from, 'd MMM')})`);
    }
    case 'yesterday': {
      const yesterdayKey = toDayKey(addDays(today, -1));
      return buildRangeFromKeys(yesterdayKey, yesterdayKey, 'yesterday', 'Ontem');
    }
    case 'thisWeek': {
      const week = getWeekRange(0);
      return { ...week, presetId: 'thisWeek' };
    }
    case 'lastWeek': {
      const week = getWeekRange(-1);
      return { ...week, shortLabel: 'Semana passada', label: `Semana passada (${week.shortLabel})`, presetId: 'lastWeek' };
    }
    case 'pastTwoWeeks': {
      // Monday of previous week → Sunday of current week (two Mon–Sun weeks).
      const thisMonday = mondayOfWeek(today);
      const startKey = toDayKey(addDays(thisMonday, -7));
      const endKey = toDayKey(addDays(thisMonday, 6));
      return buildRangeFromKeys(startKey, endKey, 'pastTwoWeeks', 'Últimas duas semanas');
    }
    case 'thisMonth': {
      const startKey = toDayKey(new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0));
      const endKey = toDayKey(new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0));
      return buildRangeFromKeys(startKey, endKey, 'thisMonth', 'Este mês');
    }
    case 'lastMonth': {
      const startKey = toDayKey(new Date(today.getFullYear(), today.getMonth() - 1, 1, 12, 0, 0));
      const endKey = toDayKey(new Date(today.getFullYear(), today.getMonth(), 0, 12, 0, 0));
      return buildRangeFromKeys(startKey, endKey, 'lastMonth', 'Mês passado');
    }
    case 'thisYear': {
      const startKey = toDayKey(new Date(today.getFullYear(), 0, 1, 12, 0, 0));
      const endKey = toDayKey(new Date(today.getFullYear(), 11, 31, 12, 0, 0));
      return buildRangeFromKeys(startKey, endKey, 'thisYear', 'Este ano');
    }
    case 'lastYear': {
      const year = today.getFullYear() - 1;
      const startKey = toDayKey(new Date(year, 0, 1, 12, 0, 0));
      const endKey = toDayKey(new Date(year, 11, 31, 12, 0, 0));
      return buildRangeFromKeys(startKey, endKey, 'lastYear', 'Ano passado');
    }
  }
}

/** Inclusive custom range from local `yyyy-MM-dd` keys. */
export function getCustomRange(fromKey: string, toKey: string): DashboardDateRange {
  const orderedStart = fromKey <= toKey ? fromKey : toKey;
  const orderedEnd = fromKey <= toKey ? toKey : fromKey;
  const { from, to } = dayBoundsUtc(orderedStart, orderedEnd);
  const slash = formatSlashRange(from, to);
  return buildRangeFromKeys(orderedStart, orderedEnd, 'custom', slash, slash);
}
