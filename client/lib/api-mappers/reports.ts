import type { ReportSummaryItem, User, UserReport } from '@/types/api';
import type { BackendSummaryEnvelope, BackendUser, BackendUserReport } from './backend-types';
import { mapBackendUser } from './users';

export function mapReportSummary(raw: unknown): ReportSummaryItem[] {
  const items = Array.isArray(raw)
    ? raw
    : ((raw as BackendSummaryEnvelope | null)?.items ?? []);

  return items.map((item) => {
    const day = item.day;
    const id = item.id ?? day ?? 'unknown';
    const name = item.name ?? day ?? 'Sem nome';
    return {
      id: String(id),
      name: String(name),
      totalSeconds: Number(item.totalSeconds ?? 0),
      color: item.color,
    };
  });
}

export function mapUserReport(raw: unknown, fallbackUser?: User | null): UserReport {
  const body = raw as BackendUserReport & Partial<UserReport>;
  if (body.user && Array.isArray(body.byProject) && Array.isArray(body.byDay)) {
    return {
      user: mapBackendUser(body.user as unknown as BackendUser),
      totalSeconds: body.totalSeconds,
      byProject: body.byProject as ReportSummaryItem[],
      byDay: body.byDay,
    };
  }

  const byProject: ReportSummaryItem[] = (body.byProject ?? []).map((item) => ({
    id: item.projectId ?? 'none',
    name: item.projectName ?? 'Sem projeto',
    totalSeconds: Number(item.totalSeconds ?? 0),
  }));

  return {
    user:
      fallbackUser ??
      ({
        id: body.userId,
        email: '',
        name: body.userId,
        picture: null,
        status: 'APPROVED',
        role: 'MEMBER',
      } satisfies User),
    totalSeconds: Number(body.totalSeconds ?? 0),
    byProject,
    byDay: [],
  };
}
