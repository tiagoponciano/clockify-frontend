import { parseISO, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'America/Sao_Paulo';

export function toUtcISO(value: Date | string): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return date.toISOString();
}

export function formatLocal(date: string | Date, formatStr: string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(parsed, TIMEZONE, formatStr, { locale: ptBR });
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

export function getManualEntryMinDate(): Date {
  return startOfDay(subDays(new Date(), 10));
}

export function getManualEntryMaxDate(): Date {
  return new Date();
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
