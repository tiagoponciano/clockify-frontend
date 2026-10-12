import { entryDurationSeconds, groupKeyForDate } from '@/lib/datetime';
import type {
  CreateTimeEntryInput,
  ReportGroupBy,
  ReportSummaryItem,
  StartTimeEntryInput,
  TimeEntry,
  UpdateTimeEntryInput,
  User,
  UserReport,
} from '@/types/api';
import {
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  MOCK_TAGS,
  MOCK_USER,
  MOCK_USERS,
  createMockEntries,
} from './data';

const STORAGE_KEY = 'clockify.mock.store.v2';

let currentEntry: TimeEntry | null = null;
let entries: TimeEntry[] = createMockEntries();
let nextId = 200;
let hydrated = false;

function newId(): string {
  const suffix = String(nextId++).padStart(12, '0');
  return `e0000000-0000-4000-8000-${suffix}`;
}

function findUser(userId: string): User | undefined {
  return MOCK_USERS.find((item) => item.id === userId);
}

function enrichEntry(entry: TimeEntry): TimeEntry {
  const project = entry.projectId ? MOCK_PROJECTS.find((item) => item.id === entry.projectId) : undefined;
  const tags = entry.tags?.map((tag) => MOCK_TAGS.find((item) => item.id === tag.id) ?? tag) ?? [];
  const user = entry.user ?? findUser(entry.userId);
  return { ...entry, project, tags, user };
}

function persist(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currentEntry, entries, nextId }),
    );
  } catch {
    // ignore quota errors
  }
}

function hydrate(): void {
  if (hydrated || typeof window === 'undefined') {
    return;
  }
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      currentEntry: TimeEntry | null;
      entries: TimeEntry[];
      nextId: number;
    };
    currentEntry = parsed.currentEntry;
    entries = Array.isArray(parsed.entries) && parsed.entries.length > 0 ? parsed.entries : createMockEntries();
    nextId = typeof parsed.nextId === 'number' ? parsed.nextId : 200;
  } catch {
    // ignore corrupt storage
  }
}

function allEntries(): TimeEntry[] {
  hydrate();
  const list = entries.map(enrichEntry);
  if (currentEntry) {
    const enriched = enrichEntry(currentEntry);
    if (!list.some((entry) => entry.id === enriched.id)) {
      list.unshift(enriched);
    }
  }
  return list;
}

export function getMockCurrentEntry(): TimeEntry | null {
  hydrate();
  return currentEntry ? enrichEntry(currentEntry) : null;
}

