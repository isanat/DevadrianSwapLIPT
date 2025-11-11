import { ReactNode } from 'react';
import { MainSidebar } from './main-sidebar';
import { Header } from './header';
import { SidebarInset } from '@/components/ui/sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
