'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLotteryPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Daily Lottery Management</h1>
                <p className="text-muted-foreground">Manage lottery draws, prize pools, and view winners.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Current & Previous Draws</CardTitle>
                        <CardDescription>
                            Oversee the lottery game mechanics and history.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Management tools for starting/ending draws, viewing ticket sales, and prize distribution will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
