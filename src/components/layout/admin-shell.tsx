'use client';

import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-row bg-background text-foreground">
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
