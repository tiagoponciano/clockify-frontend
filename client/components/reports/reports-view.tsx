'use client';

import { Clock3, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ReportBreakdown } from '@/components/reports/report-breakdown';
import { ReportDailyChart } from '@/components/reports/report-daily-chart';
import { ReportsToolbar } from '@/components/reports/reports-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients, useProjects } from '@/hooks/use-projects';
import { useReportSummary, useUsers } from '@/hooks/use-reports';
import { formatDurationHMS, getPresetRange, type DashboardDateRange } from '@/lib/datetime';
import { canManageResources } from '@/types/api';

export function ReportsView() {
  const { user } = useAuth();
  const [range, setRange] = useState<DashboardDateRange>(() => getPresetRange('thisWeek'));
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const canSeeTeam = Boolean(user && canManageResources(user.role));
  const effectiveUserId = canSeeTeam ? selectedUserId : (user?.id ?? null);
  const filters = {
    from: range.from,
    to: range.to,
    clientId: clientId ?? undefined,
    projectId: projectId ?? undefined,
    userId: effectiveUserId ?? undefined,
  };

  const byDayQuery = useReportSummary({ ...filters, groupBy: 'day' });
  const byProjectQuery = useReportSummary({ ...filters, groupBy: 'project' });
  const clientsQuery = useClients();
  const projectsQuery = useProjects();
  const usersQuery = useUsers(canSeeTeam);

  const projectItems = byProjectQuery.data ?? [];
  const totalSeconds = useMemo(
    () => projectItems.reduce((total, item) => total + item.totalSeconds, 0),
    [projectItems],
  );

  const isLoading =
    byDayQuery.isLoading ||
    byProjectQuery.isLoading ||
    clientsQuery.isLoading ||
    projectsQuery.isLoading ||
    (canSeeTeam && usersQuery.isLoading);
  const isError =
    byDayQuery.isError ||
    byProjectQuery.isError ||
    clientsQuery.isError ||
    projectsQuery.isError ||
    (canSeeTeam && usersQuery.isError);
  const isRetrying =
    isError &&
    (byDayQuery.isFetching ||
      byProjectQuery.isFetching ||
      clientsQuery.isFetching ||
      projectsQuery.isFetching ||
      (canSeeTeam && usersQuery.isFetching));
  const isEmpty = !isLoading && !isError && totalSeconds === 0;

  function handleClientChange(nextClientId: string | null) {
    setClientId(nextClientId);
    setProjectId(null);
  }

  function retryFailed() {
    if (byDayQuery.isError) void byDayQuery.refetch();
    if (byProjectQuery.isError) void byProjectQuery.refetch();
    if (clientsQuery.isError) void clientsQuery.refetch();
    if (projectsQuery.isError) void projectsQuery.refetch();
    if (canSeeTeam && usersQuery.isError) void usersQuery.refetch();
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
      <ReportsToolbar
        range={range}
        onRangeChange={setRange}
        clientId={clientId}
        onClientChange={handleClientChange}
        projectId={projectId}
        onProjectChange={setProjectId}
        userId={effectiveUserId}
        onUserChange={canSeeTeam ? setSelectedUserId : () => undefined}
        canSeeTeam={canSeeTeam}
        clients={clientsQuery.data ?? []}
        projects={projectsQuery.data ?? []}
        users={usersQuery.data ?? []}
        reportItems={projectItems}
        totalSeconds={totalSeconds}
      />

      <section className="border-border bg-card rounded-lg border" aria-labelledby="report-total-heading">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div>
            <p id="report-total-heading" className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
              Tempo registrado
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-9 w-40" />
            ) : (
              <p className="mt-1 font-mono text-3xl font-semibold tracking-tight tabular-nums">
                {formatDurationHMS(totalSeconds)}
              </p>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{range.label}</p>
        </div>
      </section>

      {isError ? (
        <section
          className="border-destructive/30 bg-destructive/5 flex min-h-64 flex-col items-center justify-center rounded-lg border p-8 text-center"
          role="alert"
          aria-live="assertive"
          aria-busy={isRetrying}
        >
          <p className="font-medium">Não foi possível carregar o relatório.</p>
          <p className="text-muted-foreground mt-1 text-sm">Tente novamente para atualizar os dados.</p>
          <Button variant="outline" className="mt-4" disabled={isRetrying} onClick={retryFailed}>
            <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Atualizando…' : 'Tentar novamente'}
          </Button>
        </section>
      ) : isEmpty ? (
        <section
          className="border-border bg-card flex min-h-64 flex-col items-center justify-center rounded-lg border p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <span className="bg-muted flex size-11 items-center justify-center rounded-full">
            <Clock3 className="text-muted-foreground size-5" />
          </span>
          <p className="mt-4 font-medium">Nenhum apontamento neste período</p>
          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            Ajuste o período ou remova filtros para visualizar atividades.
          </p>
        </section>
      ) : (
        <>
          <ReportDailyChart
            items={byDayQuery.data ?? []}
            days={range.days}
            isLoading={isLoading}
          />
          <ReportBreakdown
            items={projectItems}
            projects={projectsQuery.data ?? []}
            totalSeconds={totalSeconds}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
