'use client';

import { useState, type MouseEvent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeamActivityRow } from '@/lib/dashboard-aggregate';
import { ProjectBreakdownTooltip } from './project-breakdown-tooltip';
import { TeamActivityTableRow } from './team-activity-table-row';

interface TeamActivitiesProps {
  rows: TeamActivityRow[];
  isLoading?: boolean;
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
              rows.map((row) => (
                <TeamActivityTableRow
                  key={row.user.id}
                  row={row}
                  onPointerMove={handleRowMove}
                  onPointerLeave={() => setHover(null)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {hoveredRow && hover ? <ProjectBreakdownTooltip row={hoveredRow} x={hover.x} y={hover.y} /> : null}
    </div>
  );
}
