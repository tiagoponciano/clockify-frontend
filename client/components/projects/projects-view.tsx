'use client';

import { useMemo, useState } from 'react';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectsTable } from '@/components/projects/projects-table';
import {
  ProjectsToolbar,
  type ProjectStatusFilter,
} from '@/components/projects/projects-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { useFavoriteProjects } from '@/hooks/use-favorite-projects';
import { useProjectMutations, useClients, useProjects } from '@/hooks/use-projects';
import { useReportSummary } from '@/hooks/use-reports';
import { getRecentEntriesToUtc, localPartsToUtcISO } from '@/lib/datetime';
import { canManageResources, type Project } from '@/types/api';

const TRACKED_FROM = localPartsToUtcISO('2015-01-01', '00:00');

export function ProjectsView() {
  const { user } = useAuth();
  const canManage = Boolean(user && canManageResources(user.role));
  const { favoriteIds, toggleFavorite } = useFavoriteProjects(user?.id);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const [status, setStatus] = useState<ProjectStatusFilter>('active');
  const [clientId, setClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const includeArchived = status !== 'active';
  const projectsQuery = useProjects({
    clientId: clientId ?? undefined,
    includeArchived,
  });
  const clientsQuery = useClients();
  const trackedQuery = useReportSummary({
    groupBy: 'project',
    from: TRACKED_FROM,
    to: getRecentEntriesToUtc(),
    clientId: clientId ?? undefined,
  });
  const { createMutation, updateMutation } = useProjectMutations();

  const trackedByProjectId = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of trackedQuery.data ?? []) {
      map.set(item.id, item.totalSeconds);
    }
    return map;
  }, [trackedQuery.data]);

  const filteredProjects = useMemo(() => {
    let list = projectsQuery.data ?? [];
    if (status === 'active') {
      list = list.filter((project) => !project.isArchived);
    } else if (status === 'archived') {
      list = list.filter((project) => project.isArchived);
    }
    const needle = search.trim().toLowerCase();
    if (needle) {
      list = list.filter((project) => project.name.toLowerCase().includes(needle));
    }
    return [...list].sort((a, b) => {
      const aFav = favoriteSet.has(a.id) ? 0 : 1;
      const bFav = favoriteSet.has(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [projectsQuery.data, status, search, favoriteSet]);

  const isLoading = projectsQuery.isLoading || clientsQuery.isLoading || trackedQuery.isLoading;
  const isError = projectsQuery.isError || clientsQuery.isError || trackedQuery.isError;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setDialogOpen(true);
  }

  async function handleSubmit(values: { name: string; clientId: string }) {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        input: { name: values.name, clientId: values.clientId },
      });
      return;
    }
    await createMutation.mutateAsync(values);
  }

  async function handleArchive(project: Project) {
    await updateMutation.mutateAsync({
      id: project.id,
      input: { isArchived: true },
    });
  }

  function retry() {
    void projectsQuery.refetch();
    void clientsQuery.refetch();
    void trackedQuery.refetch();
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie projetos, clientes vinculados e tempo apontado
        </p>
      </div>

      <ProjectsToolbar
        status={status}
        onStatusChange={setStatus}
        clientId={clientId}
        onClientChange={setClientId}
        search={search}
        onSearchChange={setSearch}
        clients={clientsQuery.data ?? []}
        canManage={canManage}
        onCreate={openCreate}
      />

      {isError ? (
        <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <p className="text-destructive text-sm">Não foi possível carregar os projetos.</p>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <ProjectsTable
        projects={filteredProjects}
        trackedByProjectId={trackedByProjectId}
        favoriteIds={favoriteSet}
        canManage={canManage}
        isLoading={isLoading}
        onEdit={openEdit}
        onArchive={(project) => void handleArchive(project)}
        onToggleFavorite={(project) => toggleFavorite(project.id)}
      />

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clients={(clientsQuery.data ?? []).filter((client) => client.isActive)}
        project={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
