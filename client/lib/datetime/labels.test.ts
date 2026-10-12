import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatGroupLabel, formatWeekBucketLabel, weekStartKeyForDay } from './labels';

// Wednesday 2026-10-14, 12:00 in São Paulo (UTC-3).
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatGroupLabel', () => {
  it('calls today "Hoje"', () => {
    expect(formatGroupLabel('2026-10-14')).toBe('Hoje');
  });

  it('calls yesterday "Ontem"', () => {
    expect(formatGroupLabel('2026-10-13')).toBe('Ontem');
  });
});

describe('weekStartKeyForDay', () => {
  it('puts Sunday in the week that started the Monday before', () => {
    expect(weekStartKeyForDay('2026-10-18')).toBe('2026-10-12');
  });

  it('keeps Monday as its own week start', () => {
    expect(weekStartKeyForDay('2026-10-12')).toBe('2026-10-12');
  });
});

describe('formatWeekBucketLabel', () => {
  it('names the current week "Esta semana"', () => {
    expect(formatWeekBucketLabel('2026-10-12')).toBe('Esta semana');
  });

  it('names the previous week "Semana passada"', () => {
    expect(formatWeekBucketLabel('2026-10-05')).toBe('Semana passada');
  });
});
