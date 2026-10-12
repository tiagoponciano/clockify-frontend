import type {
  CreateTimeEntryInput,
  StartTimeEntryInput,
  TimeEntry,
  UpdateTimeEntryInput,
} from '@/types/api';
import { MOCK_TAGS, MOCK_USER } from './data';
import { enrichEntry, hydrate, newId, persist, state } from './store-state';

export function getMockCurrentEntry(): TimeEntry | null {
  hydrate();
  return state.currentEntry ? enrichEntry(state.currentEntry) : null;
}

export function mockStartTimer(input: StartTimeEntryInput): TimeEntry {
  hydrate();
  if (state.currentEntry?.projectId) {
    mockStopTimer();
  } else if (state.currentEntry) {
    state.currentEntry = null;
  }

  const tags = input.tagIds ? MOCK_TAGS.filter((tag) => input.tagIds!.includes(tag.id)) : [];
  state.currentEntry = enrichEntry({
    id: newId(),
    userId: MOCK_USER.id,
    user: MOCK_USER,
    projectId: input.projectId ?? null,
    description: input.description ?? null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    duration: null,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  persist();
  return state.currentEntry;
}

export function mockStopTimer(): TimeEntry {
  hydrate();
  if (!state.currentEntry) {
    throw new Error('Nenhum timer em execução.');
  }
  if (!state.currentEntry.projectId) {
    throw new Error('Selecione um projeto antes de parar o timer.');
  }

  const endedAt = new Date().toISOString();
  const duration = Math.floor(
    (new Date(endedAt).getTime() - new Date(state.currentEntry.startedAt).getTime()) / 1000,
  );
  const stopped: TimeEntry = enrichEntry({
    ...state.currentEntry,
    endedAt,
    duration,
    updatedAt: endedAt,
  });
  state.entries = [stopped, ...state.entries.filter((entry) => entry.id !== stopped.id)];
  state.currentEntry = null;
  persist();
  return stopped;
}

export function mockUpdateEntry(id: string, input: UpdateTimeEntryInput): TimeEntry {
  hydrate();
  if (state.currentEntry?.id === id) {
    const tagIds = input.tagIds;
    const tags = tagIds ? MOCK_TAGS.filter((tag) => tagIds.includes(tag.id)) : state.currentEntry.tags;
    state.currentEntry = enrichEntry({
      ...state.currentEntry,
      description: input.description !== undefined ? input.description : state.currentEntry.description,
      projectId: input.projectId !== undefined ? input.projectId : state.currentEntry.projectId,
      startedAt: input.startedAt ?? state.currentEntry.startedAt,
      endedAt: input.endedAt !== undefined ? input.endedAt : state.currentEntry.endedAt,
      tags,
      updatedAt: new Date().toISOString(),
    });
    persist();
    return state.currentEntry;
  }

  const index = state.entries.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Apontamento não encontrado.');
  }

  const tagIds = input.tagIds;
  const tags = tagIds ? MOCK_TAGS.filter((tag) => tagIds.includes(tag.id)) : state.entries[index].tags;
  const updated = enrichEntry({
    ...state.entries[index],
    description: input.description !== undefined ? input.description : state.entries[index].description,
    projectId: input.projectId !== undefined ? input.projectId : state.entries[index].projectId,
    startedAt: input.startedAt ?? state.entries[index].startedAt,
    endedAt: input.endedAt !== undefined ? input.endedAt : state.entries[index].endedAt,
    tags,
    updatedAt: new Date().toISOString(),
  });
  state.entries[index] = updated;
  persist();
  return updated;
}

export function mockCreateEntry(input: CreateTimeEntryInput): TimeEntry {
  hydrate();
  const duration = Math.floor(
    (new Date(input.endedAt).getTime() - new Date(input.startedAt).getTime()) / 1000,
  );
  const tags = input.tagIds ? MOCK_TAGS.filter((tag) => input.tagIds!.includes(tag.id)) : [];
  const created = enrichEntry({
    id: newId(),
    userId: MOCK_USER.id,
    user: MOCK_USER,
    projectId: input.projectId,
    description: input.description ?? null,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    duration,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  state.entries = [created, ...state.entries];
  persist();
  return created;
}

export function mockDeleteEntry(id: string): void {
  hydrate();
  state.entries = state.entries.filter((entry) => entry.id !== id);
  if (state.currentEntry?.id === id) {
    state.currentEntry = null;
  }
  persist();
}
