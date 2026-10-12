'use client';

import { ActivityBreakdown } from '@/components/dashboard/activity-breakdown';
import { DailyStackedChart } from '@/components/dashboard/daily-stacked-chart';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardKpis } from '@/components/dashboard/dashboard-kpis';
import { TeamActivities } from '@/components/dashboard/team-activities';
import { useAuth } from '@/components/providers/auth-provider';
import { useDashboard } from '@/hooks/use-dashboard';

export function DashboardView() {
  const { user } = useAuth();
  const dashboard = useDashboard(user);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader
        range={dashboard.range}
        onRangeChange={dashboard.setRange}
        clientId={dashboard.clientId}
        onClientChange={dashboard.setClientId}
        userId={dashboard.userId}
        onUserChange={dashboard.setUserId}
        canSeeTeam={dashboard.canSeeTeam}
      />

      {dashboard.isError ? (
        <p className="text-destructive text-sm">Não foi possível carregar o dashboard.</p>
      ) : null}

      <DashboardKpis
        totalSeconds={dashboard.totalSeconds}
        topProject={dashboard.topProject}
        topClient={dashboard.topClient}
        isLoading={dashboard.isLoading}
      />

      <DailyStackedChart
        rows={dashboard.stacked.rows}
        projects={dashboard.stacked.projects}
        isLoading={dashboard.isLoading}
      />

      <ActivityBreakdown
        items={dashboard.byProject}
        totalSeconds={dashboard.totalSeconds}
        isLoading={dashboard.isLoading}
      />

      {dashboard.canSeeTeam ? (
        <TeamActivities rows={dashboard.teamRows} isLoading={dashboard.isLoading} />
      ) : null}

      {dashboard.isEmpty ? (
        <p className="text-muted-foreground text-center text-sm">Nenhum apontamento neste período.</p>
      ) : null}
    </div>
  );
}
