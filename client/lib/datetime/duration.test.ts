import { afterEach, describe, expect, it, vi } from 'vitest';
import { entryDurationSeconds, formatDurationHM, formatDurationHMS } from './duration';

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDurationHMS', () => {
  it('pads hours, minutes and seconds to two digits', () => {
    expect(formatDurationHMS(3661)).toBe('01:01:01');
  });

  it('floors fractional seconds', () => {
    expect(formatDurationHMS(59.9)).toBe('00:00:59');
  });

  it('clamps negative values to zero', () => {
    expect(formatDurationHMS(-5)).toBe('00:00:00');
  });
});

describe('formatDurationHM', () => {
  it('keeps hours past 24 and pads only the minutes', () => {
    expect(formatDurationHM(25 * 3600 + 5 * 60)).toBe('25:05');
  });
});

describe('entryDurationSeconds', () => {
  const startedAt = '2026-10-14T12:00:00.000Z';

  it('uses the stored duration when present', () => {
    expect(entryDurationSeconds({ startedAt, endedAt: '2026-10-14T13:00:00.000Z', duration: 10 })).toBe(10);
  });

  it('derives the duration from start and end when none is stored', () => {
    expect(entryDurationSeconds({ startedAt, endedAt: '2026-10-14T13:00:00.000Z', duration: null })).toBe(3600);
  });

  it('counts up to now for an entry still running', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T12:01:30.000Z'));
    expect(entryDurationSeconds({ startedAt, endedAt: null, duration: null })).toBe(90);
  });
});
