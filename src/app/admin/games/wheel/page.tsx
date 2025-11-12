'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminWheelPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Wheel of Fortune Management</h1>
                <p className="text-muted-foreground">Adjust game parameters and view play history.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Wheel Configuration</CardTitle>
                        <CardDescription>
                            Modify segment multipliers, weights, and view revenue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Controls for wheel segments and detailed analytics will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
