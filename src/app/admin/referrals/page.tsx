'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getReferralData } from '@/services/mock-api';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

export default function AdminReferralsPage() {
    const { data, isLoading } = useSWR('referral', getReferralData);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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
                        {isLoading ? <Skeleton className='h-60 w-full' /> : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Members</TableHead>
                                        <TableHead>Commission Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && data?.network.map(level => (
                                        <TableRow key={level.id}>
                                            <TableCell className='font-bold'>{level.level}</TableCell>
                                            <TableCell>{level.members.toLocaleString()}</TableCell>
                                            <TableCell>{level.commission.toLocaleString()} LIPT</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
