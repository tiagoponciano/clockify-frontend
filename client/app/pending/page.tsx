'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { getPendingEmail, setPendingEmail } from '@/lib/auth';

export default function PendingPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('email');
    if (fromQuery) {
      setPendingEmail(fromQuery);
      setEmail(fromQuery);
      return;
    }
    setEmail(getPendingEmail());
  }, []);

  return (
    <AuthSplitLayout>
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Aguardando aprovação</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {email ? (
              <>
                Pedido enviado para <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              <>Pedido de acesso enviado.</>
            )}{' '}
            Aguarde a liberação de um administrador.
          </p>
        </div>

        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Depois, entre de novo com o Google.
        </div>

        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-full border border-border bg-background text-sm font-medium transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Voltar ao login
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
