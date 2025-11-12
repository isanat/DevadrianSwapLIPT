'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getLiquidityData } from '@/services/mock-api';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

export default function AdminLiquidityPage() {
    const { data, isLoading } = useSWR('liquidity', getLiquidityData);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const stats = !data ? [] : [
        { name: 'Total LIPT in Pool', value: data.totalLipt?.toLocaleString(), unit: 'LIPT' },
        { name: 'Total USDT in Pool', value: data.totalUsdt?.toLocaleString(), unit: 'USDT' },
        { name: 'Total LP Tokens Issued', value: data.totalLpTokens?.toLocaleString(), unit: 'LP' },
        { name: 'Pool Volume (24h)', value: `$${data.volume24h?.toLocaleString()}` },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Liquidity Pool Management</h1>
                <p className="text-muted-foreground">Monitor and manage the LIPT/USDT liquidity pool.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading || !isClient ? (
                    Array.from({ length: 4 }).map((_, i) => (
                         <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className='h-5 w-3/5' />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className='h-8 w-3/4' />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    stats.map(stat => (
                        <Card key={stat.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value} <span className="text-base text-muted-foreground">{stat.unit}</span></div>
                            </CardContent>
                        </Card>
                    ))
                )}
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
                        {isLoading || !isClient ? <Skeleton className='h-40 w-full' /> : (
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
