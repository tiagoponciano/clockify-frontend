'use client';

import { useMemo, useState } from 'react';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { ClientsTable } from '@/components/clients/clients-table';
import {
  ClientsToolbar,
  type ClientStatusFilter,
} from '@/components/clients/clients-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { useClientMutations, useClients } from '@/hooks/use-projects';
import { canManageResources, type Client } from '@/types/api';

export function ClientsView() {
  const { user } = useAuth();
  const canManage = Boolean(user && canManageResources(user.role));

  const [status, setStatus] = useState<ClientStatusFilter>('active');
  const [search, setSearch] = useState('');
  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState<Client | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const includeInactive = status !== 'active';
  const clientsQuery = useClients({ includeInactive });
  const { createMutation, updateMutation } = useClientMutations();

  const filteredClients = useMemo(() => {
    let list = clientsQuery.data ?? [];
    if (status === 'active') {
      list = list.filter((client) => client.isActive);
    } else if (status === 'inactive') {
      list = list.filter((client) => !client.isActive);
    }
    const needle = search.trim().toLowerCase();
    if (needle) {
      list = list.filter((client) => client.name.toLowerCase().includes(needle));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [clientsQuery.data, status, search]);

  async function handleQuickAdd() {
    const name = draftName.trim();
    if (!name) return;
    await createMutation.mutateAsync({ name });
    setDraftName('');
  }

  async function handleEditSubmit(values: { name: string; color: string }) {
    if (!editing) return;
    await updateMutation.mutateAsync({
      id: editing.id,
      input: values,
    });
  }

  async function handleDeactivate(client: Client) {
    await updateMutation.mutateAsync({
      id: client.id,
      input: { isActive: false },
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground text-sm">
          Cadastre clientes e defina as cores usadas nos projetos
        </p>
      </div>

      <ClientsToolbar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        canManage={canManage}
        draftName={draftName}
        onDraftNameChange={setDraftName}
        onQuickAdd={() => void handleQuickAdd()}
        isAdding={createMutation.isPending}
      />

      {clientsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <p className="text-destructive text-sm">Não foi possível carregar os clientes.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void clientsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <ClientsTable
        clients={filteredClients}
        canManage={canManage}
        isLoading={clientsQuery.isLoading}
        onEdit={(client) => {
          setEditing(client);
          setDialogOpen(true);
        }}
        onDeactivate={(client) => void handleDeactivate(client)}
      />

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editing}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
