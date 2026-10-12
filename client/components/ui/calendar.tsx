'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from './cn';

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'relative flex flex-col gap-4',
        month_caption: 'flex h-8 items-center justify-center px-8',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous:
          'inline-flex size-7 items-center justify-center rounded-md border border-border bg-transparent opacity-70 hover:opacity-100',
        button_next:
          'inline-flex size-7 items-center justify-center rounded-md border border-border bg-transparent opacity-70 hover:opacity-100',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-8 rounded-md text-[0.8rem] font-normal',
        week: 'mt-2 flex w-full',
        day: 'relative h-8 w-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button:
          'inline-flex size-8 items-center justify-center rounded-md p-0 font-normal hover:bg-muted',
        // Capsule range (Clockify): solid ends, continuous very-low-opacity middle.
        range_start:
          'rounded-l-md bg-accent/10 [&>button]:rounded-md [&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:hover:bg-accent [&>button]:hover:text-accent-foreground',
        range_end:
          'rounded-r-md bg-accent/10 [&>button]:rounded-md [&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:hover:bg-accent [&>button]:hover:text-accent-foreground',
        range_middle:
          'rounded-none bg-accent/10 [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-foreground [&>button]:hover:bg-transparent',
        selected: '',
        today: '[&>button]:font-semibold [&>button]:ring-1 [&>button]:ring-accent/60',
        outside: 'text-muted-foreground opacity-50 aria-selected:text-foreground aria-selected:opacity-100',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className={cn('size-4', chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
