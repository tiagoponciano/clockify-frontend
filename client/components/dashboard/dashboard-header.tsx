'use client';

import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/use-projects';
import { useUsers } from '@/hooks/use-reports';
import type { DashboardDateRange } from '@/lib/datetime';

interface DashboardHeaderProps {
  range: DashboardDateRange;
  onRangeChange: (range: DashboardDateRange) => void;
  clientId: string | null;
  onClientChange: (clientId: string | null) => void;
  userId: string | null;
  onUserChange: (userId: string | null) => void;
  canSeeTeam: boolean;
}

export function DashboardHeader({
  range,
  onRangeChange,
  clientId,
  onClientChange,
  userId,
  onUserChange,
  canSeeTeam,
}: DashboardHeaderProps) {
  const { data: clients = [] } = useClients();
  const { data: users = [] } = useUsers(canSeeTeam);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={clientId ?? 'all'}
          onValueChange={(value) => onClientChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients
              .filter((client) => client.isActive)
              .map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <span className="flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: client.color }} />
                    {client.name}
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {canSeeTeam ? (
          <Select
            value={userId ?? 'all'}
            onValueChange={(value) => onUserChange(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a equipe</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <DateRangePicker value={range} onChange={onRangeChange} />
      </div>
    </div>
  );
}
