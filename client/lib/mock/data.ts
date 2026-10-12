import { fromZonedTime } from 'date-fns-tz';
import { TIMEZONE, formatLocal, getWeekRange } from '@/lib/datetime';
import type { Client, Project, Tag, TimeEntry, User } from '@/types/api';

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

function localRange(dateKey: string, startH: number, startM: number, endH: number, endM: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const startedAt = fromZonedTime(new Date(year, month - 1, day, startH, startM, 0, 0), TIMEZONE).toISOString();
  const endedAt = fromZonedTime(new Date(year, month - 1, day, endH, endM, 0, 0), TIMEZONE).toISOString();
  const duration = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
  return { startedAt, endedAt, duration };
}

function withProject(
  entry: Omit<TimeEntry, 'project' | 'tags' | 'user'> & { tagIds?: string[] },
): TimeEntry {
  const project = MOCK_PROJECTS.find((item) => item.id === entry.projectId);
  const user = MOCK_USERS.find((item) => item.id === entry.userId);
  const tags = entry.tagIds ? MOCK_TAGS.filter((tag) => entry.tagIds!.includes(tag.id)) : [];
  const { tagIds: _tagIds, ...rest } = entry;
  return { ...rest, project, tags, user };
}

type Seed = {
  userId: string;
  projectId: string;
  description: string;
  dayIndex: number;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  tagIds?: string[];
};

