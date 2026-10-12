export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  status: UserStatus;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client?: Client;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  user?: User;
  projectId: string | null;
  project?: Project & { client?: Client };
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportSummaryItem {
  id: string;
  name: string;
  totalSeconds: number;
  color?: string;
}

export type ReportGroupBy = 'project' | 'user' | 'client' | 'day';

export interface UserReport {
  user: User;
  totalSeconds: number;
  byProject: ReportSummaryItem[];
  byDay: ReportSummaryItem[];
}

export interface StartTimeEntryInput {
  projectId?: string;
  description?: string;
  tagIds?: string[];
}

export interface CreateTimeEntryInput {
  projectId: string;
  description?: string;
  tagIds?: string[];
  startedAt: string;
  endedAt: string;
}

export interface UpdateTimeEntryInput {
  projectId?: string | null;
  description?: string | null;
  tagIds?: string[];
  startedAt?: string;
  endedAt?: string | null;
}

export interface CreateClientInput {
  name: string;
  color?: string;
}

export interface UpdateClientInput {
  name?: string;
  color?: string;
  isActive?: boolean;
}

export interface CreateProjectInput {
  name: string;
  clientId: string;
}

export interface UpdateProjectInput {
  name?: string;
  clientId?: string;
  isArchived?: boolean;
}

export interface CreateTagInput {
  name: string;
}

export interface UpdateTagInput {
  name: string;
}

export interface DevLoginInput {
  email: string;
  name?: string;
}

export function canManageResources(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'LEADER';
}

export function formatProjectLabel(project: { name: string; client?: { name: string } | null }): string {
  const clientName = project.client?.name;
  return clientName ? `${project.name} - ${clientName}` : project.name;
}
