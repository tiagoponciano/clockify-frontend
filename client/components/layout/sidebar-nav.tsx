'use client';

import { Building2, ChevronDown, Clock, FolderKanban, LayoutDashboard, PieChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { cn } from '@/components/ui/cn';

const MANAGE_OPEN_KEY = 'clockify.sidebar.manageOpen';

type NavLeaf = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const analyzeItems: NavLeaf[] = [
  { href: '/timer', label: 'Timer', icon: Clock },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Relatórios', icon: PieChart },
];

const manageItems: NavLeaf[] = [
  { href: '/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/clients', label: 'Clientes', icon: Building2 },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinkItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavLeaf;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{item.label}</span> : null}
    </Link>
  );
}

export function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const manageActive = manageItems.some((item) => isActivePath(pathname, item.href));
  const [manageOpen, setManageOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MANAGE_OPEN_KEY);
      if (stored === 'false') {
        setManageOpen(false);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (manageActive) {
      setManageOpen(true);
    }
  }, [manageActive]);

  function toggleManage() {
    setManageOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(MANAGE_OPEN_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {analyzeItems.map((item) => (
        <NavLinkItem key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}

      {collapsed ? (
        manageItems.map((item) => (
          <NavLinkItem key={item.href} item={item} collapsed onNavigate={onNavigate} />
        ))
      ) : (
        <div className="mt-2">
          <button
            type="button"
            onClick={toggleManage}
            className={cn(
              'text-sidebar-foreground/60 hover:text-sidebar-foreground flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors',
              manageActive && 'text-sidebar-foreground',
            )}
            aria-expanded={manageOpen}
          >
            <span>Gestão</span>
            <ChevronDown
              className={cn('size-3.5 transition-transform', manageOpen ? 'rotate-0' : '-rotate-90')}
            />
          </button>
          {manageOpen ? (
            <div className="mt-1 flex flex-col gap-1 border-l border-sidebar-border ml-3 pl-1">
              {manageItems.map((item) => (
                <NavLinkItem key={item.href} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}
