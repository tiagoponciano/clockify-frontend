import { afterEach, describe, expect, it, vi } from 'vitest';
import { getManualEntryMinDate, localPartsToUtcISO, utcToLocalDate, utcToLocalTime } from './core';

afterEach(() => {
  vi.useRealTimers();
});

describe('localPartsToUtcISO', () => {
  it('reads date and time as São Paulo wall clock', () => {
    expect(localPartsToUtcISO('2026-10-14', '09:30')).toBe('2026-10-14T12:30:00.000Z');
  });
});

describe('utcToLocalDate / utcToLocalTime', () => {
  it('shows a UTC instant after midnight as the previous São Paulo day', () => {
    expect(utcToLocalDate('2026-10-15T02:00:00.000Z')).toBe('2026-10-14');
  });

  it('shows the São Paulo hour', () => {
    expect(utcToLocalTime('2026-10-15T02:00:00.000Z')).toBe('23:00');
  });
});

describe('getManualEntryMinDate', () => {
  it('starts the manual entry window at 00:00 ten days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'));
    expect(getManualEntryMinDate().toISOString()).toBe('2026-10-04T03:00:00.000Z');
  });
});
