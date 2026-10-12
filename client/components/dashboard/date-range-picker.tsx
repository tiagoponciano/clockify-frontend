'use client';

import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/cn';
import {
  DATE_RANGE_PRESETS,
  getCustomRange,
  getPresetRange,
  type DashboardDateRange,
  type DateRangePresetId,
} from '@/lib/datetime';

function dayKeyFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localDateFromDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function selectionToDateRange(value: DashboardDateRange): DateRange {
  return {
    from: localDateFromDayKey(value.days[0]),
    to: localDateFromDayKey(value.days[value.days.length - 1]),
  };
}

interface DateRangePickerProps {
  value: DashboardDateRange;
  onChange: (range: DashboardDateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<DateRange | undefined>();
  const committed = useMemo(() => selectionToDateRange(value), [value]);
  const selected = pending ?? committed;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPending(undefined);
  };

  const handlePreset = (id: DateRangePresetId) => {
    setPending(undefined);
    onChange(getPresetRange(id));
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;
    if (!range.to) {
      setPending({ from: range.from, to: undefined });
      return;
    }
    setPending(undefined);
    onChange(getCustomRange(dayKeyFromLocalDate(range.from), dayKeyFromLocalDate(range.to)));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-9 min-w-[180px] justify-start gap-2 px-3 font-normal')}
          aria-label="Selecionar período"
        >
          <CalendarIcon className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{value.shortLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[calc(100vh-2rem)] w-auto max-w-[calc(100vw-1rem)] overflow-auto p-0"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="border-border flex flex-col gap-0.5 border-b p-2 sm:w-44 sm:border-r sm:border-b-0">
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                  value.presetId === preset.id && 'bg-accent text-accent-foreground hover:bg-accent',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            locale={ptBR}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={committed.from}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
