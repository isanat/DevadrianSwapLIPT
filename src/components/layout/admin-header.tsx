'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { DevAdrianSwapIcon } from '@/components/icons/devadrian-swap-icon';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { href: '/admin/staking', label: 'DeFi Management', icon: <Shield className="h-4 w-4" /> },
];

export function AdminHeader() {
    const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <DevAdrianSwapIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">DevAdrian Swap</span>
        </Link>
        {navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "flex items-center gap-2 transition-colors hover:text-foreground",
                    pathname === link.href ? "text-foreground" : "text-muted-foreground"
                )}
            >
                {link.icon}
                {link.label}
            </Link>
        ))}
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Search could go here in the future */}
        </div>
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
