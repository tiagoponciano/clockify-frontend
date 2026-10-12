'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { ModeToggle } from '@/components/ui/theme-toggle';

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-2">
          <a href="/login" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md">
              <Image
                src="/images/NEOLogo.ico"
                alt="NEO"
                width={20}
                height={20}
                className="mr-1"
              />
            </div>
            Mentes brilhantes crescem juntas.
          </a>
          <div className="lg:hidden">
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <img
          src="/images/neo-team.jpg"
          alt="Equipe NEO"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute top-4 right-4 z-10">
          <ModeToggle className="border-0 bg-white/50 shadow-md backdrop-blur-md hover:bg-white/70 dark:bg-black/40 dark:hover:bg-black/55" />
        </div>
      </div>
    </div>
  );
}
