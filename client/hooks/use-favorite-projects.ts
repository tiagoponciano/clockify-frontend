'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  readFavoriteProjectIds,
  toggleFavoriteProjectId,
  writeFavoriteProjectIds,
} from '@/lib/favorite-projects';

export function useFavoriteProjects(userId: string | null | undefined) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(readFavoriteProjectIds(userId));
  }, [userId]);

  const isFavorite = useCallback(
    (projectId: string) => favoriteIds.includes(projectId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (projectId: string) => {
      if (!userId) return;
      const next = toggleFavoriteProjectId(userId, projectId);
      setFavoriteIds(next);
    },
    [userId],
  );

  const setFavorites = useCallback(
    (ids: string[]) => {
      if (!userId) return;
      writeFavoriteProjectIds(userId, ids);
      setFavoriteIds([...new Set(ids)]);
    },
    [userId],
  );

  return { favoriteIds, isFavorite, toggleFavorite, setFavorites };
}
