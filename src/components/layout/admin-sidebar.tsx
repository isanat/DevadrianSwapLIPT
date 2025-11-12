'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DevAdrianSwapIcon } from '../icons/devadrian-swap-icon';
import { 
    Sidebar, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuSub,
    SidebarMenuSubContent,
    SidebarMenuSubTrigger,
    SidebarMenuButton,
} from '../ui/sidebar';

import {
  Home,
  Shield,
  Archive,
  Droplets,
  Pickaxe,
  Gift,
  Gamepad2,
  RotateCw,
  Rocket,
  Ticket
} from 'lucide-react';

export function AdminSidebar() {
    const pathname = usePathname();

    const checkActive = (path: string, exact = false) => {
        return exact ? pathname === path : pathname.startsWith(path);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                 <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <DevAdrianSwapIcon className="h-6 w-6 text-primary" />
                    <span>DevAdrian Swap</span>
                </Link>
            </SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/admin" legacyBehavior passHref>
                        <SidebarMenuButton isActive={checkActive('/admin', true)}>
                            <Home />
                            Dashboard
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>

                <SidebarMenuSub open={checkActive('/admin/staking') || checkActive('/admin/liquidity') || checkActive('/admin/mining') || checkActive('/admin/referrals')}>
                    <SidebarMenuSubTrigger>
                        <SidebarMenuButton>
                            <Shield />
                            DeFi Management
                        </SidebarMenuButton>
                    </SidebarMenuSubTrigger>
                    <SidebarMenuSubContent>
                         <Link href="/admin/staking" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/staking')}>
                                <Archive /> Staking Pools
                            </SidebarMenuButton>
                        </Link>
                        <Link href="/admin/liquidity" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/liquidity')}>
                               <Droplets /> Liquidity Pools
                            </SidebarMenuButton>
                        </Link>
                        <Link href="/admin/mining" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/mining')}>
                                <Pickaxe /> Mining Room
                            </SidebarMenuButton>
                        </Link>
                        <Link href="/admin/referrals" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/referrals')}>
                                <Gift /> Referral Program
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuSubContent>
                </SidebarMenuSub>

                <SidebarMenuSub open={checkActive('/admin/games')}>
                    <SidebarMenuSubTrigger>
                        <SidebarMenuButton>
                            <Gamepad2 />
                            Game Zone
                        </SidebarMenuButton>
                    </SidebarMenuSubTrigger>
                    <SidebarMenuSubContent>
                        <Link href="/admin/games/wheel" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/games/wheel')}>
                                <RotateCw /> Wheel of Fortune
                            </SidebarMenuButton>
                        </Link>
                         <Link href="/admin/games/rocket" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/games/rocket')}>
                                <Rocket /> LIPT Rocket
                            </SidebarMenuButton>
                        </Link>
                         <Link href="/admin/games/lottery" legacyBehavior passHref>
                            <SidebarMenuButton size="sm" isActive={checkActive('/admin/games/lottery')}>
                                <Ticket /> Daily Lottery
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuSubContent>
                </SidebarMenuSub>
            </SidebarMenu>
        </Sidebar>
    );
}
