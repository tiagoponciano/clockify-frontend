'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ClientColorField,
  isValidClientColor,
  PRESET_COLORS,
} from '@/components/clients/client-color-field';
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
import type { Client } from '@/types/api';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(160),
  color: z.string().refine(isValidClientColor, 'Use uma cor no formato #RRGGBB.'),
});

type FormValues = z.infer<typeof schema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  isSubmitting?: boolean;
  onSubmit: (values: { name: string; color: string }) => Promise<void>;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  isSubmitting,
  onSubmit,
}: ClientFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: PRESET_COLORS[0] },
  });

  useEffect(() => {
    if (!open || !client) return;
    form.reset({
      name: client.name,
      color: client.color || PRESET_COLORS[0],
    });
  }, [open, client, form]);

  async function handleSubmit(values: FormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>Atualize o nome e a cor do cliente.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="client-name">Nome</Label>
            <Input id="client-name" {...form.register('name')} autoFocus />
            {form.formState.errors.name ? (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client-color">Cor</Label>
            <ClientColorField
              id="client-color"
              value={form.watch('color')}
              onChange={(color) => form.setValue('color', color, { shouldValidate: true })}
            />
            {form.formState.errors.color ? (
              <p className="text-destructive text-xs">{form.formState.errors.color.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
