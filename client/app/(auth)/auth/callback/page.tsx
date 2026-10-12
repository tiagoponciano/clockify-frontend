'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setStoredToken } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    setStoredToken(token);
    router.replace('/timer');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Entrando…
    </main>
  );
}
