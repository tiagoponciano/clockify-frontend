import {
  entryDurationSeconds,
  formatChartDayLabel,
  formatDurationHMS,
  groupKeyForDate,
} from '@/lib/datetime';
import { formatProjectLabel, type ReportSummaryItem, type TimeEntry, type User } from '@/types/api';

export type StackedDayRow = {
  dayKey: string;
  label: string;
  totalSeconds: number;
  totalLabel: string;
  /** projectId → seconds */
  stacks: Record<string, number>;
};

export type ProjectStackMeta = {
  id: string;
  name: string;
  color: string;
};

export type TeamActivityRow = {
  user: User;
  latestEntry: TimeEntry | null;
  isRunning: boolean;
  sessionSeconds: number;
  weekTotalSeconds: number;
  byProject: { id: string; name: string; color: string; seconds: number }[];
};

const FALLBACK_COLORS = ['#f97316', '#14b8a6', '#3b82f6', '#a3a3a3', '#eab308', '#8b5cf6', '#ec4899'];

export function projectColor(entry: TimeEntry, index = 0): string {
  return entry.project?.client?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function buildStackedSeries(
  entries: TimeEntry[],
  days: string[],
): { rows: StackedDayRow[]; projects: ProjectStackMeta[] } {
  const projectMeta = new Map<string, ProjectStackMeta>();
  const byDay = new Map<string, Map<string, number>>();

  for (const day of days) {
    byDay.set(day, new Map());
  }

  for (const entry of entries) {
    if (!entry.projectId) continue;
    const dayKey = groupKeyForDate(entry.startedAt);
    if (!byDay.has(dayKey)) continue;

    const seconds = entryDurationSeconds(entry);
    const dayMap = byDay.get(dayKey)!;
    dayMap.set(entry.projectId, (dayMap.get(entry.projectId) ?? 0) + seconds);

    if (!projectMeta.has(entry.projectId)) {
      const color = entry.project?.client?.color ?? FALLBACK_COLORS[projectMeta.size % FALLBACK_COLORS.length];
      projectMeta.set(entry.projectId, {
        id: entry.projectId,
        name: entry.project ? formatProjectLabel(entry.project) : entry.projectId,
        color,
      });
    }
  }

  const projects = [...projectMeta.values()];
  const rows: StackedDayRow[] = days.map((dayKey) => {
    const stacks: Record<string, number> = {};
    let totalSeconds = 0;
    const dayMap = byDay.get(dayKey)!;
    for (const project of projects) {
      const value = dayMap.get(project.id) ?? 0;
      stacks[project.id] = value;
      totalSeconds += value;
    }
    return {
      dayKey,
      label: formatChartDayLabel(dayKey),
      totalSeconds,
      totalLabel: formatDurationHMS(totalSeconds),
      stacks,
    };
  });

  return { rows, projects };
}

export function buildTeamActivities(
  users: User[],
  entries: TimeEntry[],
): TeamActivityRow[] {
  return users.map((user) => {
    const userEntries = entries
      .filter((entry) => entry.userId === user.id)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const latestEntry = userEntries[0] ?? null;
    const isRunning = Boolean(latestEntry && !latestEntry.endedAt);
    const sessionSeconds = latestEntry && isRunning ? entryDurationSeconds(latestEntry) : 0;

    const byProjectMap = new Map<string, { id: string; name: string; color: string; seconds: number }>();
    let weekTotalSeconds = 0;
    for (const entry of userEntries) {
      const seconds = entryDurationSeconds(entry);
      weekTotalSeconds += seconds;
      if (!entry.projectId) continue;
      const existing = byProjectMap.get(entry.projectId);
      if (existing) {
        existing.seconds += seconds;
      } else {
        byProjectMap.set(entry.projectId, {
          id: entry.projectId,
          name: entry.project ? formatProjectLabel(entry.project) : entry.projectId,
          color: projectColor(entry, byProjectMap.size),
          seconds,
        });
      }
    }

    return {
      user,
      latestEntry,
      isRunning,
      sessionSeconds,
      weekTotalSeconds,
      byProject: [...byProjectMap.values()].sort((a, b) => b.seconds - a.seconds),
    };
  });
}

export function sumReportSeconds(items: ReportSummaryItem[]): number {
  return items.reduce((sum, item) => sum + item.totalSeconds, 0);
}
