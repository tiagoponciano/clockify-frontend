'use client';

import { useMemo, useState } from 'react';
import { EntryEditDialog } from '@/components/entries/entry-edit-dialog';
import { EntryRow } from '@/components/entries/entry-row';
import { ManualEntryDialog } from '@/components/entries/manual-entry-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useTimer } from '@/hooks/use-timer';
import {
  entryDurationSeconds,
  formatCompactDayLabel,
  formatDurationHMS,
  formatWeekBucketLabel,
  getRecentEntriesFromUtc,
  getRecentEntriesToUtc,
  groupKeyForDate,
  weekStartKeyForDay,
} from '@/lib/datetime';
import type { TimeEntry } from '@/types/api';

type DayGroup = { dayKey: string; entries: TimeEntry[]; totalSeconds: number };
type WeekGroup = { weekKey: string; days: DayGroup[]; totalSeconds: number };

export function EntriesList() {
  const { user } = useAuth();
  const { start } = useTimer();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const filters = useMemo(
    () => ({
      userId: user?.id,
      from: getRecentEntriesFromUtc(),
      to: getRecentEntriesToUtc(),
      limit: 200,
    }),
    [user?.id],
  );

  const { entries, isLoading, updateEntry, deleteEntry, duplicateEntry, createEntry } =
    useTimeEntries(filters);

  const weeks = useMemo(() => {
    const byDay = new Map<string, TimeEntry[]>();
    for (const entry of entries.filter((item) => item.endedAt)) {
      const key = groupKeyForDate(entry.startedAt);
      const list = byDay.get(key) ?? [];
      list.push(entry);
      byDay.set(key, list);
    }

    const byWeek = new Map<string, DayGroup[]>();
    const dayKeys = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
    for (const dayKey of dayKeys) {
      const dayEntries = byDay.get(dayKey) ?? [];
      const totalSeconds = dayEntries.reduce((sum, entry) => sum + entryDurationSeconds(entry), 0);
      const weekKey = weekStartKeyForDay(dayKey);
      const days = byWeek.get(weekKey) ?? [];
      days.push({ dayKey, entries: dayEntries, totalSeconds });
      byWeek.set(weekKey, days);
    }

    return [...byWeek.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(
        ([weekKey, days]): WeekGroup => ({
          weekKey,
          days,
          totalSeconds: days.reduce((sum, day) => sum + day.totalSeconds, 0),
        }),
      );
  }, [entries]);

  const showSkeleton = isLoading && entries.length === 0;

  if (showSkeleton) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {weeks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhum apontamento neste período.</p>
          <Button variant="outline" onClick={() => setManualOpen(true)}>
            Adicionar manualmente
          </Button>
        </div>
      ) : (
        weeks.map((week) => (
          <section key={week.weekKey} className="border-border border-b last:border-b-0">
            <div className="text-muted-foreground flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{formatWeekBucketLabel(week.weekKey)}</span>
              <span>
                Total da semana:{' '}
                <span className="text-foreground font-mono tabular-nums">
                  {formatDurationHMS(week.totalSeconds)}
                </span>
              </span>
            </div>

            {week.days.map((day) => (
              <div key={day.dayKey}>
                <div className="bg-muted/40 border-border flex items-center justify-between border-y px-4 py-2 text-sm">
                  <span className="font-semibold">{formatCompactDayLabel(day.dayKey)}</span>
                  <span className="text-muted-foreground">
                    Total:{' '}
                    <span className="text-foreground font-mono tabular-nums">
                      {formatDurationHMS(day.totalSeconds)}
                    </span>
                  </span>
                </div>
                {day.entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    onEdit={setEditingEntry}
                    onDuplicate={(item) => void duplicateEntry(item)}
                    onDelete={(item) => void deleteEntry(item.id)}
                    onRestart={(item) =>
                      void start({
                        projectId: item.projectId ?? undefined,
                        description: item.description ?? undefined,
                        tagIds: item.tags?.map((tag) => tag.id),
                      })
                    }
                  />
                ))}
              </div>
            ))}
          </section>
        ))
      )}

      <EntryEditDialog
        entry={editingEntry}
        open={!!editingEntry}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEntry(null);
          }
        }}
        onSubmit={async (values) => {
          if (!editingEntry) {
            return;
          }
          await updateEntry({ id: editingEntry.id, input: values });
        }}
      />

      <ManualEntryDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSubmit={async (values) => {
          await createEntry(values);
        }}
      />
    </div>
  );
}
