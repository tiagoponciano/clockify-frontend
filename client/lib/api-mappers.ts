import type {
  PaginatedResponse,
  ReportSummaryItem,
  TimeEntry,
  User,
  UserReport,
  UserRole,
} from '@/types/api';

type BackendRole = 'admin' | 'manager' | 'member' | string;

type BackendUser = {
  id: string;
  email: string;
  name: string;
  acronym?: string;
  avatarUrl?: string | null;
  picture?: string | null;
  role: BackendRole;
  isActive?: boolean;
  status?: string;
};

type BackendSummaryEnvelope = {
  groupBy?: string;
  from?: string;
  to?: string;
  items: Array<{
    id?: string | null;
    name?: string | null;
    day?: string;
    totalSeconds: number;
    color?: string;
  }>;
};

type BackendUserReport = {
  userId: string;
  from: string;
  to: string;
  totalSeconds: number;
  byProject: Array<{
    projectId: string | null;
    projectName: string | null;
    totalSeconds: number;
  }>;
};

type BackendPaginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type BackendTimeEntry = {
  id: string;
  userId: string;
  projectId: string | null;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
  project?: TimeEntry['project'];
  tags?: TimeEntry['tags'];
  user?: BackendUser;
};

export function mapBackendRole(role: BackendRole): UserRole {
  switch (role) {
    case 'admin':
    case 'ADMIN':
      return 'ADMIN';
    case 'manager':
    case 'LEADER':
      return 'LEADER';
    default:
      return 'MEMBER';
  }
}

export function mapBackendUser(raw: BackendUser): User {
  const isActive = raw.isActive ?? raw.status !== 'REJECTED';
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    picture: raw.picture ?? raw.avatarUrl ?? null,
    status: isActive ? 'APPROVED' : 'REJECTED',
    role: mapBackendRole(raw.role),
  };
}

export function mapBackendUsers(raw: unknown): User[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => mapBackendUser(item as BackendUser));
}

export function mapReportSummary(raw: unknown): ReportSummaryItem[] {
  const items = Array.isArray(raw)
    ? raw
    : ((raw as BackendSummaryEnvelope | null)?.items ?? []);

  return items.map((item) => {
    const day = item.day;
    const id = item.id ?? day ?? 'unknown';
    const name = item.name ?? day ?? 'Sem nome';
    return {
      id: String(id),
      name: String(name),
      totalSeconds: Number(item.totalSeconds ?? 0),
      color: item.color,
    };
  });
}

export function mapUserReport(raw: unknown, fallbackUser?: User | null): UserReport {
  const body = raw as BackendUserReport & Partial<UserReport>;
  if (body.user && Array.isArray(body.byProject) && Array.isArray(body.byDay)) {
    return {
      user: mapBackendUser(body.user as unknown as BackendUser),
      totalSeconds: body.totalSeconds,
      byProject: body.byProject as ReportSummaryItem[],
      byDay: body.byDay,
    };
  }

  const byProject: ReportSummaryItem[] = (body.byProject ?? []).map((item) => ({
    id: item.projectId ?? 'none',
    name: item.projectName ?? 'Sem projeto',
    totalSeconds: Number(item.totalSeconds ?? 0),
  }));

  return {
    user:
      fallbackUser ??
      ({
        id: body.userId,
        email: '',
        name: body.userId,
        picture: null,
        status: 'APPROVED',
        role: 'MEMBER',
      } satisfies User),
    totalSeconds: Number(body.totalSeconds ?? 0),
    byProject,
    byDay: [],
  };
}

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

export function mapClientRecord<T extends { createdAt: string; updatedAt?: string }>(raw: T): T & {
  updatedAt: string;
} {
  return {
    ...raw,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}
