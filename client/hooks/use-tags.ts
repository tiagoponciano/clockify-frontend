'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTags, queryKeys } from '@/lib/queries';

export function useTags(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.tags(projectId ?? ''),
    queryFn: () => fetchTags(projectId!),
    enabled: !!projectId,
  });
}
