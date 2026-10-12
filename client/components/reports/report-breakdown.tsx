'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDurationHMS } from '@/lib/datetime';
import type { Project, ReportSummaryItem } from '@/types/api';

const FALLBACK_COLORS = [
  '#f97316',
  '#14b8a6',
  '#3b82f6',
  '#eab308',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

interface ReportBreakdownProps {
  items: ReportSummaryItem[];
  projects: Project[];
  totalSeconds: number;
  isLoading?: boolean;
}

export function ReportBreakdown({
  items,
  projects,
  totalSeconds,
  isLoading,
}: ReportBreakdownProps) {
  const rows = useMemo(() => {
    const projectById = new Map(projects.map((project) => [project.id, project]));
    return items.map((item, index) => {
      const project = projectById.get(item.id);
      return {
        ...item,
        projectName: project?.name ?? item.name,
        clientName: project?.client?.name ?? 'Sem cliente',
        color:
          item.color ??
          project?.client?.color ??
          FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        percentage: totalSeconds > 0 ? (item.totalSeconds / totalSeconds) * 100 : 0,
      };
    });
  }, [items, projects, totalSeconds]);

  if (isLoading) {
    return (
      <section className="border-border bg-card rounded-lg border p-4 sm:p-5">
        <Skeleton className="h-5 w-48" />
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="mx-auto size-64 rounded-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="border-border bg-card overflow-hidden rounded-lg border" aria-labelledby="breakdown-heading">
      <div className="border-border border-b px-4 py-3 sm:px-5">
        <h2 id="breakdown-heading" className="text-sm font-semibold">Distribuição por projeto</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Compare a duração e a participação de cada projeto
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-xs tracking-wide uppercase">
                <th scope="col" className="w-14 px-4 py-2.5 font-medium">Cor</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Projeto</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Cliente</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Duração</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Participação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-border hover:bg-muted/35 border-b transition-colors last:border-b-0">
                  <td className="px-4 py-3.5">
                    <span
                      className="block size-2.5 rounded-full"
                      style={{ background: row.color }}
                      aria-hidden="true"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-medium">{row.projectName}</td>
                  <td className="text-muted-foreground px-4 py-3.5">{row.clientName}</td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    {formatDurationHMS(row.totalSeconds)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    {row.percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-border border-t p-5 lg:border-t-0 lg:border-l">
          <div
            className="relative mx-auto size-64"
            role="img"
            aria-label={`Distribuição de ${formatDurationHMS(totalSeconds)} entre ${rows.length} projetos`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="totalSeconds"
                  nameKey="projectName"
                  innerRadius={74}
                  outerRadius={108}
                  paddingAngle={rows.length > 1 ? 2 : 0}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {rows.map((row) => (
                    <Cell key={row.id} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload as (typeof rows)[number] | undefined;
                    if (!item) return null;
                    return (
                      <div className="border-border bg-card rounded-md border px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{item.projectName}</p>
                        <p className="text-muted-foreground mt-1 font-mono tabular-nums">
                          {formatDurationHMS(item.totalSeconds)} · {item.percentage.toFixed(2)}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-semibold tabular-nums">
                {formatDurationHMS(totalSeconds)}
              </span>
              <span className="text-muted-foreground mt-1 text-xs">Tempo total</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            {rows.length} {rows.length === 1 ? 'projeto' : 'projetos'} no período
          </p>
        </div>
      </div>
    </section>
  );
}
