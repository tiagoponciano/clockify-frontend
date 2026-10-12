'use client';

const PRESET_COLORS = [
  '#4A90D9',
  '#F97316',
  '#14B8A6',
  '#EAB308',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#22C55E',
  '#64748B',
  '#0EA5E9',
];

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

interface ClientColorFieldProps {
  value: string;
  onChange: (color: string) => void;
  id?: string;
}

export function isValidClientColor(color: string): boolean {
  return HEX_PATTERN.test(color);
}

export function ClientColorField({ value, onChange, id }: ClientColorFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Cores predefinidas">
        {PRESET_COLORS.map((color) => {
          const selected = value.toUpperCase() === color.toUpperCase();
          return (
            <button
              key={color}
              type="button"
              role="option"
              aria-selected={selected}
              className={`size-7 rounded-full border-2 transition ${
                selected ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
              aria-label={`Cor ${color}`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="border-border size-8 shrink-0 rounded-md border"
          style={{ backgroundColor: isValidClientColor(value) ? value : '#9CA3AF' }}
          aria-hidden
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#4A90D9"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-28 rounded-md border px-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Cor hexadecimal"
        />
      </div>
    </div>
  );
}

export { PRESET_COLORS };
