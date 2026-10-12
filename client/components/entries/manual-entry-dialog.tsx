'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectCombobox } from '@/components/timer/project-combobox';
import { TagSelector } from '@/components/timer/tag-selector';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formatDurationHMS,
  formatLocal,
  getManualEntryMaxDate,
  getManualEntryMinDate,
  localPartsToUtcISO,
} from '@/lib/datetime';
import { ManualEntryIntervalFields } from './manual-entry-interval-fields';
import { manualEntrySchema, type ManualEntryFormValues } from './manual-entry-schema';

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    description?: string;
    projectId: string;
    tagIds?: string[];
    startedAt: string;
    endedAt: string;
  }) => Promise<void>;
}

export function ManualEntryDialog({ open, onOpenChange, onSubmit }: ManualEntryDialogProps) {
  const today = formatLocal(new Date(), 'yyyy-MM-dd');
  const minDate = formatLocal(getManualEntryMinDate(), 'yyyy-MM-dd');
  const maxDate = formatLocal(getManualEntryMaxDate(), 'yyyy-MM-dd');
  const nowTime = formatLocal(new Date(), 'HH:mm');

  const form = useForm<ManualEntryFormValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      description: '',
      projectId: '',
      tagIds: [],
      date: today,
      startTime: '09:00',
      endTime: nowTime,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      description: '',
      projectId: '',
      tagIds: [],
      date: today,
      startTime: '09:00',
      endTime: formatLocal(new Date(), 'HH:mm'),
    });
  }, [open, form, today]);

  const watched = form.watch();
  const previewDuration = useMemo(() => {
    if (!watched.date || !watched.startTime || !watched.endTime) {
      return null;
    }
    try {
      const startMs = new Date(localPartsToUtcISO(watched.date, watched.startTime)).getTime();
      const endMs = new Date(localPartsToUtcISO(watched.date, watched.endTime)).getTime();
      if (endMs <= startMs) {
        return null;
      }
      return formatDurationHMS(Math.floor((endMs - startMs) / 1000));
    } catch {
      return null;
    }
  }, [watched.date, watched.startTime, watched.endTime]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      description: values.description || undefined,
      projectId: values.projectId,
      tagIds: values.tagIds.length > 0 ? values.tagIds : undefined,
      startedAt: localPartsToUtcISO(values.date, values.startTime),
      endedAt: localPartsToUtcISO(values.date, values.endTime),
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Adicionar manualmente</DialogTitle>
          <DialogDescription>
            Lance um intervalo já finalizado. Projeto é obrigatório; tags dependem do projeto escolhido.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 px-6 py-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="manual-description">Descrição</Label>
            <Input
              id="manual-description"
              placeholder="O que você fez?"
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <p className="text-xs text-muted-foreground">Disponíveis após escolher o projeto.</p>
            </div>
          </div>

          <ManualEntryIntervalFields
            form={form}
            previewDuration={previewDuration}
            minDate={minDate}
            maxDate={maxDate}
          />

          <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-between">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Janela permitida: últimos 10 dias · máx. 24h
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="accent">
                Adicionar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
