'use client';

import { Pencil, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '@/types/api';

interface ClientsTableProps {
  clients: Client[];
  canManage: boolean;
  isLoading?: boolean;
  onEdit: (client: Client) => void;
  onDeactivate: (client: Client) => void;
}

export function ClientsTable({
  clients,
  canManage,
  isLoading,
  onEdit,
  onDeactivate,
}: ClientsTableProps) {
  if (isLoading) {
    return (
      <div className="border-border bg-card space-y-3 rounded-lg border p-4">
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="border-border bg-card rounded-lg border px-4 py-10 text-center">
        <p className="text-muted-foreground text-sm">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-border border-b text-xs tracking-wide uppercase">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Nome
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Status
              </th>
              {canManage ? (
                <th scope="col" className="w-28 px-4 py-2.5 font-medium">
                  Ações
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-border border-b last:border-b-0">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: client.color }}
                      aria-hidden
                    />
                    {client.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground text-xs">
                    {client.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Editar ${client.name}`}
                        onClick={() => onEdit(client)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {client.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Desativar ${client.name}`}
                          onClick={() => onDeactivate(client)}
                        >
                          <UserX className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
