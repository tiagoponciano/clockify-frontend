'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useTimer } from '@/hooks/use-timer';
import {
  elapsedSecondsSince,
  getRecentEntriesFromUtc,
  getRecentEntriesToUtc,
} from '@/lib/datetime';

function resetDraft() {
  return { description: '', projectId: null as string | null, tagIds: [] as string[] };
}

/**
 * Draft (description, project, tags) of the timer bar, kept in sync with the
 * running entry: edits while running are patched onto it, and stopping
 * requires a project.
 */
export function useTimerBar() {
  const { user } = useAuth();
  const { currentEntry, isRunning, isLoading, start, stop, updateCurrent, isStarting, isStopping } =
    useTimer();
  const filters = useMemo(
    () => ({
      userId: user?.id,
      from: getRecentEntriesFromUtc(),
      to: getRecentEntriesToUtc(),
      limit: 200,
    }),
    [user?.id],
  );
  const { createEntry } = useTimeEntries(filters);

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasRunningRef = useRef(false);

  const effectiveProjectId = projectId ?? currentEntry?.projectId ?? null;
  const needsProjectToStop = isRunning && !effectiveProjectId;

  useEffect(() => {
    if (!currentEntry) {
      if (wasRunningRef.current) {
        const draft = resetDraft();
        setDescription(draft.description);
        setProjectId(draft.projectId);
        setTagIds(draft.tagIds);
        wasRunningRef.current = false;
      }
      return;
    }
    wasRunningRef.current = true;
    setDescription(currentEntry.description ?? '');
    setProjectId(currentEntry.projectId);
    setTagIds(currentEntry.tags?.map((tag) => tag.id) ?? []);
  }, [currentEntry?.id, currentEntry?.description, currentEntry?.projectId, currentEntry?.tags, currentEntry]);

  useEffect(() => {
    if (!isRunning || !currentEntry?.startedAt) {
      return;
    }
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, currentEntry?.startedAt]);

  void tick;

  const elapsed =
    isRunning && currentEntry?.startedAt ? elapsedSecondsSince(currentEntry.startedAt) : 0;

  const patchCurrent = (patch: { description?: string; projectId?: string; tagIds?: string[] }) => {
    if (!currentEntry || currentEntry.id === 'optimistic') {
      return;
    }
    void updateCurrent({ id: currentEntry.id, input: patch });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (!isRunning || !currentEntry) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      patchCurrent({ description: value });
    }, 500);
  };

  const handleProjectChange = (nextProjectId: string) => {
    if (nextProjectId === projectId) {
      return;
    }
    setProjectId(nextProjectId);
    setTagIds([]);
    if (isRunning && currentEntry) {
      patchCurrent({ projectId: nextProjectId, tagIds: [] });
    }
  };

  const handleTagsChange = (nextTagIds: string[]) => {
    setTagIds(nextTagIds);
    if (isRunning && currentEntry) {
      patchCurrent({ tagIds: nextTagIds });
    }
  };

  const handleToggle = async () => {
    if (isRunning) {
      if (!effectiveProjectId) {
        toast.error('Selecione um projeto antes de parar o timer.');
        return;
      }
      if (currentEntry && (!currentEntry.projectId || currentEntry.projectId !== projectId) && projectId) {
        await updateCurrent({
          id: currentEntry.id,
          input: { projectId, tagIds, description: description.trim() },
        });
      }
      await stop();
      toast.success('Apontamento registrado.');
      return;
    }
    await start({
      projectId: projectId ?? undefined,
      description: description || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    });
  };

  return {
    description,
    projectId,
    tagIds,
    elapsed,
    isRunning,
    isLoading,
    isBusy: isLoading || isStarting || isStopping,
    needsProjectToStop,
    manualOpen,
    setManualOpen,
    createEntry,
    handleDescriptionChange,
    handleProjectChange,
    handleTagsChange,
    handleToggle,
  };
}
