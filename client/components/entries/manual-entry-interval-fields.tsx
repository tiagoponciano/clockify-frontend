import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ManualEntryFormValues } from './manual-entry-schema';

type ManualEntryIntervalFieldsProps = {
  form: UseFormReturn<ManualEntryFormValues>;
  previewDuration: string | null;
  minDate: string;
  maxDate: string;
};

/** Date, start and end inputs with the live duration preview and their errors. */
export function ManualEntryIntervalFields({
  form,
  previewDuration,
  minDate,
  maxDate,
}: ManualEntryIntervalFieldsProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Intervalo</p>
        <p className="font-mono text-sm tabular-nums text-muted-foreground">
          {previewDuration ? `Duração ${previewDuration}` : '—'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="manual-date">Data</Label>
          <Input id="manual-date" type="date" min={minDate} max={maxDate} {...form.register('date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-start">Início</Label>
          <Input id="manual-start" type="time" {...form.register('startTime')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-end">Fim</Label>
          <Input id="manual-end" type="time" {...form.register('endTime')} />
        </div>
      </div>
      {form.formState.errors.date ? (
        <p className="mt-2 text-sm text-destructive">{form.formState.errors.date.message}</p>
      ) : null}
      {form.formState.errors.endTime ? (
        <p className="mt-2 text-sm text-destructive">{form.formState.errors.endTime.message}</p>
      ) : null}
    </div>
  );
}
