'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeamActivityRow } from '@/lib/dashboard-aggregate';
import { elapsedSecondsSince, formatDurationHMS } from '@/lib/datetime';
import { formatProjectLabel } from '@/types/api';

interface TeamActivitiesProps {
  rows: TeamActivityRow[];
  isLoading?: boolean;
}

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

function ProjectBreakdownTooltip({
  row,
  x,
  y,
}: {
  row: TeamActivityRow;
  x: number;
  y: number;
}) {
  if (row.byProject.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="border-border bg-background pointer-events-none fixed z-[100] min-w-[240px] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border p-3 shadow-lg"
      style={{ left: x, top: y }}
    >
      <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        Tempo por projeto
      </p>
      <ul className="space-y-2">
        {row.byProject.map((project) => (
          <li key={project.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: project.color }} />
              <span className="truncate">{project.name}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums">{formatDurationHMS(project.seconds)}</span>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
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

export function TeamActivities({ rows, isLoading }: TeamActivitiesProps) {
  const [hover, setHover] = useState<{
    userId: string;
    x: number;
    y: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="border-border rounded-lg border">
        <div className="border-border border-b px-4 py-3">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-3 p-4">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const hoveredRow = hover ? rows.find((row) => row.user.id === hover.userId) : null;

  function handleRowMove(userId: string, event: MouseEvent<HTMLTableRowElement>) {
    setHover({ userId, x: event.clientX, y: event.clientY });
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Atividades da equipe</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Passe o mouse sobre um membro para ver o detalhamento por projeto
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-border border-b text-xs tracking-wide uppercase">
              <th className="px-4 py-2 font-medium">Membro</th>
              <th className="px-4 py-2 font-medium">Última atividade</th>
              <th className="px-4 py-2 font-medium">Tempo</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Total no período</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                  Nenhum membro encontrado
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const entry = row.latestEntry;
                const project = entry?.project;
                return (
                  <tr
                    key={row.user.id}
                    className="border-border hover:bg-muted/30 border-b last:border-0"
                    onMouseEnter={(event) => handleRowMove(row.user.id, event)}
                    onMouseMove={(event) => handleRowMove(row.user.id, event)}
                    onMouseLeave={() => setHover(null)}
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
              })
            )}
          </tbody>
        </table>
      </div>
      {hoveredRow && hover ? <ProjectBreakdownTooltip row={hoveredRow} x={hover.x} y={hover.y} /> : null}
    </div>
  );
}
