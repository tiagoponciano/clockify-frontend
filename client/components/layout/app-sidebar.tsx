'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarBrand } from './sidebar-brand';
import { SidebarFooter } from './sidebar-footer';
import { NavLinks } from './sidebar-nav';

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <SidebarBrand collapsed={collapsed} onToggle={onToggle} />
      <NavLinks collapsed={collapsed} onNavigate={onNavigate} />
      <SidebarFooter collapsed={collapsed} />
    </>
  );
}

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex',
          collapsed ? 'w-[72px]' : 'w-60',
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      <div className="flex items-center gap-2 border-b border-border bg-background p-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">Clockify NEO</span>
      </div>
    </>
  );
}
