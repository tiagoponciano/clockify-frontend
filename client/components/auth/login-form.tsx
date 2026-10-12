'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch, getApiBaseUrl, setStoredToken } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('dev@neo.local');
  const [name, setName] = useState('Dev User');
  const [loading, setLoading] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth_failed') {
      toast.error('Falha no login');
    }
  }, []);

  const handleDevLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch<{ accessToken: string } | { token: string }>('/api/auth/dev-login', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      });
      const token = 'accessToken' in response ? response.accessToken : response.token;
      setStoredToken(token);
      router.replace('/timer');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Falha no login de desenvolvimento.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Faça login na sua conta</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Use sua conta Google da CERTI para acessar.
        </p>
      </div>

      <a
        href={`${getApiBaseUrl()}/api/auth/google`}
        className="inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-background text-sm font-medium transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Image src="/icons8-google.svg" alt="" width={18} height={18} />
        Entrar com Google
      </a>

      {isDev ? (
        <form onSubmit={(event) => void handleDevLogin(event)} className="space-y-3 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">Login de desenvolvimento</p>
          <div className="space-y-2">
            <Label htmlFor="dev-email">E-mail</Label>
            <Input id="dev-email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dev-name">Nome</Label>
            <Input id="dev-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar (dev)'}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
