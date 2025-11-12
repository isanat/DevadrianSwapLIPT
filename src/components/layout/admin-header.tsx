'use client';

import Link from 'next/link';
import { Bell, Shield, Home, Droplets, Pickaxe, Gift, Gamepad2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { DevAdrianSwapIcon } from '@/components/icons/devadrian-swap-icon';
import { ThemeToggle } from './theme-toggle';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '@/lib/utils';
import React from 'react';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenu.Link asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenu.Link>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export function AdminHeader() {

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
       <div className='flex items-center gap-6'>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <DevAdrianSwapIcon className="h-6 w-6 text-primary" />
                <span className="font-bold">DevAdrian Swap</span>
            </Link>

            <NavigationMenu.Root className="relative z-10 hidden md:flex">
                <NavigationMenu.List className="group flex flex-1 list-none items-center justify-center space-x-1">
                    <NavigationMenu.Item>
                        <Link href="/admin" legacyBehavior passHref>
                            <NavigationMenu.Link className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50", 'gap-2')}>
                                <Home className="h-4 w-4" /> Dashboard
                            </NavigationMenu.Link>
                        </Link>
                    </NavigationMenu.Item>

                    <NavigationMenu.Item>
                        <NavigationMenu.Trigger className='gap-2'>
                           <Shield className="h-4 w-4" /> DeFi Management
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                <ListItem href="/admin/staking" title="Staking Pools">
                                    Monitor and manage all staking activities and plans.
                                </ListItem>
                                <ListItem href="/admin/liquidity" title="Liquidity Pools">
                                    View TVL, volume, and fees for LIPT/USDT pools.
                                </ListItem>
                                <ListItem href="/admin/mining" title="Mining Room">
                                    Oversee active miners, mining power, and rewards.
                                </ListItem>
                                <ListItem href="/admin/referrals" title="Referral Program">
                                    Track referral networks and commission payouts.
                                </ListItem>
                            </ul>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>

                    <NavigationMenu.Item>
                        <NavigationMenu.Trigger className='gap-2'>
                            <Gamepad2 className="h-4 w-4" /> Game Zone
                        </NavigationMenu.Trigger>
                         <NavigationMenu.Content>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                <ListItem href="/admin/games/wheel" title="Wheel of Fortune">
                                    Adjust game parameters and view play history.
                                </ListItem>
                                <ListItem href="/admin/games/rocket" title="LIPT Rocket">
                                    Configure crash game settings and monitor rounds.
                                </ListItem>
                                <ListItem href="/admin/games/lottery" title="Daily Lottery">
                                    Manage lottery draws, prize pools, and view winners.
                                </ListItem>
                            </ul>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>


      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
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