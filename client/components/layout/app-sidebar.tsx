'use client';

import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Menu,
  PieChart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const COLLAPSE_STORAGE_KEY = 'clockify.sidebar.collapsed';
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

function NavLinks({
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

function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mt-auto border-t border-sidebar-border p-3">
      <div className={cn('flex items-center gap-3 rounded-md p-2', collapsed && 'justify-center')}>
        <Avatar className="h-9 w-9 shrink-0" title={collapsed ? user?.name : undefined}>
          {user?.picture ? <AvatarImage src={user.picture} alt={user.name} /> : null}
          <AvatarFallback>{initials ?? '?'}</AvatarFallback>
        </Avatar>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Usuário'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        ) : null}
      </div>
      {!collapsed ? (
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={logout}>
          Sair
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="mt-2 w-full"
          onClick={logout}
          aria-label="Sair"
          title="Sair"
        >
          <span className="text-xs">Sair</span>
        </Button>
      )}
    </div>
  );
}

function SidebarBrand({
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === 'true') {
        setCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
