'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-row bg-background text-foreground">
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <SidebarInset>
             {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
