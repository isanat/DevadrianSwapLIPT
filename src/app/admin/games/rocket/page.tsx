'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminRocketPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">LIPT Rocket Management</h1>
                <p className="text-muted-foreground">Configure crash game settings and monitor rounds.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Game Configuration</CardTitle>
                        <CardDescription>
                            Adjust house edge, view round history, and check statistics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Controls for game parameters and detailed analytics will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
