'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchReportSummary, fetchUsers, queryKeys } from '@/lib/queries';
import type { ReportGroupBy } from '@/types/api';

export function useReportSummary(filters: {
  from?: string;
  to?: string;
  groupBy?: ReportGroupBy;
  projectId?: string;
  clientId?: string;
  userId?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = filters;
  return useQuery({
    queryKey: queryKeys.reports.summary(rest),
    queryFn: () => fetchReportSummary(rest),
    enabled,
  });
}

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    enabled,
  });
}
