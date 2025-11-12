'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getLiquidityData } from '@/services/mock-api';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Banknote, Coins, TrendingUp, Wallet } from 'lucide-react';

export default function AdminLiquidityPage() {
    const { data, isLoading } = useSWR('liquidity', getLiquidityData);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const stats = !data ? [] : [
        { title: 'Total LIPT in Pool', value: data.totalLipt, suffix: ' LIPT', icon: <Coins className="h-6 w-6 text-muted-foreground" /> },
        { title: 'Total USDT in Pool', value: data.totalUsdt, suffix: ' USDT', icon: <Banknote className="h-6 w-6 text-muted-foreground" /> },
        { title: 'Total LP Tokens Issued', value: data.totalLpTokens, suffix: ' LP', icon: <Wallet className="h-6 w-6 text-muted-foreground" /> },
        { title: 'Pool Volume (24h)', value: data.volume24h, prefix: '$', icon: <TrendingUp className="h-6 w-6 text-muted-foreground" /> },
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
                        <StatsCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            icon={stat.icon}
                            isLoading={isLoading}
                        />
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
