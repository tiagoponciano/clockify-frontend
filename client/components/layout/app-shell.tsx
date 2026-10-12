'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from './app-sidebar';

const COLLAPSE_STORAGE_KEY = 'clockify.sidebar.collapsed';

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
