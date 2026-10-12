import type { TimeEntry, User } from '@/types/api';
import { MOCK_PROJECTS, MOCK_TAGS, MOCK_USERS } from './data';
import { createMockEntries } from './mock-entries';

const STORAGE_KEY = 'clockify.mock.store.v2';

/** In-memory mock database, mirrored to localStorage. */
export const state = {
  currentEntry: null as TimeEntry | null,
  entries: createMockEntries(),
  nextId: 200,
  hydrated: false,
};

export function newId(): string {
  const suffix = String(state.nextId++).padStart(12, '0');
  return `e0000000-0000-4000-8000-${suffix}`;
}

export function findUser(userId: string): User | undefined {
  return MOCK_USERS.find((item) => item.id === userId);
}

export function enrichEntry(entry: TimeEntry): TimeEntry {
  const project = entry.projectId ? MOCK_PROJECTS.find((item) => item.id === entry.projectId) : undefined;
  const tags = entry.tags?.map((tag) => MOCK_TAGS.find((item) => item.id === tag.id) ?? tag) ?? [];
  const user = entry.user ?? findUser(entry.userId);
  return { ...entry, project, tags, user };
}

export function persist(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentEntry: state.currentEntry,
        entries: state.entries,
        nextId: state.nextId,
      }),
    );
  } catch {
    // ignore quota errors
  }
}

export function hydrate(): void {
  if (state.hydrated || typeof window === 'undefined') {
    return;
  }
  state.hydrated = true;
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
    state.currentEntry = parsed.currentEntry;
    state.entries = Array.isArray(parsed.entries) && parsed.entries.length > 0 ? parsed.entries : createMockEntries();
    state.nextId = typeof parsed.nextId === 'number' ? parsed.nextId : 200;
  } catch {
    // ignore corrupt storage
  }
}

export function allEntries(): TimeEntry[] {
  hydrate();
  const list = state.entries.map(enrichEntry);
  if (state.currentEntry) {
    const enriched = enrichEntry(state.currentEntry);
    if (!list.some((entry) => entry.id === enriched.id)) {
      list.unshift(enriched);
    }
  }
  return list;
}

export function resetMockStore(): void {
  state.currentEntry = null;
  state.entries = createMockEntries();
  state.nextId = 200;
  persist();
}
