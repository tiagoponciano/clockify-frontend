'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client, Project } from '@/types/api';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(160),
  clientId: z.string().min(1, 'Selecione um cliente.'),
});

type FormValues = z.infer<typeof schema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  project?: Project | null;
  isSubmitting?: boolean;
  onSubmit: (values: { name: string; clientId: string }) => Promise<void>;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  clients,
  project,
  isSubmitting,
  onSubmit,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(project);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', clientId: '' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: project?.name ?? '',
      clientId: project?.clientId ?? '',
    });
  }, [open, project, form]);

  async function handleSubmit(values: FormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar projeto' : 'Criar projeto'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize o nome ou o cliente deste projeto.'
              : 'Informe o nome e vincule a um cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="project-name">Nome</Label>
            <Input id="project-name" {...form.register('name')} autoFocus />
            {form.formState.errors.name ? (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-client">Cliente</Label>
            <Select
              value={form.watch('clientId') || undefined}
              onValueChange={(value) => form.setValue('clientId', value, { shouldValidate: true })}
            >
              <SelectTrigger id="project-client" className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
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
            {form.formState.errors.clientId ? (
              <p className="text-destructive text-xs">{form.formState.errors.clientId.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
