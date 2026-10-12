import { ApiError } from '@/lib/api';
import type {
  CreateTimeEntryInput,
  StartTimeEntryInput,
  UpdateTimeEntryInput,
} from '@/types/api';
import {
  MOCK_ACCESS_TOKEN,
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  MOCK_TAGS,
  MOCK_USER,
} from './data';
import {
  getMockCurrentEntry,
  mockCreateEntry,
  mockDeleteEntry,
  mockListEntries,
  mockListUsers,
  mockReportSummary,
  mockStartTimer,
  mockStopTimer,
  mockUpdateEntry,
  mockUserReport,
} from './store';

function parseBody<T>(init?: RequestInit): T {
  if (!init?.body || typeof init.body !== 'string') {
    return {} as T;
  }
  return JSON.parse(init.body) as T;
}

function matchPath(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split('?')[0].split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  if (pathParts.length !== patternParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i];
      continue;
    }
    if (part !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function parseQuery(path: string): Record<string, string> {
  const query = path.split('?')[1];
  if (!query) {
    return {};
  }
  return Object.fromEntries(new URLSearchParams(query));
}

export async function mockApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const method = (init.method ?? 'GET').toUpperCase();
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;

  if (method === 'GET' && cleanPath === '/api/auth/me') {
    return MOCK_USER as T;
  }

  if (method === 'POST' && cleanPath === '/api/auth/dev-login') {
    return { accessToken: MOCK_ACCESS_TOKEN } as T;
  }

  if (method === 'GET' && cleanPath === '/api/users') {
    return mockListUsers() as T;
  }

  if (method === 'GET' && cleanPath.startsWith('/api/reports/summary')) {
    const query = parseQuery(cleanPath);
    return mockReportSummary({
      from: query.from,
      to: query.to,
      groupBy: query.groupBy as 'project' | 'user' | 'client' | 'day' | undefined,
      projectId: query.projectId,
      clientId: query.clientId,
      userId: query.userId,
    }) as T;
  }

  const userReportMatch = matchPath(cleanPath.split('?')[0], '/api/reports/user/:userId');
  if (method === 'GET' && userReportMatch) {
    const query = parseQuery(cleanPath);
    return mockUserReport(userReportMatch.userId, {
      from: query.from,
      to: query.to,
    }) as T;
  }

  if (method === 'GET' && cleanPath === '/api/time-entries/current') {
    return getMockCurrentEntry() as T;
  }

  if (method === 'POST' && cleanPath === '/api/time-entries/start') {
    return mockStartTimer(parseBody<StartTimeEntryInput>(init)) as T;
  }

  if (method === 'POST' && cleanPath === '/api/time-entries/stop') {
    return mockStopTimer() as T;
  }

  if (method === 'GET' && cleanPath.startsWith('/api/time-entries')) {
    const query = parseQuery(cleanPath);
    return mockListEntries({
      userId: query.userId,
      from: query.from,
      to: query.to,
      projectId: query.projectId,
      clientId: query.clientId,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      includeRunning: query.includeRunning === 'true',
    }) as T;
  }

  if (method === 'POST' && cleanPath === '/api/time-entries') {
    return mockCreateEntry(parseBody<CreateTimeEntryInput>(init)) as T;
  }

  const entryMatch = matchPath(cleanPath, '/api/time-entries/:id');
  if (entryMatch) {
    if (method === 'PATCH') {
      return mockUpdateEntry(entryMatch.id, parseBody<UpdateTimeEntryInput>(init)) as T;
    }
    if (method === 'DELETE') {
      mockDeleteEntry(entryMatch.id);
      return undefined as T;
    }
  }

  if (method === 'GET' && cleanPath.startsWith('/api/projects/') && cleanPath.endsWith('/tags')) {
    const projectId = cleanPath.split('/')[3];
    return MOCK_TAGS.filter((tag) => tag.projectId === projectId) as T;
  }

  if (method === 'GET' && cleanPath.startsWith('/api/projects')) {
    const query = parseQuery(cleanPath);
    let projects = [...MOCK_PROJECTS];
    if (query.clientId) {
      projects = projects.filter((project) => project.clientId === query.clientId);
    }
    if (query.includeArchived !== 'true') {
      projects = projects.filter((project) => !project.isArchived);
    }
    return projects as T;
  }

  if (method === 'GET' && cleanPath === '/api/clients') {
    return MOCK_CLIENTS as T;
  }

  if (method === 'GET' && cleanPath === '/api/health') {
    return { status: 'ok', mock: true } as T;
  }

  throw new ApiError(404, `Mock não implementado: ${method} ${cleanPath}`);
}
