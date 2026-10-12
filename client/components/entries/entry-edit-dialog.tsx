'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProjectCombobox } from '@/components/timer/project-combobox';
import { TagSelector } from '@/components/timer/tag-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { localPartsToUtcISO, utcToLocalDate, utcToLocalTime } from '@/lib/datetime';
import type { TimeEntry } from '@/types/api';

const schema = z
  .object({
    description: z.string().optional(),
    projectId: z.string().min(1, 'Selecione um projeto.'),
    tagIds: z.array(z.string()),
    date: z.string().min(1, 'Informe a data'),
    startTime: z.string().min(1, 'Informe o início'),
    endTime: z.string().min(1, 'Informe o fim'),
  })
  .superRefine((data, ctx) => {
    const startedAt = localPartsToUtcISO(data.date, data.startTime);
    const endedAt = localPartsToUtcISO(data.date, data.endTime);
    const startMs = new Date(startedAt).getTime();
    const endMs = new Date(endedAt).getTime();
    if (endMs <= startMs) {
      ctx.addIssue({ code: 'custom', message: 'O fim deve ser depois do início.', path: ['endTime'] });
    }
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationHours > 24) {
      ctx.addIssue({ code: 'custom', message: 'A duração máxima é de 24 horas.', path: ['endTime'] });
    }
  });

type FormValues = z.infer<typeof schema>;

interface EntryEditDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    description?: string | null;
    projectId?: string | null;
    tagIds?: string[];
    startedAt: string;
    endedAt: string;
  }) => Promise<void>;
}

export function EntryEditDialog({ entry, open, onOpenChange, onSubmit }: EntryEditDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      projectId: '',
      tagIds: [],
      date: '',
      startTime: '',
      endTime: '',
    },
  });

  useEffect(() => {
    if (!entry) {
      return;
    }
    form.reset({
      description: entry.description ?? '',
      projectId: entry.projectId ?? '',
      tagIds: entry.tags?.map((tag) => tag.id) ?? [],
      date: utcToLocalDate(entry.startedAt),
      startTime: utcToLocalTime(entry.startedAt),
      endTime: entry.endedAt ? utcToLocalTime(entry.endedAt) : '',
    });
  }, [entry, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      description: values.description?.trim() ?? '',
      projectId: values.projectId,
      tagIds: values.tagIds,
      startedAt: localPartsToUtcISO(values.date, values.startTime),
      endedAt: localPartsToUtcISO(values.date, values.endTime),
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar apontamento</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...form.register('description')} />
          </div>
          <div className="space-y-2">
            <Label>Projeto *</Label>
            <ProjectCombobox
              value={form.watch('projectId') || null}
              onChange={(projectId) => {
                form.setValue('projectId', projectId, { shouldValidate: true });
                form.setValue('tagIds', []);
              }}
              required
            />
            {form.formState.errors.projectId ? (
              <p className="text-sm text-destructive">{form.formState.errors.projectId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagSelector
              projectId={form.watch('projectId') || null}
              value={form.watch('tagIds')}
              onChange={(tagIds) => form.setValue('tagIds', tagIds)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...form.register('date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Início</Label>
              <Input id="startTime" type="time" {...form.register('startTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fim</Label>
              <Input id="endTime" type="time" {...form.register('endTime')} />
            </div>
          </div>
          {form.formState.errors.endTime ? (
            <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
