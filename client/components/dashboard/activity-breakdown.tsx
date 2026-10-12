'use client';

import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDurationHMS } from '@/lib/datetime';
import type { ReportSummaryItem } from '@/types/api';

const PAGE_SIZE = 5;
const FALLBACK_COLORS = ['#f97316', '#14b8a6', '#3b82f6', '#a3a3a3', '#eab308', '#8b5cf6', '#ec4899'];

interface ActivityBreakdownProps {
  items: ReportSummaryItem[];
  totalSeconds: number;
  isLoading?: boolean;
}

export function ActivityBreakdown({ items, totalSeconds, isLoading }: ActivityBreakdownProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const chartData = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        color: item.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      })),
    [items],
  );

  if (isLoading) {
    return (
      <div className="border-border grid gap-4 rounded-lg border p-4 lg:grid-cols-2">
        <Skeleton className="mx-auto h-56 w-56 rounded-full" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const shown = chartData.slice(0, visible);
  const hasMore = visible < chartData.length;

  return (
    <div className="border-border grid gap-6 rounded-lg border p-4 lg:grid-cols-2">
      <div className="relative mx-auto h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length ? chartData : [{ id: 'empty', name: 'vazio', totalSeconds: 1, color: 'var(--muted)' }]}
              dataKey="totalSeconds"
              nameKey="name"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              stroke="none"
            >
              {(chartData.length
                ? chartData
                : [{ id: 'empty', name: 'vazio', totalSeconds: 1, color: 'var(--muted)' }]
              ).map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold tabular-nums">{formatDurationHMS(totalSeconds)}</span>
          <span className="text-muted-foreground text-xs">Total</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        {shown.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Sem atividades no período</p>
        ) : (
          shown.map((item) => {
            const pct = totalSeconds > 0 ? (item.totalSeconds / totalSeconds) * 100 : 0;
            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{item.name}</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums">{formatDurationHMS(item.totalSeconds)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(pct, 1)}%`, background: item.color }}
                    />
                  </div>
                  <span className="text-muted-foreground w-14 shrink-0 text-right text-xs tabular-nums">
                    {pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
        {hasMore ? (
          <Button variant="ghost" size="sm" className="mt-2 self-start" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Carregar mais
          </Button>
        ) : null}
      </div>
    </div>
  );
}
