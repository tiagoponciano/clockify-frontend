import type { Client, Project, Tag, User } from '@/types/api';

const now = new Date().toISOString();

export const MOCK_USER: User = {
  id: 'a1111111-1111-4111-8111-111111111111',
  email: 'tiago@neo.local',
  name: 'Tiago P.',
  picture: null,
  status: 'APPROVED',
  role: 'ADMIN',
};

export const MOCK_USERS: User[] = [
  MOCK_USER,
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    email: 'ana@neo.local',
    name: 'Ana R.',
    picture: null,
    status: 'APPROVED',
    role: 'LEADER',
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    email: 'bruno@neo.local',
    name: 'Bruno M.',
    picture: null,
    status: 'APPROVED',
    role: 'MEMBER',
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444',
    email: 'carla@neo.local',
    name: 'Carla S.',
    picture: null,
    status: 'APPROVED',
    role: 'MEMBER',
  },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    name: 'Balancer Labs',
    color: '#94a3b8',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    name: 'NEO',
    color: '#f97316',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    name: 'Nidec/Embraco',
    color: '#14b8a6',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

const client = (id: string) => MOCK_CLIENTS.find((item) => item.id === id);

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1111111-1111-4111-8111-111111111111',
    name: 'BL008',
    clientId: MOCK_CLIENTS[0].id,
    client: client(MOCK_CLIENTS[0].id),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p2222222-2222-4222-8222-222222222222',
    name: 'BL007',
    clientId: MOCK_CLIENTS[0].id,
    client: client(MOCK_CLIENTS[0].id),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p3333333-3333-4333-8333-333333333333',
    name: 'Atividades Gerais',
    clientId: MOCK_CLIENTS[1].id,
    client: client(MOCK_CLIENTS[1].id),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p4444444-4444-4444-8444-444444444444',
    name: 'Financeiro',
    clientId: MOCK_CLIENTS[1].id,
    client: client(MOCK_CLIENTS[1].id),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p5555555-5555-4555-8555-555555555555',
    name: 'E141',
    clientId: MOCK_CLIENTS[2].id,
    client: client(MOCK_CLIENTS[2].id),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_TAGS: Tag[] = [
  {
    id: 't1111111-1111-4111-8111-111111111111',
    name: 'Execução',
    projectId: MOCK_PROJECTS[0].id,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't2222222-2222-4222-8222-222222222222',
    name: 'Gerência',
    projectId: MOCK_PROJECTS[0].id,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't3333333-3333-4333-8333-333333333333',
    name: 'Planejamento',
    projectId: MOCK_PROJECTS[0].id,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't4444444-4444-4444-8444-444444444444',
    name: 'PDI',
    projectId: MOCK_PROJECTS[2].id,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't5555555-5555-4555-8555-555555555555',
    name: 'Reunião',
    projectId: MOCK_PROJECTS[2].id,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_ACCESS_TOKEN = 'mock-dev-token';
