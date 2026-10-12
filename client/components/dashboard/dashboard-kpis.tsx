'use client';

import { formatDurationHMS } from '@/lib/datetime';
import type { ReportSummaryItem } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardKpisProps {
  totalSeconds: number;
  topProject: ReportSummaryItem | null;
  topClient: ReportSummaryItem | null;
  isLoading?: boolean;
}

function KpiCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-1 py-2 sm:px-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-1 truncate font-mono text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function DashboardKpis({ totalSeconds, topProject, topClient, isLoading }: DashboardKpisProps) {
  if (isLoading) {
    return (
      <div className="border-border flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-stretch sm:divide-x sm:divide-border">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex-1 space-y-2 px-1 sm:px-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const projectName = topProject?.name?.split(' - ')[0] ?? '—';
  const clientName = topClient?.name ?? '—';

  return (
    <div className="border-border flex flex-col rounded-lg border sm:flex-row sm:items-stretch sm:divide-x sm:divide-border">
      <KpiCell label="Tempo total" value={formatDurationHMS(totalSeconds)} />
      <KpiCell label="Top projeto" value={projectName} />
      <KpiCell label="Top cliente" value={clientName} />
    </div>
  );
}
