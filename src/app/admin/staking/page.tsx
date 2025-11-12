'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Save, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useSWR from 'swr';
import { getStakingData, Stake, STAKING_PLANS as initialPlans } from '@/services/mock-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StakingPlan = typeof initialPlans[0];

const StakingTableRow = ({ stake }: { stake: Stake }) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
             <TableRow>
                <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
            </TableRow>
        )
    }

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
    const [plans, setPlans] = useState<StakingPlan[]>(initialPlans);
    const [editingPlan, setEditingPlan] = useState<StakingPlan | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const handleEdit = (plan: StakingPlan) => {
        setEditingPlan({ ...plan });
    };

    const handleCancel = () => {
        setEditingPlan(null);
    };
    
    const handleSave = () => {
        if (!editingPlan) return;
        setPlans(plans.map(p => p.duration === editingPlan.duration ? editingPlan : p)); // Assuming duration is unique for initial plans
        if (!plans.some(p => p.duration === editingPlan.duration)) {
             setPlans([...plans, editingPlan]);
        }
        setEditingPlan(null);
        // Here you would call an API to save the plans
    };

    const handleAddNew = () => {
        const newPlan = { duration: 0, apy: 0 };
        setEditingPlan(newPlan);
    }

    const handleDelete = (planDuration: number) => {
        setPlans(plans.filter(p => p.duration !== planDuration));
        // Here you would call an API to delete the plan
    }

    const totalStaked = stakingData?.stakedBalance || 0;
    const activeStakesCount = stakingData?.stakes.length || 0;
    const unclaimedRewards = stakingData?.unclaimedRewards || 0;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Staking Management</h1>
                <p className="text-muted-foreground">Monitor and manage all staking activities on the platform.</p>
            </header>
            <main className='grid gap-4'>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total LIPT Staked</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !isClient ? <Skeleton className="h-8 w-3/5" /> : <div className="text-2xl font-bold">{totalStaked.toLocaleString()} LIPT</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Stake Positions</CardTitle>
                        </CardHeader>
                        <CardContent>
                        {isLoading || !isClient ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{activeStakesCount}</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unclaimed Rewards</CardTitle>
                        </CardHeader>
                        <CardContent>
                        {isLoading || !isClient ? <Skeleton className="h-8 w-2/5" /> : <div className="text-2xl font-bold">{unclaimedRewards.toFixed(2)} LIPT</div>}
                        </CardContent>
                    </Card>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Staking Plans Configuration</CardTitle>
                        <CardDescription>
                            Create, edit, and delete the available staking plans for users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editingPlan ? (
                             <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                <h3 className='text-lg font-semibold'>Editing Plan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (days)</Label>
                                        <Input id="duration" type="number" value={editingPlan.duration} onChange={(e) => setEditingPlan({...editingPlan, duration: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apy">APY (%)</Label>
                                        <Input id="apy" type="number" step="0.1" value={editingPlan.apy} onChange={(e) => setEditingPlan({...editingPlan, apy: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                                <div className='flex justify-end gap-2'>
                                    <Button variant="ghost" onClick={handleCancel}><X className='mr-2'/> Cancel</Button>
                                    <Button onClick={handleSave}><Save className='mr-2'/> Save Plan</Button>
                                </div>
                            </div>
                        ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Duration (days)</TableHead>
                                        <TableHead>APY (%)</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && plans.map(plan => (
                                        <TableRow key={plan.duration}>
                                            <TableCell className='font-medium'>{plan.duration}</TableCell>
                                            <TableCell>{plan.apy.toFixed(2)}%</TableCell>
                                            <TableCell className='text-right space-x-2'>
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}><Edit className='mr-2 h-3 w-3'/> Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.duration)}><Trash2 className='mr-2 h-3 w-3'/> Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {!editingPlan && <Button variant="outline" className='mt-4' onClick={handleAddNew}><Plus className='mr-2'/> Add New Plan</Button>}
                    </CardContent>
                </Card>

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
                                {isLoading && (!stakingData || stakingData.stakes.length === 0) ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : stakingData && stakingData.stakes.length > 0 ? (
                                    stakingData.stakes.map((stake) => <StakingTableRow key={stake.id} stake={stake} />)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No active stakes found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
