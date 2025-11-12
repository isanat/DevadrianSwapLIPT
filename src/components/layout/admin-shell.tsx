'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <main className="flex-1">
             {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
