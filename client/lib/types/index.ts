import type { UserRole, UserStatus } from './enums';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  status: UserStatus;
  role: UserRole;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export * from './enums';
