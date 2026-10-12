const STORAGE_PREFIX = 'clockify.favoriteProjects.';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function readFavoriteProjectIds(userId: string | null | undefined): string[] {
  if (!userId || typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function writeFavoriteProjectIds(userId: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify([...new Set(ids)]));
  } catch {
    // ignore quota / private mode
  }
}

export function toggleFavoriteProjectId(userId: string, projectId: string): string[] {
  const current = readFavoriteProjectIds(userId);
  const next = current.includes(projectId)
    ? current.filter((id) => id !== projectId)
    : [projectId, ...current];
  writeFavoriteProjectIds(userId, next);
  return next;
}
