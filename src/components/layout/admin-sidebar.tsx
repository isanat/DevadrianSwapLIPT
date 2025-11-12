'use client';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubContent,
  SidebarMenuSubItem,
  SidebarMenuSubTrigger,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart2,
  Settings,
  Users,
  Shield,
  Gamepad2,
  Pickaxe,
  Archive,
} from 'lucide-react';
import { DevAdrianSwapIcon } from '@/components/icons/devadrian-swap-icon';
import { Button } from '../ui/button';
import { useI18n } from '@/context/i18n-context';

export function AdminSidebar() {
  const { state } = useSidebar();
  const { t } = useI18n();

  return (
    <>
      <SidebarHeader>
        <div className="flex h-10 w-full items-center gap-2 border-b border-sidebar-border px-2">
            <Button asChild variant="ghost" className="h-auto p-1 text-primary">
                <a href="/">
                    <DevAdrianSwapIcon className="size-6 shrink-0" />
                </a>
            </Button>

            <h2
            className="text-base font-semibold duration-200"
            data-state={state}
            >
            DevAdrian Swap
            </h2>
            <div className="flex-1" />
            <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/admin"
              tooltip={{ children: 'Dashboard' }}
              isActive
            >
              <BarChart2 />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              tooltip={{ children: 'User Management' }}
            >
              <Users />
              <span>User Management</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
            
          <SidebarMenuSub asChild>
              <SidebarMenuItem>
                <SidebarMenuSubTrigger tooltip={{ children: 'DeFi Management' }} isSubmenu>
                    <Shield />
                    <span>DeFi Management</span>
                </SidebarMenuSubTrigger>
                <SidebarMenuSubContent>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                            <Archive />
                            Staking Pools
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                             <Pickaxe />
                            Mining Room
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSubContent>
              </SidebarMenuItem>
            </SidebarMenuSub>

           <SidebarMenuSub asChild>
             <SidebarMenuItem>
                <SidebarMenuSubTrigger tooltip={{ children: 'Game Zone' }} isSubmenu>
                    <Gamepad2 />
                    <span>Game Zone</span>
                </SidebarMenuSubTrigger>
                <SidebarMenuSubContent>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                            Wheel of Fortune
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                            LIPT Rocket
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                            Daily Lottery
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSubContent>
             </SidebarMenuItem>
            </SidebarMenuSub>

          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              tooltip={{ children: 'Settings' }}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
