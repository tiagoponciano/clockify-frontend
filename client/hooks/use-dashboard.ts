'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  buildStackedSeries,
  buildTeamActivities,
  sumReportSeconds,
} from '@/lib/dashboard-aggregate';
import { getPresetRange, type DashboardDateRange } from '@/lib/datetime';
import { fetchTimeEntries, queryKeys } from '@/lib/queries';
import { canManageResources, type TimeEntry, type User } from '@/types/api';
import { useReportSummary, useUsers } from './use-reports';

export type DashboardFiltersState = {
  range: DashboardDateRange;
  clientId: string | null;
  userId: string | null;
};

const ENTRIES_PAGE_SIZE = 200;

async function fetchAllTimeEntries(filters: {
  from?: string;
  to?: string;
  userId?: string;
}): Promise<TimeEntry[]> {
  const first = await fetchTimeEntries({
    ...filters,
    page: 1,
    limit: ENTRIES_PAGE_SIZE,
  });
  const all = [...first.data];
  const totalPages = Math.max(1, Math.ceil(first.total / ENTRIES_PAGE_SIZE));
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchTimeEntries({
      ...filters,
      page,
      limit: ENTRIES_PAGE_SIZE,
    });
    all.push(...next.data);
  }
  return all;
}

export function useDashboard(currentUser: User | null | undefined) {
  const [range, setRange] = useState<DashboardDateRange>(() => getPresetRange('thisWeek'));
  const [clientId, setClientId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const canSeeTeam = Boolean(currentUser && canManageResources(currentUser.role));
  const effectiveUserId = canSeeTeam ? userId : (currentUser?.id ?? null);

  const baseFilters = {
    from: range.from,
    to: range.to,
    clientId: clientId ?? undefined,
    userId: effectiveUserId ?? undefined,
  };

  const byProject = useReportSummary({ ...baseFilters, groupBy: 'project' });
  const byClient = useReportSummary({ ...baseFilters, groupBy: 'client' });

  // Managers without a user filter get the whole team (backend omits user scope).
  // Members are always scoped to themselves by the API.
  const entriesQuery = useQuery({
    queryKey: queryKeys.timeEntries({
      from: baseFilters.from,
      to: baseFilters.to,
      userId: baseFilters.userId,
      allPages: true,
    }),
    queryFn: () =>
      fetchAllTimeEntries({
        from: baseFilters.from,
        to: baseFilters.to,
        userId: baseFilters.userId,
      }),
  });

  const usersQuery = useUsers(canSeeTeam);

  const scopedEntries = useMemo(() => {
    const entries = entriesQuery.data ?? [];
    if (!clientId) return entries;
    return entries.filter((entry) => entry.project?.client?.id === clientId);
  }, [entriesQuery.data, clientId]);

  const stacked = useMemo(() => {
    return buildStackedSeries(scopedEntries, range.days);
  }, [scopedEntries, range.days]);

  const totalSeconds = useMemo(
    () => sumReportSeconds(byProject.data ?? []),
    [byProject.data],
  );

  const topProject = byProject.data?.[0] ?? null;
  const topClient = byClient.data?.[0] ?? null;

  const teamRows = useMemo(() => {
    if (!canSeeTeam) return [];
    const users = usersQuery.data ?? [];
    const filteredUsers = effectiveUserId
      ? users.filter((user) => user.id === effectiveUserId)
      : users;
    return buildTeamActivities(filteredUsers, scopedEntries);
  }, [canSeeTeam, usersQuery.data, effectiveUserId, scopedEntries]);

  const isLoading =
    byProject.isLoading || byClient.isLoading || entriesQuery.isLoading || (canSeeTeam && usersQuery.isLoading);
  const isError = byProject.isError || byClient.isError || entriesQuery.isError;
  const isEmpty = !isLoading && totalSeconds === 0 && scopedEntries.length === 0;

  return {
    range,
    setRange,
    clientId,
    setClientId,
    userId: effectiveUserId,
    setUserId: canSeeTeam ? setUserId : () => undefined,
    canSeeTeam,
    totalSeconds,
    topProject,
    topClient,
    byProject: byProject.data ?? [],
    stacked,
    teamRows,
    isLoading,
    isError,
    isEmpty,
  };
}
