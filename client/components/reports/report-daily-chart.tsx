'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatChartDayLabel, formatDurationHMS } from '@/lib/datetime';
import type { ReportSummaryItem } from '@/types/api';

interface ReportDailyChartProps {
  items: ReportSummaryItem[];
  days: string[];
  isLoading?: boolean;
}

function formatHours(value: number) {
  return `${(value / 3600).toFixed(value >= 36000 ? 0 : 1)}h`;
}

export function ReportDailyChart({ items, days, isLoading }: ReportDailyChartProps) {
  if (isLoading) {
    return (
      <section className="border-border bg-card rounded-lg border p-4 sm:p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-5 h-[290px] w-full" />
      </section>
    );
  }

  const secondsByDay = new Map(items.map((item) => [item.id, item.totalSeconds]));
  const data = days.map((day) => {
    const totalSeconds = secondsByDay.get(day) ?? 0;
    return {
      day,
      label: formatChartDayLabel(day),
      totalSeconds,
      totalLabel: totalSeconds > 0 ? formatDurationHMS(totalSeconds) : '',
    };
  });
  const maxSeconds = Math.max(...data.map((item) => item.totalSeconds), 3600);
  const chartWidth = Math.min(Math.max(680, days.length * 42), 2400);

  return (
    <section
      className="border-border bg-card overflow-hidden rounded-lg border"
      aria-labelledby="daily-chart-heading"
      aria-describedby="daily-chart-description"
    >
      <div className="border-border border-b px-4 py-3 sm:px-5">
        <h2 id="daily-chart-heading" className="text-sm font-semibold">Horas por dia</h2>
        <p id="daily-chart-description" className="text-muted-foreground mt-0.5 text-xs">
          Distribuição diária no período selecionado
        </p>
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.day}>
            {item.label}: {formatDurationHMS(item.totalSeconds)}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto px-2 py-4 sm:px-4" aria-hidden="true">
        <div className="h-[300px] w-full" style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 26, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={20}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                domain={[0, Math.ceil(maxSeconds / 3600) * 3600]}
                tickFormatter={formatHours}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.45 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const seconds = Number(payload[0]?.value) || 0;
                  return (
                    <div className="border-border bg-card rounded-md border px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">{label}</p>
                      <p className="text-muted-foreground mt-1 font-mono tabular-nums">
                        {formatDurationHMS(seconds)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="totalSeconds"
                name="Tempo registrado"
                fill="var(--accent)"
                maxBarSize={48}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="totalLabel"
                  position="top"
                  className="fill-foreground text-[10px]"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
