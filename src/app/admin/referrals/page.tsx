'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getReferralData } from '@/services/mock-api';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Award, Percent, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const initialCommissionLevels = [
    { level: 1, percentage: 5.0 },
    { level: 2, percentage: 3.0 },
    { level: 3, percentage: 1.5 },
    { level: 4, percentage: 0.5 },
    { level: 5, percentage: 0.25 },
];

export default function AdminReferralsPage() {
    const { data, isLoading } = useSWR('referral', getReferralData);
    const [isClient, setIsClient] = useState(false);
    const [commissionLevels, setCommissionLevels] = useState(initialCommissionLevels);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleCommissionChange = (level: number, value: string) => {
        const newLevels = commissionLevels.map(l => 
            l.level === level ? { ...l, percentage: parseFloat(value) || 0 } : l
        );
        setCommissionLevels(newLevels);
    };

    const totalTeamMembers = data?.network.reduce((sum, ref) => sum + ref.members, 0) || 0;

    const stats = !data ? [] : [
        { name: 'Total Direct Referrals', value: data.totalReferrals, icon: <Users /> },
        { name: 'Total Commission Paid', value: `${data.totalRewards.toLocaleString()} LIPT`, icon: <Award /> },
        { name: 'Total Network Members', value: totalTeamMembers, icon: <Users /> },
    ]

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Referral Program Management</h1>
                <p className="text-muted-foreground">Track referral networks and commission payouts.</p>
            </header>
            <main className='grid gap-4'>
                 <div className="grid gap-4 md:grid-cols-3">
                    {isLoading || !isClient ? (
                        Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24" />)
                    ) : (
                        stats.map(stat => (
                            <Card key={stat.name}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                                    <div className="text-muted-foreground">{stat.icon}</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                 </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Commission Level Configuration</CardTitle>
                        <CardDescription>
                            Set the commission percentage for each referral level.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                           {isClient && commissionLevels.map(level => (
                                <div key={level.level} className='space-y-2'>
                                    <Label htmlFor={`level-${level.level}`}>Level {level.level} (%)</Label>
                                    <Input 
                                        id={`level-${level.level}`} 
                                        type="number" 
                                        value={level.percentage} 
                                        onChange={(e) => handleCommissionChange(level.level, e.target.value)}
                                    />
                                </div>
                           ))}
                        </div>
                        <Button><Save className='mr-2' /> Save Commission Settings</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Referral Network Overview</CardTitle>
                        <CardDescription>
                            View the entire referral tree and user commissions based on current settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading || !isClient ? <Skeleton className='h-60 w-full' /> : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Commission Rate</TableHead>
                                        <TableHead>Members</TableHead>
                                        <TableHead>Commission Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.network.map(level => (
                                        <TableRow key={level.id}>
                                            <TableCell className='font-bold'>{level.level}</TableCell>
                                            <TableCell>
                                                <Badge variant='secondary' className='text-primary border-primary/50'>
                                                    <Percent className='mr-1' />
                                                    {commissionLevels.find(c => c.level === level.level)?.percentage.toFixed(2)}%
                                                </Badge>
                                            </TableCell>
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
