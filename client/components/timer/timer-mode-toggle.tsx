import { ListPlus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TimerModeToggleProps = {
  onManualClick: () => void;
};

/** Timer mode (current, disabled) and the button that opens the manual entry dialog. */
export function TimerModeToggle({ onManualClick }: TimerModeToggleProps) {
  return (
    <div className="border-border flex overflow-hidden rounded-md border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="bg-muted/50 size-9 rounded-none"
        aria-label="Modo timer"
        title="Modo timer"
        disabled
      >
        <Timer className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-none"
        aria-label="Adicionar manualmente"
        title="Adicionar manualmente"
        onClick={onManualClick}
      >
        <ListPlus className="size-4" />
      </Button>
    </div>
  );
}
