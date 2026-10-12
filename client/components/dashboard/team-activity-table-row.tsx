'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TeamActivityRow } from '@/lib/dashboard-aggregate';
import { elapsedSecondsSince, formatDurationHMS } from '@/lib/datetime';
import { formatProjectLabel } from '@/types/api';

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [seconds, setSeconds] = useState(() => elapsedSecondsSince(startedAt));
  useEffect(() => {
    const id = window.setInterval(() => setSeconds(elapsedSecondsSince(startedAt)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return <span className="font-mono text-sm tabular-nums">{formatDurationHMS(seconds)}</span>;
}

function ProjectBars({ row }: { row: TeamActivityRow }) {
  const total = row.weekTotalSeconds || 1;
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <span className="font-mono text-sm tabular-nums">{formatDurationHMS(row.weekTotalSeconds)}</span>
      <div className="bg-muted flex h-2 min-w-[80px] flex-1 overflow-hidden rounded-full">
        {row.byProject.map((project) => (
          <div
            key={project.id}
            className="h-full"
            style={{
              width: `${(project.seconds / total) * 100}%`,
              background: project.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

type TeamActivityTableRowProps = {
  row: TeamActivityRow;
  onPointerMove: (userId: string, event: MouseEvent<HTMLTableRowElement>) => void;
  onPointerLeave: () => void;
};

/** One member: latest entry, live timer, status and period total by project. */
export function TeamActivityTableRow({ row, onPointerMove, onPointerLeave }: TeamActivityTableRowProps) {
  const entry = row.latestEntry;
  const project = entry?.project;
  return (
    <tr
      className="border-border hover:bg-muted/30 border-b last:border-0"
      onMouseEnter={(event) => onPointerMove(row.user.id, event)}
      onMouseMove={(event) => onPointerMove(row.user.id, event)}
      onMouseLeave={onPointerLeave}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {row.user.picture ? <AvatarImage src={row.user.picture} alt={row.user.name} /> : null}
            <AvatarFallback className="text-xs">{initials(row.user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.user.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {entry ? (
          <div className="min-w-0">
            <p className="truncate">{entry.description || 'Sem descrição'}</p>
            {project ? (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: project.client?.color ?? 'var(--muted-foreground)' }}
                />
                <span className="truncate">{formatProjectLabel(project)}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {row.isRunning && entry ? (
          <LiveDuration startedAt={entry.startedAt} />
        ) : (
          <span className="text-muted-foreground font-mono text-sm tabular-nums">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {row.isRunning ? (
          <Badge className="border-success/30 bg-success/10 text-success">Em andamento</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Inativo</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ProjectBars row={row} />
      </td>
    </tr>
  );
}
