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
import type { ProjectStackMeta, StackedDayRow } from '@/lib/dashboard-aggregate';
import { formatDurationHMS } from '@/lib/datetime';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyStackedChartProps {
  rows: StackedDayRow[];
  projects: ProjectStackMeta[];
  isLoading?: boolean;
}

function hoursTick(value: number) {
  return `${(value / 3600).toFixed(1)}h`;
}

export function DailyStackedChart({ rows, projects, isLoading }: DailyStackedChartProps) {
  if (isLoading) {
    return (
      <div className="border-border rounded-lg border p-4">
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  const chartData = rows.map((row) => ({
    label: row.label,
    totalSeconds: row.totalSeconds,
    totalLabel: row.totalLabel,
    ...row.stacks,
  }));

  const maxSeconds = Math.max(...rows.map((row) => row.totalSeconds), 3600);

  return (
    <div className="border-border rounded-lg border p-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            />
            <YAxis
              tickFormatter={hoursTick}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(maxSeconds / 3600) * 3600]}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              width={48}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const total = payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                return (
                  <div className="border-border bg-card rounded-md border px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-medium">{label}</p>
                    <p className="text-muted-foreground mb-2 font-mono">{formatDurationHMS(total)}</p>
                    {payload
                      .filter((item) => Number(item.value) > 0)
                      .map((item) => (
                        <div key={String(item.dataKey)} className="flex items-center gap-2 py-0.5">
                          <span className="size-2 rounded-full" style={{ background: item.color }} />
                          <span className="flex-1 truncate">{item.name}</span>
                          <span className="font-mono tabular-nums">{formatDurationHMS(Number(item.value))}</span>
                        </div>
                      ))}
                  </div>
                );
              }}
            />
            {projects.map((project, index) => (
              <Bar
                key={project.id}
                dataKey={project.id}
                name={project.name}
                stackId="day"
                fill={project.color}
                maxBarSize={56}
                radius={index === projects.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              >
                {index === projects.length - 1 ? (
                  <LabelList
                    dataKey="totalLabel"
                    position="top"
                    className="fill-foreground text-[10px]"
                    formatter={(value) => (value && value !== '00:00:00' ? String(value) : '')}
                  />
                ) : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {projects.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Sem dados no período</p>
      ) : null}
    </div>
  );
}
