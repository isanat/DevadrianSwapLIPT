'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminReferralsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Referral Program Management</h1>
                <p className="text-muted-foreground">Track referral networks and commission payouts.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Referral Network Overview</CardTitle>
                        <CardDescription>
                            View the entire referral tree and user commissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Detailed referral network data, search functionality, and commission management tools will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
