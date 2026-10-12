import { z } from 'zod';
import { getManualEntryMinDate, localPartsToUtcISO } from '@/lib/datetime';

export const manualEntrySchema = z
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
    const now = Date.now();
    const min = getManualEntryMinDate().getTime();

    if (startMs > now) {
      ctx.addIssue({ code: 'custom', message: 'A data de início não pode estar no futuro.', path: ['date'] });
    }
    if (startMs < min) {
      ctx.addIssue({ code: 'custom', message: 'A data de início não pode ser anterior a 10 dias.', path: ['date'] });
    }
    if (endMs <= startMs) {
      ctx.addIssue({ code: 'custom', message: 'O fim deve ser depois do início.', path: ['endTime'] });
    }
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationHours > 24) {
      ctx.addIssue({ code: 'custom', message: 'A duração máxima é de 24 horas.', path: ['endTime'] });
    }
  });

export type ManualEntryFormValues = z.infer<typeof manualEntrySchema>;
