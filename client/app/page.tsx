'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredToken } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredToken() ? '/timer' : '/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Redirecionando…
    </main>
  );
}
