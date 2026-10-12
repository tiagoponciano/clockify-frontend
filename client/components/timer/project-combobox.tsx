'use client';

import { Check, ChevronsUpDown, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/components/ui/cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFavoriteProjects } from '@/hooks/use-favorite-projects';
import { useClients, useProjects } from '@/hooks/use-projects';
import { formatProjectLabel, type Project } from '@/types/api';

interface ProjectComboboxProps {
  value: string | null;
  onChange: (projectId: string, project?: Project) => void;
  disabled?: boolean;
  required?: boolean;
  highlight?: boolean;
}

export function ProjectCombobox({
  value,
  onChange,
  disabled,
  required,
  highlight,
}: ProjectComboboxProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavoriteProjects(user?.id);

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => !project.isArchived)
        .map((project) => ({
          ...project,
          client: project.client ?? clientMap.get(project.clientId),
        })),
    [projects, clientMap],
  );

  const favorites = useMemo(() => {
    const byId = new Map(activeProjects.map((project) => [project.id, project]));
    return favoriteIds.flatMap((id) => {
      const project = byId.get(id);
      return project ? [project] : [];
    });
  }, [activeProjects, favoriteIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const project of activeProjects) {
      const key = project.client?.name ?? 'Sem cliente';
      const list = map.get(key) ?? [];
      list.push(project);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  }, [activeProjects]);

  const selected = activeProjects.find((project) => project.id === value);
  const selectedClient = selected?.client ?? null;

  function renderProjectItem(project: Project, clientName: string) {
    const client = project.client ?? clientMap.get(project.clientId);
    const favorited = isFavorite(project.id);
    return (
      <CommandItem
        key={project.id}
        value={`${clientName} ${project.name}`}
        onSelect={() => {
          onChange(project.id, project);
          setOpen(false);
        }}
        className="gap-2"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: client?.color ?? '#a3a3a3' }}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">{project.name}</span>
          <span className="truncate text-xs text-muted-foreground">{clientName}</span>
        </span>
        <button
          type="button"
          className="text-muted-foreground hover:text-amber-500 rounded p-0.5"
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(project.id);
          }}
        >
          <Star
            className={cn('size-3.5', favorited && 'fill-amber-500 text-amber-500')}
          />
        </button>
        <Check className={cn('size-4', value === project.id ? 'opacity-100' : 'opacity-0')} />
      </CommandItem>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            'h-auto min-h-10 w-[240px] justify-between py-2 font-normal',
            required && !value && 'border-destructive/60',
            highlight && 'border-destructive ring-1 ring-destructive/40',
          )}
        >
          <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
            {selected ? (
              <>
                <span className="flex items-center gap-2">
                  {selectedClient ? (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: selectedClient.color }}
                    />
                  ) : null}
                  <span className="truncate font-medium">
                    {formatProjectLabel({ ...selected, client: selectedClient })}
                  </span>
                </span>
                {selectedClient ? (
                  <span className="text-muted-foreground truncate pl-[18px] text-xs">
                    {selectedClient.name}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">
                {required ? 'Selecione o projeto *' : '+ Projeto'}
              </span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar projeto ou cliente…" />
          <CommandList>
            <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            {favorites.length > 0 ? (
              <CommandGroup heading="Favoritos">
                {favorites.map((project) =>
                  renderProjectItem(project, project.client?.name ?? 'Sem cliente'),
                )}
              </CommandGroup>
            ) : null}
            {grouped.map(([clientName, items]) => (
              <CommandGroup key={clientName} heading={clientName}>
                {items.map((project) => renderProjectItem(project, clientName))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
