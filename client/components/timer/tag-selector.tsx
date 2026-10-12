'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/hooks/use-projects';
import { useTags } from '@/hooks/use-tags';
import { Tags } from 'lucide-react';

interface TagSelectorProps {
  projectId: string | null;
  value: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export function TagSelector({ projectId, value, onChange, disabled }: TagSelectorProps) {
  const { data: projects = [] } = useProjects();
  const { data: tags = [], isLoading } = useTags(projectId);
  const enabled = !!projectId && !disabled;

  const project = projects.find((item) => item.id === projectId);

  const label = !projectId
    ? 'Escolha o projeto'
    : value.length === 0
      ? 'Tags do projeto'
      : value.length === 1
        ? (tags.find((tag) => tag.id === value[0])?.name ?? '1 tag')
        : `${value.length} tags`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={!enabled || isLoading}
          className="w-[160px] justify-start font-normal"
          title={!projectId ? 'Selecione um projeto para ver as tags' : undefined}
        >
          <Tags className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          {project ? `Tags de ${project.name}` : 'Tags do projeto'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tags.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            {project ? 'Este projeto ainda não tem tags.' : 'Nenhuma tag disponível.'}
          </div>
        ) : (
          tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={value.includes(tag.id)}
              onCheckedChange={(checked) => {
                onChange(checked ? [...value, tag.id] : value.filter((id) => id !== tag.id));
              }}
            >
              {tag.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
