import {
  addDays,
  differenceInSeconds,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'America/Sao_Paulo';

export function toUtcISO(value: Date | string): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return date.toISOString();
}

export function formatLocal(date: string | Date, formatStr: string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(parsed, TIMEZONE, formatStr);
}

export function localPartsToUtcISO(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return fromZonedTime(localDate, TIMEZONE).toISOString();
}

export function utcToLocalDate(date: string | Date): string {
  return formatLocal(date, 'yyyy-MM-dd');
}

export function utcToLocalTime(date: string | Date): string {
  return formatLocal(date, 'HH:mm');
}

export function formatDurationHMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatDurationHM(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

export function elapsedSecondsSince(startedAt: string, now = Date.now()): number {
  const start = parseISO(startedAt).getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function entryDurationSeconds(entry: { startedAt: string; endedAt: string | null; duration: number | null }): number {
  if (entry.duration != null) {
    return entry.duration;
  }
  if (entry.endedAt) {
    return differenceInSeconds(parseISO(entry.endedAt), parseISO(entry.startedAt));
  }
  return elapsedSecondsSince(entry.startedAt);
}

export function getManualEntryMinDate(): Date {
  return startOfDay(subDays(new Date(), 10));
}

export function getManualEntryMaxDate(): Date {
  return new Date();
}

export function groupKeyForDate(date: string | Date): string {
  return formatLocal(date, 'yyyy-MM-dd');
}

export function formatGroupLabel(dateKey: string): string {
  const todayKey = groupKeyForDate(new Date());
  if (dateKey === todayKey) {
    return 'Hoje';
  }
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  if (dateKey === groupKeyForDate(yesterdayDate)) {
    return 'Ontem';
  }
  return formatDayHeader(dateKey);
}

/** Monday (yyyy-MM-dd) of the week that contains `dayKey` (America/Sao_Paulo calendar). */
export function weekStartKeyForDay(dayKey: string): string {
  return toDayKey(mondayOfWeek(parseDayKey(dayKey)));
}

/** Clockify-style week header: Esta semana / Semana passada / range. */
export function formatWeekBucketLabel(weekStartKey: string): string {
  const thisWeekStart = toDayKey(mondayOfWeek(localTodayNoon()));
  const lastWeekStart = toDayKey(addDays(mondayOfWeek(localTodayNoon()), -7));
  if (weekStartKey === thisWeekStart) {
    return 'Esta semana';
  }
  if (weekStartKey === lastWeekStart) {
    return 'Semana passada';
  }
  const from = dayBoundsUtc(weekStartKey, weekStartKey).from;
  const endKey = toDayKey(addDays(parseDayKey(weekStartKey), 6));
  const to = dayBoundsUtc(endKey, endKey).to;
  return `${formatLocal(from, 'd MMM')} – ${formatLocal(to, 'd MMM')}`;
}

/** Compact day label like "ter., 22 de set.". */
export function formatCompactDayLabel(dayKey: string): string {
  const todayKey = groupKeyForDate(new Date());
  if (dayKey === todayKey) {
    return 'Hoje';
  }
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  if (dayKey === groupKeyForDate(yesterdayDate)) {
    return 'Ontem';
  }
  return formatChartDayLabel(dayKey);
}

export function getRecentEntriesFromUtc(): string {
  return toUtcISO(startOfDay(subDays(new Date(), 13)));
}

/** Fim do dia atual em Brasília — evita excluir entries criadas após o load da página. */
export function getRecentEntriesToUtc(): string {
  const todayKey = formatLocal(new Date(), 'yyyy-MM-dd');
  const [year, month, day] = todayKey.split('-').map(Number);
  return fromZonedTime(new Date(year, month - 1, day, 23, 59, 59, 999), TIMEZONE).toISOString();
}

export function formatDayHeader(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMidday = fromZonedTime(new Date(year, month - 1, day, 12, 0, 0), TIMEZONE);
  return formatLocal(utcMidday, "EEEE, d 'de' MMMM");
}

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

function localTodayNoon(): Date {
  const todayKey = formatLocal(new Date(), 'yyyy-MM-dd');
  const [year, month, day] = todayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/** Monday 00:00 local (noon anchor for weekday math) for the week containing `anchor`. */
function mondayOfWeek(anchor: Date): Date {
  const dayOfWeek = anchor.getDay(); // 0=Sun … 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return addDays(anchor, -daysFromMonday);
}

function enumerateDays(startKey: string, endKey: string): string[] {
  let cursor = parseDayKey(startKey);
  const end = parseDayKey(endKey);
  if (cursor > end) {
    const swap = cursor;
    cursor = end;
    // end stays as original start — normalize below
    const normalizedEnd = swap;
    const days: string[] = [];
    let c = parseDayKey(startKey < endKey ? startKey : endKey);
    const e = parseDayKey(startKey < endKey ? endKey : startKey);
    while (c <= e) {
      days.push(toDayKey(c));
      c = addDays(c, 1);
    }
    void normalizedEnd;
    return days;
  }
  const days: string[] = [];
  while (cursor <= end) {
    days.push(toDayKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function dayBoundsUtc(startKey: string, endKey: string): { from: string; to: string } {
  const [startY, startM, startD] = startKey.split('-').map(Number);
  const [endY, endM, endD] = endKey.split('-').map(Number);
  return {
    from: fromZonedTime(new Date(startY, startM - 1, startD, 0, 0, 0, 0), TIMEZONE).toISOString(),
    to: fromZonedTime(new Date(endY, endM - 1, endD, 23, 59, 59, 999), TIMEZONE).toISOString(),
  };
}

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

export function formatChartDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMidday = fromZonedTime(new Date(year, month - 1, day, 12, 0, 0), TIMEZONE);
  return formatInTimeZone(utcMidday, TIMEZONE, 'EEE, d MMM', { locale: ptBR });
}
