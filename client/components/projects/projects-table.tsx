'use client';

import { Archive, Pencil, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/components/ui/cn';
import { formatDurationHMS } from '@/lib/datetime';
import type { Project } from '@/types/api';

interface ProjectsTableProps {
  projects: Project[];
  trackedByProjectId: Map<string, number>;
  favoriteIds: Set<string>;
  canManage: boolean;
  isLoading?: boolean;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
}

export function ProjectsTable({
  projects,
  trackedByProjectId,
  favoriteIds,
  canManage,
  isLoading,
  onEdit,
  onArchive,
  onToggleFavorite,
}: ProjectsTableProps) {
  if (isLoading) {
    return (
      <div className="border-border bg-card space-y-3 rounded-lg border p-4">
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="border-border bg-card rounded-lg border px-4 py-10 text-center">
        <p className="text-muted-foreground text-sm">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-border border-b text-xs tracking-wide uppercase">
              <th scope="col" className="w-12 px-2 py-2.5 font-medium">
                <span className="sr-only">Favorito</span>
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Nome
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Cliente
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Apontado
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
            {projects.map((project) => {
              const color = project.client?.color ?? '#9CA3AF';
              const tracked = trackedByProjectId.get(project.id) ?? 0;
              const favorited = favoriteIds.has(project.id);
              return (
                <tr key={project.id} className="border-border border-b last:border-b-0">
                  <td className="px-2 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={
                        favorited
                          ? `Remover ${project.name} dos favoritos`
                          : `Favoritar ${project.name}`
                      }
                      onClick={() => onToggleFavorite(project)}
                    >
                      <Star
                        className={cn(
                          'size-4',
                          favorited ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground',
                        )}
                      />
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      {project.name}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {project.client?.name ?? 'Sem cliente'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums">
                    {formatDurationHMS(tracked)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground text-xs">
                      {project.isArchived ? 'Arquivado' : 'Ativo'}
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
                          aria-label={`Editar ${project.name}`}
                          onClick={() => onEdit(project)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {!project.isArchived ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Arquivar ${project.name}`}
                            onClick={() => onArchive(project)}
                          >
                            <Archive className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
