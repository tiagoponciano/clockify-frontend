'use client';

import { Download, RotateCcw } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDurationHMS, type DashboardDateRange } from '@/lib/datetime';
import type { Client, Project, ReportSummaryItem, User } from '@/types/api';

interface ReportsToolbarProps {
  range: DashboardDateRange;
  onRangeChange: (range: DashboardDateRange) => void;
  clientId: string | null;
  onClientChange: (clientId: string | null) => void;
  projectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  userId: string | null;
  onUserChange: (userId: string | null) => void;
  canSeeTeam: boolean;
  clients: Client[];
  projects: Project[];
  users: User[];
  reportItems: ReportSummaryItem[];
  totalSeconds: number;
}

function escapeCsvCell(value: string | number): string {
  const stringValue = String(value);
  const safeValue = /^\s*[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function downloadReportCsv(
  items: ReportSummaryItem[],
  totalSeconds: number,
  range: DashboardDateRange,
) {
  const header = ['Projeto', 'Duração', 'Duração em segundos', 'Participação'];
  const rows = items.map((item) => [
    item.name,
    formatDurationHMS(item.totalSeconds),
    item.totalSeconds,
    `${(totalSeconds > 0 ? (item.totalSeconds / totalSeconds) * 100 : 0).toFixed(2)}%`,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-${range.days[0]}-${range.days[range.days.length - 1]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ReportsToolbar({
  range,
  onRangeChange,
  clientId,
  onClientChange,
  projectId,
  onProjectChange,
  userId,
  onUserChange,
  canSeeTeam,
  clients,
  projects,
  users,
  reportItems,
  totalSeconds,
}: ReportsToolbarProps) {
  const activeClients = clients.filter((client) => client.isActive);
  const availableProjects = projects.filter(
    (project) => !project.isArchived && (!clientId || project.clientId === clientId),
  );
  const hasFilters = Boolean(clientId || projectId || (canSeeTeam && userId));

  function clearFilters() {
    onClientChange(null);
    onProjectChange(null);
    if (canSeeTeam) onUserChange(null);
  }

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Analise a distribuição do tempo registrado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={range} onChange={onRangeChange} />
          <Button
            variant="accent"
            className="h-9"
            disabled={reportItems.length === 0}
            onClick={() => downloadReportCsv(reportItems, totalSeconds, range)}
          >
            <Download className="size-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-lg border p-3">
        <span className="text-muted-foreground mr-1 text-xs font-medium tracking-[0.12em] uppercase">
          Filtros
        </span>

        <Select
          value={clientId ?? 'all'}
          onValueChange={(value) => onClientChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filtrar por cliente">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {activeClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <span className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: client.color }} />
                  {client.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={projectId ?? 'all'}
          onValueChange={(value) => onProjectChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[210px]" aria-label="Filtrar por projeto">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {availableProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canSeeTeam ? (
          <Select
            value={userId ?? 'all'}
            onValueChange={(value) => onUserChange(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por membro">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a equipe</SelectItem>
              {users.map((reportUser) => (
                <SelectItem key={reportUser.id} value={reportUser.id}>
                  {reportUser.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          className="sm:ml-auto"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          <RotateCcw className="size-3.5" />
          Limpar
        </Button>
      </div>
    </header>
  );
}
