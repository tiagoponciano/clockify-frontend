'use client';

import { Copy, MoreVertical, Pencil, Play, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { entryDurationSeconds, formatDurationHMS, formatLocal } from '@/lib/datetime';
import { formatProjectLabel, type TimeEntry } from '@/types/api';

interface EntryRowProps {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onDuplicate: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  onRestart: (entry: TimeEntry) => void;
}

export function EntryRow({ entry, onEdit, onDuplicate, onDelete, onRestart }: EntryRowProps) {
  const clientColor = entry.project?.client?.color ?? '#a3a3a3';
  const duration = entryDurationSeconds(entry);
  const tagNames = entry.tags?.map((tag) => tag.name).join(', ') ?? '';
  const hasTags = (entry.tags?.length ?? 0) > 0;

  return (
    <div className="group border-border hover:bg-muted/20 flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          className="min-w-0 max-w-full truncate text-left text-sm hover:underline"
          onClick={() => onEdit(entry)}
        >
          {entry.description ? (
            <span className="text-foreground">{entry.description}</span>
          ) : (
            <span className="text-muted-foreground italic">Adicionar descrição</span>
          )}
        </button>

        {entry.project ? (
          <span className="inline-flex max-w-[280px] items-center gap-1.5 text-sm" style={{ color: clientColor }}>
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: clientColor }} />
            <span className="truncate">{formatProjectLabel(entry.project)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">Sem projeto</span>
        )}

        {hasTags ? (
          <span className="text-muted-foreground inline-flex items-center" title={tagNames}>
            <Tags className="size-3.5" />
          </span>
        ) : null}
      </div>

      <div className="text-muted-foreground hidden shrink-0 text-sm tabular-nums sm:block">
        {formatLocal(entry.startedAt, 'HH:mm')} –{' '}
        {entry.endedAt ? formatLocal(entry.endedAt, 'HH:mm') : '—'}
      </div>

      <div className="min-w-[76px] shrink-0 text-right font-mono text-sm tabular-nums">
        {formatDurationHMS(duration)}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 opacity-50 group-hover:opacity-100"
        aria-label="Reiniciar timer"
        onClick={() => onRestart(entry)}
      >
        <Play className="size-3.5 fill-current" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Ações">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(entry)}>
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(entry)}>
            <Copy className="size-4" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(entry)}
          >
            <Trash2 className="size-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
