import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

export function SidebarBrand({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center border-b border-sidebar-border px-3 py-3',
        collapsed ? 'flex-col gap-2' : 'gap-2 px-4 py-4',
      )}
    >
      <div className={cn('flex min-w-0 flex-1 items-center gap-2', collapsed && 'justify-center')}>
        <Image src="/images/NEOLogo.ico" alt="NEO" width={24} height={24} className="shrink-0" />
        {!collapsed ? <span className="truncate font-semibold">Clockify NEO</span> : null}
      </div>
      {onToggle ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Encolher menu'}
          title={collapsed ? 'Expandir menu' : 'Encolher menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      ) : null}
    </div>
  );
}
