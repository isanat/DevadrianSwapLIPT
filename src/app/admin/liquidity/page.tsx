'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getLiquidityData } from '@/services/mock-api';
import useSWR from 'swr';

export default function AdminLiquidityPage() {
    const { data, isLoading } = useSWR('liquidity', getLiquidityData);

    const stats = [
        { name: 'Total LIPT in Pool', value: data?.totalLipt?.toLocaleString() || '0', unit: 'LIPT' },
        { name: 'Total USDT in Pool', value: data?.totalUsdt?.toLocaleString() || '0', unit: 'USDT' },
        { name: 'Total LP Tokens Issued', value: data?.totalLpTokens?.toLocaleString() || '0', unit: 'LP' },
        { name: 'Pool Volume (24h)', value: `$${data?.volume24h?.toLocaleString() || '0'}` },
    ]

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Liquidity Pool Management</h1>
                <p className="text-muted-foreground">Monitor and manage the LIPT/USDT liquidity pool.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map(stat => (
                    <Card key={stat.name}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className='h-8 w-3/4' /> : (
                                <div className="text-2xl font-bold">{stat.value} <span className="text-base text-muted-foreground">{stat.unit}</span></div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>LIPT/USDT Pool History</CardTitle>
                        <CardDescription>
                            Historical data of liquidity additions and removals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className='h-40 w-full' /> : (
                            <div className='flex justify-center items-center h-40'>
                                <p>Liquidity provider history and analytics will be displayed here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
