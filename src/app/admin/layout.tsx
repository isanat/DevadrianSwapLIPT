import type { Metadata } from 'next';
import { AdminHeader } from '@/components/layout/admin-header';

export const metadata: Metadata = {
    title: 'Admin Dashboard - DevAdrian Swap',
    description: 'Manage the DevAdrian Swap platform.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AdminHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
            </main>
        </div>
    );
}
