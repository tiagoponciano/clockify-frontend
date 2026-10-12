import { addDays } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { TIMEZONE, formatLocal } from './core';

/* Local calendar-day helpers shared by labels and ranges; not part of the public API. */

export function localTodayNoon(): Date {
  const todayKey = formatLocal(new Date(), 'yyyy-MM-dd');
  const [year, month, day] = todayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/** Monday 00:00 local (noon anchor for weekday math) for the week containing `anchor`. */
export function mondayOfWeek(anchor: Date): Date {
  const dayOfWeek = anchor.getDay(); // 0=Sun … 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return addDays(anchor, -daysFromMonday);
}

export function enumerateDays(startKey: string, endKey: string): string[] {
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

export function dayBoundsUtc(startKey: string, endKey: string): { from: string; to: string } {
  const [startY, startM, startD] = startKey.split('-').map(Number);
  const [endY, endM, endD] = endKey.split('-').map(Number);
  return {
    from: fromZonedTime(new Date(startY, startM - 1, startD, 0, 0, 0, 0), TIMEZONE).toISOString(),
    to: fromZonedTime(new Date(endY, endM - 1, endD, 23, 59, 59, 999), TIMEZONE).toISOString(),
  };
}
