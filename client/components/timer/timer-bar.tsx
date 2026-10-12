'use client';

import { ManualEntryDialog } from '@/components/entries/manual-entry-dialog';
import { ProjectCombobox } from '@/components/timer/project-combobox';
import { TagSelector } from '@/components/timer/tag-selector';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Input } from '@/components/ui/input';
import { useTimerBar } from '@/hooks/use-timer-bar';
import { formatDurationHMS } from '@/lib/datetime';
import { TimerModeToggle } from './timer-mode-toggle';

export function TimerBar() {
  const {
    description,
    projectId,
    tagIds,
    elapsed,
    isRunning,
    isLoading,
    isBusy,
    needsProjectToStop,
    manualOpen,
    setManualOpen,
    createEntry,
    handleDescriptionChange,
    handleProjectChange,
    handleTagsChange,
    handleToggle,
  } = useTimerBar();

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
              disabled={isBusy}
              className="min-w-[88px] font-semibold"
              title={needsProjectToStop ? 'Selecione um projeto para parar' : undefined}
            >
              {isRunning ? 'STOP' : 'START'}
            </Button>

            <TimerModeToggle onManualClick={() => setManualOpen(true)} />
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
