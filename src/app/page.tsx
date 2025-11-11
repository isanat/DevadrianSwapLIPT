import { Header } from '@/components/layout/header';
import { DraggableDashboardGrid } from '@/components/dashboard/draggable-dashboard-grid';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
         <DraggableDashboardGrid />
      </main>
    </div>
  );
}
