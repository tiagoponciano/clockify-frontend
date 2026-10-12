'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

export function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
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