export function mockStartTimer(input: StartTimeEntryInput): TimeEntry {
  hydrate();
  if (currentEntry?.projectId) {
    mockStopTimer();
  } else if (currentEntry) {
    currentEntry = null;
  }

  const tags = input.tagIds ? MOCK_TAGS.filter((tag) => input.tagIds!.includes(tag.id)) : [];
  currentEntry = enrichEntry({
    id: newId(),
    userId: MOCK_USER.id,
    user: MOCK_USER,
    projectId: input.projectId ?? null,
    description: input.description ?? null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    duration: null,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  persist();
  return currentEntry;
}

export function mockStopTimer(): TimeEntry {
  hydrate();
  if (!currentEntry) {
    throw new Error('Nenhum timer em execução.');
  }
  if (!currentEntry.projectId) {
    throw new Error('Selecione um projeto antes de parar o timer.');
  }

  const endedAt = new Date().toISOString();
  const duration = Math.floor(
    (new Date(endedAt).getTime() - new Date(currentEntry.startedAt).getTime()) / 1000,
  );
  const stopped: TimeEntry = enrichEntry({
    ...currentEntry,
    endedAt,
    duration,
    updatedAt: endedAt,
  });
  entries = [stopped, ...entries.filter((entry) => entry.id !== stopped.id)];
  currentEntry = null;
  persist();
  return stopped;
}

export function mockUpdateEntry(id: string, input: UpdateTimeEntryInput): TimeEntry {
  hydrate();
  if (currentEntry?.id === id) {
    const tagIds = input.tagIds;
    const tags = tagIds ? MOCK_TAGS.filter((tag) => tagIds.includes(tag.id)) : currentEntry.tags;
    currentEntry = enrichEntry({
      ...currentEntry,
      description: input.description !== undefined ? input.description : currentEntry.description,
      projectId: input.projectId !== undefined ? input.projectId : currentEntry.projectId,
      startedAt: input.startedAt ?? currentEntry.startedAt,
      endedAt: input.endedAt !== undefined ? input.endedAt : currentEntry.endedAt,
      tags,
      updatedAt: new Date().toISOString(),
    });
    persist();
    return currentEntry;
  }

  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Apontamento não encontrado.');
  }

  const tagIds = input.tagIds;
  const tags = tagIds ? MOCK_TAGS.filter((tag) => tagIds.includes(tag.id)) : entries[index].tags;
  const updated = enrichEntry({
    ...entries[index],
    description: input.description !== undefined ? input.description : entries[index].description,
    projectId: input.projectId !== undefined ? input.projectId : entries[index].projectId,
    startedAt: input.startedAt ?? entries[index].startedAt,
    endedAt: input.endedAt !== undefined ? input.endedAt : entries[index].endedAt,
    tags,
    updatedAt: new Date().toISOString(),
  });
  entries[index] = updated;
  persist();
  return updated;
}

export function mockCreateEntry(input: CreateTimeEntryInput): TimeEntry {
  hydrate();
  const duration = Math.floor(
    (new Date(input.endedAt).getTime() - new Date(input.startedAt).getTime()) / 1000,
  );
  const tags = input.tagIds ? MOCK_TAGS.filter((tag) => input.tagIds!.includes(tag.id)) : [];
  const created = enrichEntry({
    id: newId(),
    userId: MOCK_USER.id,
    user: MOCK_USER,
    projectId: input.projectId,
    description: input.description ?? null,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    duration,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  entries = [created, ...entries];
  persist();
  return created;
}

export function mockDeleteEntry(id: string): void {
  hydrate();
  entries = entries.filter((entry) => entry.id !== id);
  if (currentEntry?.id === id) {
    currentEntry = null;
  }
  persist();
}

function filterEntries(filters: {
  userId?: string;
  from?: string;
  to?: string;
  projectId?: string;
  clientId?: string;
  includeRunning?: boolean;
}): TimeEntry[] {
  let data = allEntries();
  if (!filters.includeRunning) {
    data = data.filter((entry) => entry.endedAt);
  }
  if (filters.userId) {
    data = data.filter((entry) => entry.userId === filters.userId);
  }
  if (filters.projectId) {
    data = data.filter((entry) => entry.projectId === filters.projectId);
  }
  if (filters.clientId) {
    data = data.filter((entry) => entry.project?.clientId === filters.clientId);
  }
  if (filters.from) {
    const fromMs = new Date(filters.from).getTime();
    data = data.filter((entry) => new Date(entry.startedAt).getTime() >= fromMs);
  }
  if (filters.to) {
    const toMs = new Date(filters.to).getTime();
    data = data.filter((entry) => new Date(entry.startedAt).getTime() <= toMs);
  }
  return data.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function mockListEntries(filters: {
  userId?: string;
  from?: string;
  to?: string;
  projectId?: string;
  clientId?: string;
  page?: number;
  limit?: number;
  includeRunning?: boolean;
}) {
  const data = filterEntries({
    userId: filters.userId,
    from: filters.from,
    to: filters.to,
    projectId: filters.projectId,
    clientId: filters.clientId,
    includeRunning: filters.includeRunning ?? false,
  });
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const start = (page - 1) * limit;
  return {
    data: data.slice(start, start + limit),
    total: data.length,
    page,
    limit,
  };
}

export function mockReportSummary(filters: {
  from?: string;
  to?: string;
  groupBy?: ReportGroupBy;
  projectId?: string;
  clientId?: string;
  userId?: string;
}): ReportSummaryItem[] {
  const groupBy = filters.groupBy ?? 'project';
  const data = filterEntries({
    from: filters.from,
    to: filters.to,
    projectId: filters.projectId,
    clientId: filters.clientId,
    userId: filters.userId,
    includeRunning: true,
  });

  const buckets = new Map<string, ReportSummaryItem>();

  for (const entry of data) {
    let id: string;
    let name: string;
    let color: string | undefined;

    if (groupBy === 'project') {
      if (entry.projectId) {
        id = entry.projectId;
        name = entry.project
          ? `${entry.project.name}${entry.project.client ? ` - ${entry.project.client.name}` : ''}`
          : id;
        color = entry.project?.client?.color;
      } else {
        id = '__unassigned__';
        name = 'Sem projeto';
      }
    } else if (groupBy === 'client') {
      const clientId = entry.project?.clientId;
      if (!clientId) continue;
      const found = MOCK_CLIENTS.find((item) => item.id === clientId);
      id = clientId;
      name = found?.name ?? clientId;
      color = found?.color;
    } else if (groupBy === 'user') {
      id = entry.userId;
      name = entry.user?.name ?? findUser(entry.userId)?.name ?? entry.userId;
    } else {
      id = groupKeyForDate(entry.startedAt);
      name = id;
    }

    const seconds = entryDurationSeconds(entry);
    const existing = buckets.get(id);
    if (existing) {
      existing.totalSeconds += seconds;
    } else {
      buckets.set(id, { id, name, totalSeconds: seconds, color });
    }
  }

  return [...buckets.values()].sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function mockUserReport(
  userId: string,
  filters: { from?: string; to?: string },
): UserReport {
  const user = findUser(userId) ?? MOCK_USER;
  const byProject = mockReportSummary({ ...filters, userId, groupBy: 'project' });
  const byDay = mockReportSummary({ ...filters, userId, groupBy: 'day' });
  const totalSeconds = byProject.reduce((sum, item) => sum + item.totalSeconds, 0);
  return { user, totalSeconds, byProject, byDay };
}

export function mockListUsers(): User[] {
  return MOCK_USERS;
}

export function resetMockStore(): void {
  currentEntry = null;
  entries = createMockEntries();
  nextId = 200;
  persist();
}
