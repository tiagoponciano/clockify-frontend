'use client';

import { ListPlus, Timer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ManualEntryDialog } from '@/components/entries/manual-entry-dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { ProjectCombobox } from '@/components/timer/project-combobox';
import { TagSelector } from '@/components/timer/tag-selector';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Input } from '@/components/ui/input';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useTimer } from '@/hooks/use-timer';
import {
  elapsedSecondsSince,
  formatDurationHMS,
  getRecentEntriesFromUtc,
  getRecentEntriesToUtc,
} from '@/lib/datetime';

function resetDraft() {
  return { description: '', projectId: null as string | null, tagIds: [] as string[] };
}

export function TimerBar() {
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

  return (
    <>
      <div className="border-border bg-card sticky top-0 z-10 border-b shadow-sm">
        <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:gap-2 lg:px-4">
          <Input
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            placeholder="Em que você trabalhou?"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 lg:min-w-0 lg:flex-1"
            disabled={isLoading}
          />

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <ProjectCombobox
              value={projectId}
              onChange={handleProjectChange}
              disabled={isLoading}
              highlight={needsProjectToStop}
            />
            <TagSelector
              projectId={projectId}
              value={tagIds}
              onChange={handleTagsChange}
              disabled={isLoading}
            />

            <div
              className={cn(
                'min-w-[100px] text-center font-mono text-xl font-semibold tabular-nums tracking-tight',
                isRunning && 'text-primary',
              )}
            >
              {formatDurationHMS(elapsed)}
            </div>

            <Button
              variant={isRunning ? 'destructive' : 'default'}
              onClick={() => void handleToggle()}
              disabled={isLoading || isStarting || isStopping}
              className="min-w-[88px] font-semibold"
              title={needsProjectToStop ? 'Selecione um projeto para parar' : undefined}
            >
              {isRunning ? 'STOP' : 'START'}
            </Button>

            <div className="border-border flex overflow-hidden rounded-md border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-muted/50 size-9 rounded-none"
                aria-label="Modo timer"
                title="Modo timer"
                disabled
              >
                <Timer className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-none"
                aria-label="Adicionar manualmente"
                title="Adicionar manualmente"
                onClick={() => setManualOpen(true)}
              >
                <ListPlus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ManualEntryDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSubmit={async (values) => {
          await createEntry(values);
        }}
      />
    </>
  );
}
