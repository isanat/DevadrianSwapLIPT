'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminMiningPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Mining Room Management</h1>
                <p className="text-muted-foreground">Oversee all mining operations and rewards.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Miners</CardTitle>
                        <CardDescription>
                            Monitor active miners and their performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>A list of active miners, their plans, and management options will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
