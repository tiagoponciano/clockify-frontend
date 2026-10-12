'use client';

import { createPortal } from 'react-dom';
import type { TeamActivityRow } from '@/lib/dashboard-aggregate';
import { formatDurationHMS } from '@/lib/datetime';

/** Per-project time of one member, floating above the pointer. */
export function ProjectBreakdownTooltip({
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
