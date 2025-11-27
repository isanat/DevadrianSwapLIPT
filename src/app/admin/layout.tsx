'use client';

import { AdminHeader } from '@/components/layout/admin-header';
import { AdminAccessGuard } from '@/components/admin/admin-access-guard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAccessGuard>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AdminHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    {children}
                </main>
            </div>
        </AdminAccessGuard>
    );
}
