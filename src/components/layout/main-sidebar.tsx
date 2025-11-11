'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LiptonSwapIcon } from '../icons/lipton-swap-icon';
import { LayoutDashboard, Wallet, Users, Briefcase } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/referrals', label: 'Referral Network', icon: Users },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <LiptonSwapIcon className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg">LiptonSwap</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                icon={<item.icon />}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Placeholder for future items */}
      </SidebarFooter>
    </Sidebar>
  );
}
