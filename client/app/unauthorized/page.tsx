'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';

export default function UnauthorizedPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email'));
  }, []);

  return (
    <AuthSplitLayout>
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Acesso não permitido</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {email ? (
              <>
                <span className="font-medium text-foreground">{email}</span> não é um e-mail
                @certi.org.br.
              </>
            ) : (
              <>Use um e-mail @certi.org.br.</>
            )}
          </p>
        </div>

        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          Só contas CERTI têm acesso.
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
