import { describe, expect, it } from 'vitest';
import {
  mapBackendRole,
  mapBackendUser,
  mapPaginatedTimeEntries,
  mapReportSummary,
  mapTimeEntry,
  mapUserReport,
} from './index';

const backendUser = { id: 'u1', email: 'tpa@certi.org.br', name: 'Tiago', role: 'member' };

const backendEntry = {
  id: 'e1',
  userId: 'u1',
  projectId: 'p1',
  description: 'work',
  startedAt: '2026-10-14T12:00:00.000Z',
  endedAt: '2026-10-14T13:30:00.000Z',
  createdAt: '2026-10-14T12:00:00.000Z',
  updatedAt: '2026-10-14T13:30:00.000Z',
};

describe('mapBackendRole', () => {
  it.each([
    ['admin', 'ADMIN'],
    ['ADMIN', 'ADMIN'],
    ['manager', 'LEADER'],
    ['LEADER', 'LEADER'],
    ['member', 'MEMBER'],
    ['anything-else', 'MEMBER'],
  ])('maps %s to %s', (role, expected) => {
    expect(mapBackendRole(role)).toBe(expected);
  });
});

describe('mapBackendUser', () => {
  it('marks an inactive user as REJECTED', () => {
    expect(mapBackendUser({ ...backendUser, isActive: false }).status).toBe('REJECTED');
  });

  it('falls back to the legacy status when isActive is missing', () => {
    expect(mapBackendUser({ ...backendUser, status: 'REJECTED' }).status).toBe('REJECTED');
  });

  it('treats a user with neither field as APPROVED', () => {
    expect(mapBackendUser(backendUser).status).toBe('APPROVED');
  });

  it('prefers picture over avatarUrl', () => {
    expect(mapBackendUser({ ...backendUser, picture: 'a.png', avatarUrl: 'b.png' }).picture).toBe('a.png');
  });

  it('uses avatarUrl when there is no picture', () => {
    expect(mapBackendUser({ ...backendUser, avatarUrl: 'b.png' }).picture).toBe('b.png');
  });
});

describe('mapReportSummary', () => {
  it('reads items from the backend envelope', () => {
    const raw = { groupBy: 'project', items: [{ id: 'p1', name: 'BL008', totalSeconds: 60 }] };
    expect(mapReportSummary(raw)).toEqual([{ id: 'p1', name: 'BL008', totalSeconds: 60, color: undefined }]);
  });

  it('uses the day as id and name for day buckets', () => {
    const [item] = mapReportSummary({ items: [{ day: '2026-10-14', totalSeconds: 60 }] });
    expect([item.id, item.name]).toEqual(['2026-10-14', '2026-10-14']);
  });

  it('names an item with no id, name or day "Sem nome"', () => {
    const [item] = mapReportSummary({ items: [{ totalSeconds: 60 }] });
    expect([item.id, item.name]).toEqual(['unknown', 'Sem nome']);
  });

  it('returns an empty list for a null body', () => {
    expect(mapReportSummary(null)).toEqual([]);
  });
});

describe('mapTimeEntry', () => {
  it('derives the duration in seconds from start and end', () => {
    expect(mapTimeEntry(backendEntry).duration).toBe(5400);
  });

  it('keeps a duration sent by the backend', () => {
    expect(mapTimeEntry({ ...backendEntry, duration: 7 }).duration).toBe(7);
  });

  it('leaves the duration null while the entry is running', () => {
    expect(mapTimeEntry({ ...backendEntry, endedAt: null }).duration).toBeNull();
  });

  it('leaves the duration null when the end is before the start', () => {
    expect(mapTimeEntry({ ...backendEntry, endedAt: '2026-10-14T11:00:00.000Z' }).duration).toBeNull();
  });
});

describe('mapPaginatedTimeEntries', () => {
  it('renames the backend items to data', () => {
    const page = mapPaginatedTimeEntries({ items: [backendEntry], total: 1, page: 2, limit: 10 });
    expect([page.data.length, page.total, page.page, page.limit]).toEqual([1, 1, 2, 10]);
  });

  it('defaults missing pagination fields', () => {
    const page = mapPaginatedTimeEntries({ items: [] });
    expect([page.total, page.page, page.limit]).toEqual([0, 1, 20]);
  });

  it('accepts a body already in the frontend shape', () => {
    const page = mapPaginatedTimeEntries({ data: [backendEntry], total: 1, page: 1, limit: 50 });
    expect(page.data[0].duration).toBe(5400);
  });
});

describe('mapUserReport', () => {
  it('turns projects without id into "Sem projeto"', () => {
    const report = mapUserReport({
      userId: 'u1',
      totalSeconds: 60,
      byProject: [{ projectId: null, projectName: null, totalSeconds: 60 }],
    });
    expect(report.byProject).toEqual([{ id: 'none', name: 'Sem projeto', totalSeconds: 60 }]);
  });

  it('builds a placeholder user from the id when no fallback is given', () => {
    const report = mapUserReport({ userId: 'u1', totalSeconds: 0, byProject: [] });
    expect([report.user.id, report.user.name, report.user.role]).toEqual(['u1', 'u1', 'MEMBER']);
  });
});
