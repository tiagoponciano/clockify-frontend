'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { entryDurationSeconds } from '@/lib/datetime';
import {
  createTimeEntry,
  deleteTimeEntry,
  fetchTimeEntries,
  queryKeys,
  updateTimeEntry,
} from '@/lib/queries';
import type { CreateTimeEntryInput, PaginatedResponse, TimeEntry, UpdateTimeEntryInput } from '@/types/api';

export function useTimeEntries(filters: {
  from?: string;
  to?: string;
  userId?: string;
  projectId?: string;
  tagId?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.timeEntries(filters);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTimeEntries(filters),
    enabled: Boolean(filters.from),
  });

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
    ]);

  const createMutation = useMutation({
    mutationFn: (input: CreateTimeEntryInput) => {
      if (!input.projectId) {
        throw new Error('Selecione um projeto.');
      }
      return createTimeEntry(input);
    },
    onSuccess: () => {
      void invalidate();
      toast.success('Apontamento criado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTimeEntryInput }) => updateTimeEntry(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success('Apontamento atualizado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PaginatedResponse<TimeEntry>>(queryKey);
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<TimeEntry>>(queryKey, {
          ...previous,
          data: previous.data.filter((entry) => entry.id !== id),
          total: Math.max(0, previous.total - 1),
        });
      }
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => {
      void invalidate();
      toast.success('Apontamento excluído.');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (entry: TimeEntry) => {
      if (!entry.projectId) {
        throw new Error('Não é possível duplicar um apontamento sem projeto.');
      }
      const startedAt = new Date();
      const durationMs = entryDurationSeconds(entry) * 1000;
      const endedAt = new Date(startedAt.getTime() + durationMs);
      return createTimeEntry({
        projectId: entry.projectId,
        description: entry.description ?? undefined,
        tagIds: entry.tags?.map((tag) => tag.id),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      });
    },
    onSuccess: () => {
      void invalidate();
      toast.success('Apontamento duplicado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    entries: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    duplicateEntry: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
