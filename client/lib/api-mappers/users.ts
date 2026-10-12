import type { User, UserRole } from '@/types/api';
import type { BackendRole, BackendUser } from './backend-types';

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
