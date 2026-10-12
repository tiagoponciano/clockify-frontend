import { addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { TIMEZONE, formatLocal } from './core';
import { dayBoundsUtc, localTodayNoon, mondayOfWeek, parseDayKey, toDayKey } from './day-keys';

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

export function formatDayHeader(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMidday = fromZonedTime(new Date(year, month - 1, day, 12, 0, 0), TIMEZONE);
  return formatLocal(utcMidday, "EEEE, d 'de' MMMM");
}

export function formatChartDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMidday = fromZonedTime(new Date(year, month - 1, day, 12, 0, 0), TIMEZONE);
  return formatInTimeZone(utcMidday, TIMEZONE, 'EEE, d MMM', { locale: ptBR });
}
