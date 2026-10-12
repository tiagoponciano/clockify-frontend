'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import {
  fetchCurrentEntry,
  queryKeys,
  startTimer,
  stopTimer,
  updateTimeEntry,
} from '@/lib/queries';
import type { PaginatedResponse, StartTimeEntryInput, TimeEntry, UpdateTimeEntryInput } from '@/types/api';

export function useTimer() {
  const queryClient = useQueryClient();

  const currentQuery = useQuery({
    queryKey: queryKeys.timer.current,
    queryFn: fetchCurrentEntry,
    refetchOnWindowFocus: true,
  });

  const invalidateTimerQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.timer.current }),
      queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
    ]);
  };

  const startMutation = useMutation({
    mutationFn: (input: StartTimeEntryInput) => startTimer(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timer.current });
      const previous = queryClient.getQueryData<TimeEntry | null>(queryKeys.timer.current);
      const optimistic: TimeEntry = {
        id: 'optimistic',
        userId: '',
        projectId: input.projectId ?? null,
        description: input.description ?? null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        duration: null,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData(queryKeys.timer.current, optimistic);
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(queryKeys.timer.current, context?.previous ?? null);
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => {
      void invalidateTimerQueries();
    },
  });

  const stopMutation = useMutation({
    mutationFn: stopTimer,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timer.current });
      const previous = queryClient.getQueryData<TimeEntry | null>(queryKeys.timer.current);
      queryClient.setQueryData(queryKeys.timer.current, null);
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(queryKeys.timer.current, context?.previous ?? null);
      toast.error(getErrorMessage(error));
    },
    onSuccess: async (stoppedEntry) => {
      queryClient.setQueriesData<PaginatedResponse<TimeEntry>>(
        { queryKey: ['time-entries'] },
        (old) => {
          if (!old) {
            return {
              data: [stoppedEntry],
              total: 1,
              page: 1,
              limit: 200,
            };
          }
          if (old.data.some((entry) => entry.id === stoppedEntry.id)) {
            return old;
          }
          return {
            ...old,
            data: [stoppedEntry, ...old.data],
            total: old.total + 1,
          };
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.timer.current }),
        queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTimeEntryInput }) => updateTimeEntry(id, input),
    onSuccess: (entry) => {
      queryClient.setQueryData(queryKeys.timer.current, entry);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    currentEntry: currentQuery.data ?? null,
    isLoading: currentQuery.isLoading,
    isRunning: !!currentQuery.data,
    start: startMutation.mutateAsync,
    stop: stopMutation.mutateAsync,
    updateCurrent: updateMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
}