export function createMockEntries(): TimeEntry[] {
  const { days } = getWeekRange(0);
  const seeds: Seed[] = [
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[2].id, description: 'preenchendo pdi', dayIndex: 0, startH: 9, startM: 0, endH: 12, endM: 30, tagIds: [MOCK_TAGS[3].id] },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[0].id, description: 'Feedback NRT', dayIndex: 0, startH: 13, startM: 30, endH: 17, endM: 45, tagIds: [MOCK_TAGS[0].id] },
    { userId: MOCK_USERS[1].id, projectId: MOCK_PROJECTS[0].id, description: 'review sprint', dayIndex: 0, startH: 10, startM: 0, endH: 15, endM: 0, tagIds: [MOCK_TAGS[1].id] },
    { userId: MOCK_USERS[2].id, projectId: MOCK_PROJECTS[4].id, description: 'calibração sensores', dayIndex: 0, startH: 8, startM: 30, endH: 12, endM: 0 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[2].id, description: 'reunião time', dayIndex: 1, startH: 9, startM: 0, endH: 10, endM: 30, tagIds: [MOCK_TAGS[4].id] },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[3].id, description: 'fechamento mensal', dayIndex: 1, startH: 10, startM: 45, endH: 14, endM: 15 },
    { userId: MOCK_USERS[1].id, projectId: MOCK_PROJECTS[1].id, description: 'homologação BL007', dayIndex: 1, startH: 9, startM: 0, endH: 16, endM: 0 },
    { userId: MOCK_USERS[3].id, projectId: MOCK_PROJECTS[4].id, description: 'docs E141', dayIndex: 1, startH: 11, startM: 0, endH: 15, endM: 30 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[0].id, description: 'fin + integrantes', dayIndex: 2, startH: 9, startM: 0, endH: 13, endM: 20, tagIds: [MOCK_TAGS[1].id] },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[2].id, description: 'planejamento semana', dayIndex: 2, startH: 14, startM: 0, endH: 17, endM: 0, tagIds: [MOCK_TAGS[3].id] },
    { userId: MOCK_USERS[2].id, projectId: MOCK_PROJECTS[0].id, description: 'bugfix auth', dayIndex: 2, startH: 8, startM: 0, endH: 12, endM: 45, tagIds: [MOCK_TAGS[0].id] },
    { userId: MOCK_USERS[3].id, projectId: MOCK_PROJECTS[2].id, description: 'onboarding', dayIndex: 2, startH: 13, startM: 0, endH: 16, endM: 30 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[4].id, description: 'sync cliente', dayIndex: 3, startH: 9, startM: 30, endH: 11, endM: 0 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[0].id, description: 'implementação API', dayIndex: 3, startH: 11, startM: 15, endH: 18, endM: 0, tagIds: [MOCK_TAGS[0].id] },
    { userId: MOCK_USERS[1].id, projectId: MOCK_PROJECTS[3].id, description: 'forecast', dayIndex: 3, startH: 10, startM: 0, endH: 14, endM: 0 },
    { userId: MOCK_USERS[2].id, projectId: MOCK_PROJECTS[1].id, description: 'QA regressão', dayIndex: 3, startH: 9, startM: 0, endH: 17, endM: 0 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[2].id, description: 'atividades gerais', dayIndex: 4, startH: 8, startM: 30, endH: 12, endM: 0 },
    { userId: MOCK_USERS[0].id, projectId: MOCK_PROJECTS[1].id, description: 'deploy staging', dayIndex: 4, startH: 13, startM: 0, endH: 16, endM: 45 },
    { userId: MOCK_USERS[1].id, projectId: MOCK_PROJECTS[0].id, description: '1:1 time', dayIndex: 4, startH: 9, startM: 0, endH: 11, endM: 30, tagIds: [MOCK_TAGS[1].id] },
    { userId: MOCK_USERS[3].id, projectId: MOCK_PROJECTS[4].id, description: 'testes hardware', dayIndex: 4, startH: 10, startM: 0, endH: 15, endM: 0 },
    { userId: MOCK_USERS[2].id, projectId: MOCK_PROJECTS[2].id, description: 'estudo interno', dayIndex: 5, startH: 10, startM: 0, endH: 12, endM: 0 },
    { userId: MOCK_USERS[1].id, projectId: MOCK_PROJECTS[2].id, description: 'backlog grooming', dayIndex: 5, startH: 9, startM: 0, endH: 11, endM: 0 },
  ];

  const completed = seeds
    .filter((seed) => seed.dayIndex < days.length)
    .map((seed, index) => {
      const dateKey = days[seed.dayIndex];
      const range = localRange(dateKey, seed.startH, seed.startM, seed.endH, seed.endM);
      return withProject({
        id: `e${String(index + 1).padStart(7, '0')}-1111-4111-8111-111111111111`,
        userId: seed.userId,
        projectId: seed.projectId,
        description: seed.description,
        startedAt: range.startedAt,
        endedAt: range.endedAt,
        duration: range.duration,
        tagIds: seed.tagIds,
        createdAt: range.startedAt,
        updatedAt: range.endedAt,
      });
    });

  // Entries em andamento (outros usuários) — não entram no currentEntry do mock user
  const todayKey = formatLocal(new Date(), 'yyyy-MM-dd');
  const [y, m, d] = todayKey.split('-').map(Number);
  const runningStart = fromZonedTime(new Date(y, m - 1, d, 9, 15, 0, 0), TIMEZONE).toISOString();
  const running: TimeEntry[] = [
    withProject({
      id: 'e0000090-1111-4111-8111-111111111111',
      userId: MOCK_USERS[1].id,
      projectId: MOCK_PROJECTS[0].id,
      description: 'Localizador de teclado',
      startedAt: runningStart,
      endedAt: null,
      duration: null,
      tagIds: [MOCK_TAGS[0].id],
      createdAt: runningStart,
      updatedAt: runningStart,
    }),
    withProject({
      id: 'e0000091-1111-4111-8111-111111111111',
      userId: MOCK_USERS[2].id,
      projectId: MOCK_PROJECTS[4].id,
      description: 'Validação firmware',
      startedAt: fromZonedTime(new Date(y, m - 1, d, 10, 0, 0, 0), TIMEZONE).toISOString(),
      endedAt: null,
      duration: null,
      createdAt: fromZonedTime(new Date(y, m - 1, d, 10, 0, 0, 0), TIMEZONE).toISOString(),
      updatedAt: fromZonedTime(new Date(y, m - 1, d, 10, 0, 0, 0), TIMEZONE).toISOString(),
    }),
  ];

  // Uma entry da semana passada para navegar período
  const prevWeek = getWeekRange(-1);
  const prevDay = prevWeek.days[2];
  const prevRange = localRange(prevDay, 9, 0, 17, 0);
  completed.push(
    withProject({
      id: 'e0000080-1111-4111-8111-111111111111',
      userId: MOCK_USERS[0].id,
      projectId: MOCK_PROJECTS[2].id,
      description: 'semana anterior',
      startedAt: prevRange.startedAt,
      endedAt: prevRange.endedAt,
      duration: prevRange.duration,
      createdAt: prevRange.startedAt,
      updatedAt: prevRange.endedAt,
    }),
  );

  return [...running, ...completed].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export const MOCK_ACCESS_TOKEN = 'mock-dev-token';
