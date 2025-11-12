'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, X } from 'lucide-react';
import useSWR from 'swr';
import { MINING_PLANS as initialPlans, getMiningData, Miner } from '@/services/mock-api';
import { Skeleton } from '@/components/ui/skeleton';

type MiningPlan = typeof initialPlans[0];

export default function AdminMiningPage() {
    const { data: miningData, isLoading: isLoadingData } = useSWR('mining', getMiningData);
    const [plans, setPlans] = useState<MiningPlan[]>(initialPlans);
    const [editingPlan, setEditingPlan] = useState<MiningPlan | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleEdit = (plan: MiningPlan) => {
        setEditingPlan({ ...plan });
    };

    const handleCancel = () => {
        setEditingPlan(null);
    };
    
    const handleSave = () => {
        if (!editingPlan) return;
        setPlans(plans.map(p => p.name === editingPlan.name ? editingPlan : p));
        setEditingPlan(null);
        // Here you would call an API to save the plans
    };

    const handleAddNew = () => {
        const newPlan = { name: `New Plan ${plans.length + 1}`, cost: 0, power: 0, duration: 0 };
        setPlans([...plans, newPlan]);
        setEditingPlan(newPlan);
    }

    const handleDelete = (planName: string) => {
        setPlans(plans.filter(p => p.name !== planName));
        // Here you would call an API to delete the plan
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Mining Room Management</h1>
                <p className="text-muted-foreground">Configure mining plans and oversee all mining operations.</p>
            </header>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Miners</CardTitle>
                    </CardHeader>
                    <CardContent>{isLoadingData || !isClient ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{miningData?.miners.length || 0}</div>}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Mining Power</CardTitle>
                    </CardHeader>
                    <CardContent>{isLoadingData || !isClient ? <Skeleton className="h-8 w-2/4" /> : <div className="text-2xl font-bold">{miningData?.miningPower.toFixed(2) || '0.00'} LIPT/h</div>}</CardContent>
                </Card>
             </div>
            <main className="grid gap-4 md:grid-cols-2">
                <Card className='md:col-span-2'>
                    <CardHeader>
                        <CardTitle>Mining Plans Configuration</CardTitle>
                        <CardDescription>
                            Create, edit, and delete the available mining plans for users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editingPlan ? (
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                <h3 className='text-lg font-semibold'>Editing: {editingPlan.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cost">Cost (LIPT)</Label>
                                        <Input id="cost" type="number" value={editingPlan.cost} onChange={(e) => setEditingPlan({...editingPlan, cost: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="power">Power (LIPT/h)</Label>
                                        <Input id="power" type="number" value={editingPlan.power} onChange={(e) => setEditingPlan({...editingPlan, power: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (days)</Label>
                                        <Input id="duration" type="number" value={editingPlan.duration} onChange={(e) => setEditingPlan({...editingPlan, duration: parseInt(e.target.value)})} />
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
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Cost (LIPT)</TableHead>
                                        <TableHead>Power (LIPT/h)</TableHead>
                                        <TableHead>Duration (days)</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && plans.map(plan => (
                                        <TableRow key={plan.name}>
                                            <TableCell className='font-medium'>{plan.name}</TableCell>
                                            <TableCell>{plan.cost.toLocaleString()}</TableCell>
                                            <TableCell>{plan.power}</TableCell>
                                            <TableCell>{plan.duration}</TableCell>
                                            <TableCell className='text-right space-x-2'>
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}><Edit className='mr-2 h-3 w-3'/> Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.name)}><Trash2 className='mr-2 h-3 w-3'/> Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {!editingPlan && <Button variant="outline" className='mt-4' onClick={handleAddNew}><Plus className='mr-2'/> Add New Plan</Button>}
                    </CardContent>
                </Card>

                 <Card className='md:col-span-2'>
                    <CardHeader>
                        <CardTitle>Active Miners Overview</CardTitle>
                        <CardDescription>
                            Monitor active miners and their performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isLoadingData ? <Skeleton className='h-40 w-full' /> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Mined Amount</TableHead>
                                        <TableHead>Start Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && miningData?.miners.map((miner: Miner) => (
                                        <TableRow key={miner.id}>
                                            <TableCell className='font-mono text-xs'>{`user...${miner.id.slice(-6)}`}</TableCell>
                                            <TableCell>{miner.plan.name}</TableCell>
                                            <TableCell>{miner.minedAmount.toFixed(4)} LIPT</TableCell>
                                            <TableCell>{new Date(miner.startDate).toLocaleString()}</TableCell>
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
