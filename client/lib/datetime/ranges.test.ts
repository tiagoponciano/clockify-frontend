import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCustomRange, getPresetRange, getWeekRange } from './ranges';

// Wednesday 2026-10-14, 12:00 in São Paulo (UTC-3).
const NOW = new Date('2026-10-14T15:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getWeekRange', () => {
  it('spans Monday 00:00 to Sunday 23:59:59.999 in São Paulo for the current week', () => {
    const week = getWeekRange(0);
    expect([week.from, week.to]).toEqual([
      '2026-10-12T03:00:00.000Z',
      '2026-10-19T02:59:59.999Z',
    ]);
  });

  it('lists the seven days of the week as yyyy-MM-dd keys', () => {
    expect(getWeekRange(0).days).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ]);
  });

  it('labels the current week as "Esta semana"', () => {
    expect(getWeekRange(0).shortLabel).toBe('Esta semana');
  });

  it('moves back whole weeks with a negative offset', () => {
    expect(getWeekRange(-1).from).toBe('2026-10-05T03:00:00.000Z');
  });
});

describe('getPresetRange', () => {
  it.each([
    ['today', '2026-10-14', '2026-10-14', 1],
    ['yesterday', '2026-10-13', '2026-10-13', 1],
    ['thisWeek', '2026-10-12', '2026-10-18', 7],
    ['lastWeek', '2026-10-05', '2026-10-11', 7],
    ['pastTwoWeeks', '2026-10-05', '2026-10-18', 14],
    ['thisMonth', '2026-10-01', '2026-10-31', 31],
    ['lastMonth', '2026-09-01', '2026-09-30', 30],
    ['thisYear', '2026-01-01', '2026-12-31', 365],
    ['lastYear', '2025-01-01', '2025-12-31', 365],
  ] as const)('%s covers %s to %s (%i days)', (id, first, last, count) => {
    const range = getPresetRange(id);
    expect([range.days[0], range.days.at(-1), range.days.length]).toEqual([first, last, count]);
  });

  it('tags each range with the preset that produced it', () => {
    expect(getPresetRange('lastWeek').presetId).toBe('lastWeek');
  });
});

describe('getCustomRange', () => {
  it('orders the bounds when they arrive reversed', () => {
    expect(getCustomRange('2026-10-10', '2026-10-08').days).toEqual([
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ]);
  });

  it('labels the range as dd/MM/yyyy – dd/MM/yyyy', () => {
    expect(getCustomRange('2026-10-08', '2026-10-10').label).toBe('08/10/2026 – 10/10/2026');
  });

  it('is marked as a custom selection', () => {
    expect(getCustomRange('2026-10-08', '2026-10-10').presetId).toBe('custom');
  });
});
