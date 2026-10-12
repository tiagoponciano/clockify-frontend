'use client';

import { useEffect } from 'react';
import { getStoredToken, isMockApiEnabled, setStoredToken } from '@/lib/api';
import { MOCK_ACCESS_TOKEN } from '@/lib/mock/data';

export function MockBootstrap() {
  useEffect(() => {
    if (isMockApiEnabled() && !getStoredToken()) {
      setStoredToken(MOCK_ACCESS_TOKEN);
    }
  }, []);

  return null;
}

export function MockBanner() {
  if (!isMockApiEnabled()) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
      Modo demonstração — dados mockados (Balancer, BL008, NEO, etc.). START sem projeto funciona; STOP exige projeto.
    </div>
  );
}
