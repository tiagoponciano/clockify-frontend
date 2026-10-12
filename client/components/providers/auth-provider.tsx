'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, getStoredToken, setStoredToken, setUnauthorizedHandler } from '@/lib/api';
import { mapBackendUser } from '@/lib/api-mappers';
import type { User } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getStoredToken());
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const raw = await apiFetch<Parameters<typeof mapBackendUser>[0]>('/api/auth/me');
      return mapBackendUser(raw);
    },
    enabled: hasToken,
    retry: false,
  });

  const logout = useCallback(() => {
    setStoredToken(null);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      router.replace('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading: hasToken && isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
