import type { TimeEntry } from '@/types/api';

/* Response shapes of the Nest backend, before mapping to the frontend contract. */

export type BackendRole = 'admin' | 'manager' | 'member' | string;

export type BackendUser = {
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

export type BackendSummaryEnvelope = {
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

export type BackendUserReport = {
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

export type BackendPaginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type BackendTimeEntry = {
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
