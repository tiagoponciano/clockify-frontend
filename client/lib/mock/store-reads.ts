import { entryDurationSeconds, groupKeyForDate } from '@/lib/datetime';
import type { ReportGroupBy, ReportSummaryItem, TimeEntry, User, UserReport } from '@/types/api';
import { MOCK_CLIENTS, MOCK_USER, MOCK_USERS } from './data';
import { allEntries, findUser } from './store-state';

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
