'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ClientStatusFilter = 'active' | 'inactive' | 'all';

interface ClientsToolbarProps {
  status: ClientStatusFilter;
  onStatusChange: (status: ClientStatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  canManage: boolean;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onQuickAdd: () => void;
  isAdding?: boolean;
}

export function ClientsToolbar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  canManage,
  draftName,
  onDraftNameChange,
  onQuickAdd,
  isAdding,
}: ClientsToolbarProps) {
  const canSubmit = draftName.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={status} onValueChange={(value) => onStatusChange(value as ClientStatusFilter)}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Status do cliente">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Mostrar ativos</SelectItem>
            <SelectItem value="inactive">Mostrar inativos</SelectItem>
            <SelectItem value="all">Mostrar todos</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome"
            className="pl-8"
            aria-label="Buscar clientes por nome"
          />
        </div>
      </div>

      {canManage ? (
        <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end">
          <div className="grid min-w-0 flex-1 gap-2">
            <label htmlFor="quick-client-name" className="text-muted-foreground text-xs font-medium">
              Novo cliente
            </label>
            <Input
              id="quick-client-name"
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              placeholder="Adicionar novo cliente"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSubmit && !isAdding) {
                  event.preventDefault();
                  onQuickAdd();
                }
              }}
            />
          </div>
          <Button type="button" disabled={!canSubmit || isAdding} onClick={onQuickAdd} className="shrink-0">
            Adicionar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
