import { apiFetch, buildQuery, jsonBody } from '@/lib/api';
import {
  mapBackendUser,
  mapBackendUsers,
  mapClientRecord,
  mapPaginatedTimeEntries,
  mapReportSummary,
  mapTimeEntry,
  mapUserReport,
} from '@/lib/api-mappers';
import type {
  Client,
  CreateClientInput,
  CreateProjectInput,
  CreateTimeEntryInput,
  PaginatedResponse,
  Project,
  ReportGroupBy,
  ReportSummaryItem,
  StartTimeEntryInput,
  Tag,
  TimeEntry,
  UpdateClientInput,
  UpdateProjectInput,
  UpdateTimeEntryInput,
  User,
  UserReport,
} from '@/types/api';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  timer: {
    current: ['timer', 'current'] as const,
  },
  timeEntries: (filters: Record<string, unknown>) => ['time-entries', filters] as const,
  projects: (filters?: Record<string, unknown>) => ['projects', filters ?? {}] as const,
  clients: (filters?: Record<string, unknown>) => ['clients', filters ?? {}] as const,
  users: ['users'] as const,
  tags: (projectId: string) => ['tags', projectId] as const,
  reports: {
    summary: (filters: Record<string, unknown>) => ['reports', 'summary', filters] as const,
    user: (userId: string, filters: Record<string, unknown>) => ['reports', 'user', userId, filters] as const,
  },
};

export async function fetchCurrentEntry(): Promise<TimeEntry | null> {
  const raw = await apiFetch<TimeEntry | null>('/api/time-entries/current');
  return raw ? mapTimeEntry(raw) : null;
}

export async function startTimer(input: StartTimeEntryInput): Promise<TimeEntry> {
  const raw = await apiFetch<TimeEntry>('/api/time-entries/start', {
    method: 'POST',
    body: jsonBody(input),
  });
  return mapTimeEntry(raw);
}

export async function stopTimer(): Promise<TimeEntry> {
  const raw = await apiFetch<TimeEntry>('/api/time-entries/stop', { method: 'POST' });
  return mapTimeEntry(raw);
}

export async function fetchTimeEntries(filters: {
  from?: string;
  to?: string;
  userId?: string;
  projectId?: string;
  clientId?: string;
  tagId?: string;
  page?: number;
  limit?: number;
  includeRunning?: boolean;
}): Promise<PaginatedResponse<TimeEntry>> {
  const raw = await apiFetch<unknown>(`/api/time-entries${buildQuery(filters)}`);
  return mapPaginatedTimeEntries(raw);
}

export async function createTimeEntry(input: CreateTimeEntryInput): Promise<TimeEntry> {
  const raw = await apiFetch<TimeEntry>('/api/time-entries', {
    method: 'POST',
    body: jsonBody(input),
  });
  return mapTimeEntry(raw);
}

export async function updateTimeEntry(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry> {
  const raw = await apiFetch<TimeEntry>(`/api/time-entries/${id}`, {
    method: 'PATCH',
    body: jsonBody(input),
  });
  return mapTimeEntry(raw);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  return apiFetch<void>(`/api/time-entries/${id}`, { method: 'DELETE' });
}

export async function fetchProjects(filters?: { clientId?: string; includeArchived?: boolean }): Promise<Project[]> {
  const raw = await apiFetch<Array<Project & { updatedAt?: string }>>(
    `/api/projects${buildQuery(filters ?? {})}`,
  );
  return raw.map((project) => mapClientRecord(project));
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const raw = await apiFetch<Project & { updatedAt?: string }>('/api/projects', {
    method: 'POST',
    body: jsonBody(input),
  });
  return mapClientRecord(raw);
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const raw = await apiFetch<Project & { updatedAt?: string }>(`/api/projects/${id}`, {
    method: 'PATCH',
    body: jsonBody(input),
  });
  return mapClientRecord(raw);
}

export async function fetchClients(filters?: { includeInactive?: boolean }): Promise<Client[]> {
  const raw = await apiFetch<Array<Client & { updatedAt?: string }>>(
    `/api/clients${buildQuery(filters ?? {})}`,
  );
  return raw.map((client) => mapClientRecord(client));
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const raw = await apiFetch<Client & { updatedAt?: string }>('/api/clients', {
    method: 'POST',
    body: jsonBody(input),
  });
  return mapClientRecord(raw);
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const raw = await apiFetch<Client & { updatedAt?: string }>(`/api/clients/${id}`, {
    method: 'PATCH',
    body: jsonBody(input),
  });
  return mapClientRecord(raw);
}

export async function fetchTags(projectId: string): Promise<Tag[]> {
  const raw = await apiFetch<Array<Tag & { updatedAt?: string }>>(`/api/projects/${projectId}/tags`);
  return raw.map((tag) => mapClientRecord(tag));
}

export async function fetchUsers(): Promise<User[]> {
  const raw = await apiFetch<unknown>('/api/users');
  return mapBackendUsers(raw);
}

export async function fetchReportSummary(filters: {
  from?: string;
  to?: string;
  groupBy?: ReportGroupBy;
  projectId?: string;
  clientId?: string;
  userId?: string;
}): Promise<ReportSummaryItem[]> {
  const raw = await apiFetch<unknown>(`/api/reports/summary${buildQuery(filters)}`);
  return mapReportSummary(raw);
}

export async function fetchUserReport(
  userId: string,
  filters: { from?: string; to?: string },
): Promise<UserReport> {
  const raw = await apiFetch<unknown>(`/api/reports/user/${userId}${buildQuery(filters)}`);
  return mapUserReport(raw);
}
