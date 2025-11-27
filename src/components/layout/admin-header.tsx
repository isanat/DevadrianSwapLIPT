'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DevAdrianSwapIcon } from '../icons/devadrian-swap-icon';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


const navLinks = [
    { href: '/admin/staking', label: 'Staking' },
    { href: '/admin/liquidity', label: 'Liquidity' },
    { href: '/admin/mining', label: 'Mining' },
    { href: '/admin/referrals', label: 'Referrals' },
    { href: '/admin/tokens', label: 'Token Management' },
    { href: '/admin/settings', label: 'Platform Settings' },
];

const gameLinks = [
    { href: '/admin/games/wheel', label: 'Wheel of Fortune' },
    { href: '/admin/games/rocket', label: 'LIPT Rocket' },
    { href: '/admin/games/lottery', label: 'Daily Lottery' },
]

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/admin" className="flex items-center gap-2">
            <DevAdrianSwapIcon className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              DevAdrian Swap
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/admin" legacyBehavior passHref>
                        <NavigationMenuLink active={pathname === '/admin'} className={navigationMenuTriggerStyle()}>
                            Dashboard
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>DeFi Management</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            {navLinks.map((link) => (
                                <ListItem key={link.label} href={link.href} title={link.label} />
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                 <NavigationMenuItem>
                    <NavigationMenuTrigger>Game Zone</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            {gameLinks.map((link) => (
                                <ListItem key={link.label} href={link.href} title={link.label} />
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className='h-9 w-9'>
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
            <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
