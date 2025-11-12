'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLiquidityPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Liquidity Pool Management</h1>
                <p className="text-muted-foreground">Monitor and manage all liquidity pools on the platform.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>LIPT/USDT Pool</CardTitle>
                        <CardDescription>
                            Overview of the primary liquidity pool.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Detailed stats and management tools for the liquidity pool will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
