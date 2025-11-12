'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { ThemeToggle } from './theme-toggle';

export function AdminHeader() {

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       {/* A busca pode ser adicionada aqui no futuro, se necessário */}
      <div className="relative ml-auto flex-1 md:grow-0">
         {/* Search Input Placeholder */}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
