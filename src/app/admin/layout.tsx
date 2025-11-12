import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/admin-shell';

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
        <AdminShell>
            {children}
        </AdminShell>
    );
}
