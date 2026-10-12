'use client';

import { AuthGuard } from '@/components/layout/auth-guard';
import { AppShell } from '@/components/layout/app-sidebar';
import { AuthProvider } from '@/components/providers/auth-provider';
import { MockBanner, MockBootstrap } from '@/components/providers/mock-bootstrap';
import { QueryProvider } from '@/components/providers/query-provider';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <MockBootstrap />
      <AuthProvider>
        <AuthGuard>
          <MockBanner />
          <AppShell>{children}</AppShell>
        </AuthGuard>
      </AuthProvider>
    </QueryProvider>
  );
}
