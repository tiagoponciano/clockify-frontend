import type { PaginatedResponse, TimeEntry } from '@/types/api';
import type { BackendPaginated, BackendTimeEntry } from './backend-types';
import { mapBackendUser } from './users';

function computeDurationSeconds(startedAt: string, endedAt: string | null): number | null {
  if (!endedAt) {
    return null;
  }
  const start = Date.parse(startedAt);
  const end = Date.parse(endedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null;
  }
  return Math.floor((end - start) / 1000);
}

export function mapTimeEntry(raw: BackendTimeEntry): TimeEntry {
  return {
    id: raw.id,
    userId: raw.userId,
    user: raw.user ? mapBackendUser(raw.user) : undefined,
    projectId: raw.projectId,
    project: raw.project,
    description: raw.description,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt,
    duration: raw.duration ?? computeDurationSeconds(raw.startedAt, raw.endedAt),
    tags: raw.tags,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function mapPaginatedTimeEntries(raw: unknown): PaginatedResponse<TimeEntry> {
  if (raw && typeof raw === 'object' && Array.isArray((raw as PaginatedResponse<TimeEntry>).data)) {
    const page = raw as PaginatedResponse<BackendTimeEntry>;
    return {
      data: page.data.map(mapTimeEntry),
      total: page.total,
      page: page.page,
      limit: page.limit,
    };
  }

  const page = raw as BackendPaginated<BackendTimeEntry>;
  return {
    data: (page.items ?? []).map(mapTimeEntry),
    total: page.total ?? 0,
    page: page.page ?? 1,
    limit: page.limit ?? 20,
  };
}
