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
        <div className="flex min-h-screen w-full flex-col">
            <AdminHeader />
            <main className="flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
