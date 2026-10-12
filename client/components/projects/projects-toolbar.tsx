'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client } from '@/types/api';

export type ProjectStatusFilter = 'active' | 'archived' | 'all';

interface ProjectsToolbarProps {
  status: ProjectStatusFilter;
  onStatusChange: (status: ProjectStatusFilter) => void;
  clientId: string | null;
  onClientChange: (clientId: string | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
  clients: Client[];
  canManage: boolean;
  onCreate: () => void;
}

export function ProjectsToolbar({
  status,
  onStatusChange,
  clientId,
  onClientChange,
  search,
  onSearchChange,
  clients,
  canManage,
  onCreate,
}: ProjectsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={status} onValueChange={(value) => onStatusChange(value as ProjectStatusFilter)}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Status do projeto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={clientId ?? 'all'}
          onValueChange={(value) => onClientChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por cliente">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: client.color }}
                    aria-hidden
                  />
                  {client.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome"
            className="pl-8"
            aria-label="Buscar projetos por nome"
          />
        </div>
      </div>

      {canManage ? (
        <Button type="button" onClick={onCreate} className="shrink-0">
          Criar projeto
        </Button>
      ) : null}
    </div>
  );
}
