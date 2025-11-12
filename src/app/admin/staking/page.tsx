'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useSWR from 'swr';
import { getStakingData, Stake } from '@/services/mock-api';
import { Skeleton } from '@/components/ui/skeleton';

const StakingTableRow = ({ stake }: { stake: Stake }) => {
    const isMature = (stake.startDate + stake.plan.duration * 24 * 60 * 60 * 1000) < Date.now();
    const startDate = new Date(stake.startDate).toLocaleDateString();

    return (
        <TableRow>
            <TableCell>
                <div className="font-mono text-xs">{`user...${stake.id.slice(-4)}`}</div>
            </TableCell>
            <TableCell>
                <div className="font-medium">{stake.amount.toLocaleString()} LIPT</div>
            </TableCell>
            <TableCell>{stake.plan.duration} days @ {stake.plan.apy}%</TableCell>
            <TableCell>{startDate}</TableCell>
            <TableCell>
                {isMature ? (
                    <Badge variant="secondary" className='text-green-400 border-green-400'>Mature</Badge>
                ) : (
                    <Badge variant="secondary" className='text-yellow-400 border-yellow-400'>Staking</Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View User Details</DropdownMenuItem>
                        <DropdownMenuItem>Force Unstake</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function AdminStakingPage() {
    const { data: stakingData, isLoading } = useSWR('staking', getStakingData);

    const allStakes = stakingData?.stakes || [];
    const totalStaked = stakingData?.stakedBalance || 0;
    const activeStakesCount = allStakes.length;
    const unclaimedRewards = stakingData?.unclaimedRewards || 0;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Staking Management</h1>
                <p className="text-muted-foreground">Monitor and manage all staking activities on the platform.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total LIPT Staked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-3/5" /> : <div className="text-2xl font-bold">{totalStaked.toLocaleString()} LIPT</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Stake Positions</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{activeStakesCount}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isLoading ? <Skeleton className="h-8 w-2/5" /> : <div className="text-2xl font-bold">{unclaimedRewards.toFixed(2)} LIPT</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Active Stakes</CardTitle>
                    <CardDescription>A list of all user staking positions on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && allStakes.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : allStakes.length > 0 ? (
                                allStakes.map((stake) => <StakingTableRow key={stake.id} stake={stake} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No active stakes found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
