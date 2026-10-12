import { differenceInSeconds, parseISO } from 'date-fns';

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
