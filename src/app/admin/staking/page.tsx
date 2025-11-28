'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Save, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useSWR, { useSWRConfig } from 'swr';
import { getStakingData, Stake } from '@/services/mock-api';
import { getStakingPlans, addStakingPlan, modifyStakingPlan, checkContractOwner, getContractOwnerAddress, isLIPTOwner } from '@/services/web3-api';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Address } from 'viem';

type StakingPlan = {
  duration: number; // dias
  apy: number; // porcentagem
  active?: boolean;
};

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
    const { address: userAddress } = useAccount();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: stakingData, isLoading } = useSWR('staking', getStakingData);
    const { data: contractPlans, isLoading: isLoadingPlans, mutate: mutatePlans } = useSWR('stakingPlans', getStakingPlans);
    const [editingPlan, setEditingPlan] = useState<{ plan: StakingPlan; planId?: number } | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Converter planos do contrato para formato da UI
    const plans: (StakingPlan & { planId: number })[] = contractPlans?.map((plan: any, index: number) => ({
        duration: plan.duration, // já está em dias
        apy: plan.apy, // já está em porcentagem
        active: plan.active,
        planId: index,
    })) || [];
    
    const handleEdit = (plan: StakingPlan & { planId: number }) => {
        setEditingPlan({ plan, planId: plan.planId });
    };

    const handleCancel = () => {
        setEditingPlan(null);
    };
    
    const handleSave = async () => {
        if (!editingPlan || !userAddress) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Conecte sua carteira para salvar planos.' });
            return;
        }

        if (!editingPlan.plan.duration || !editingPlan.plan.apy) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Preencha todos os campos.' });
            return;
        }

        // Verificar se o usuário é owner do contrato StakingPool
        try {
            const contractOwner = await getContractOwnerAddress(CONTRACT_ADDRESSES.stakingPool as Address);
            const isProtocolControllerOwner = await isLIPTOwner(userAddress as Address);
            const isOwner = await checkContractOwner(CONTRACT_ADDRESSES.stakingPool as Address, userAddress as Address);
            
            if (!isOwner) {
                let errorMessage = 'Apenas o owner do contrato StakingPool pode criar ou modificar planos.';
                if (contractOwner) {
                    errorMessage += `\n\nOwner atual do contrato: ${contractOwner}`;
                }
                if (isProtocolControllerOwner) {
                    errorMessage += `\n\nVocê é owner do ProtocolController, mas o StakingPool pode ter um owner diferente.`;
                }
                errorMessage += `\n\nCarteira conectada: ${userAddress}`;
                
                toast({ 
                    variant: 'destructive', 
                    title: 'Acesso Negado', 
                    description: errorMessage
                });
                return;
            }
        } catch (error: any) {
            console.error('Error checking owner:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro', 
                description: `Não foi possível verificar ownership. Erro: ${error.message}` 
            });
            return;
        }

        setIsSaving(true);
        try {
            if (editingPlan.planId !== undefined) {
                // Modificar plano existente
                await modifyStakingPlan(
                    userAddress as Address,
                    editingPlan.planId,
                    editingPlan.plan.duration,
                    editingPlan.plan.apy,
                    editingPlan.plan.active ?? true
                );
                toast({ title: 'Sucesso', description: 'Plano modificado com sucesso!' });
            } else {
                // Adicionar novo plano
                await addStakingPlan(
                    userAddress as Address,
                    editingPlan.plan.duration,
                    editingPlan.plan.apy
                );
                toast({ title: 'Sucesso', description: 'Plano adicionado com sucesso!' });
            }
            
            // Atualizar planos do contrato
            await mutatePlans();
            mutate('staking'); // Atualizar dados de staking também
            setEditingPlan(null);
        } catch (error: any) {
            console.error('Error saving plan:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao salvar plano', 
                description: error.message || 'Erro desconhecido' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNew = () => {
        const newPlan: StakingPlan = { duration: 0, apy: 0, active: true };
        setEditingPlan({ plan: newPlan });
    }

    const handleDelete = async (planId: number) => {
        if (!userAddress) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Conecte sua carteira.' });
            return;
        }

        if (!confirm('Deseja desativar este plano? (Use modify para desativar)')) {
            return;
        }

        try {
            // Para "deletar", vamos desativar o plano
            const plan = plans.find(p => p.planId === planId);
            if (!plan) return;

            await modifyStakingPlan(
                userAddress as Address,
                planId,
                plan.duration,
                plan.apy,
                false // desativar
            );
            
            toast({ title: 'Sucesso', description: 'Plano desativado com sucesso!' });
            await mutatePlans();
            mutate('staking');
        } catch (error: any) {
            console.error('Error deactivating plan:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao desativar plano', 
                description: error.message || 'Erro desconhecido' 
            });
        }
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
                        {isLoadingPlans ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : editingPlan ? (
                             <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                <h3 className='text-lg font-semibold'>{editingPlan.planId !== undefined ? 'Editando Plano' : 'Novo Plano'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (days)</Label>
                                        <Input 
                                            id="duration" 
                                            type="number" 
                                            value={editingPlan.plan.duration} 
                                            onChange={(e) => setEditingPlan({
                                                ...editingPlan, 
                                                plan: {...editingPlan.plan, duration: parseInt(e.target.value) || 0}
                                            })} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apy">APY (%)</Label>
                                        <Input 
                                            id="apy" 
                                            type="number" 
                                            step="0.1" 
                                            value={editingPlan.plan.apy} 
                                            onChange={(e) => setEditingPlan({
                                                ...editingPlan, 
                                                plan: {...editingPlan.plan, apy: parseFloat(e.target.value) || 0}
                                            })} 
                                        />
                                    </div>
                                </div>
                                <div className='flex justify-end gap-2'>
                                    <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                                        <X className='mr-2'/> Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                        <Save className='mr-2'/> {isSaving ? 'Salvando...' : 'Salvar Plano'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Duration (days)</TableHead>
                                        <TableHead>APY (%)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && plans.length > 0 ? plans.map(plan => (
                                        <TableRow key={plan.planId}>
                                            <TableCell className='font-mono text-xs'>{plan.planId}</TableCell>
                                            <TableCell className='font-medium'>{plan.duration}</TableCell>
                                            <TableCell>{plan.apy.toFixed(2)}%</TableCell>
                                            <TableCell>
                                                {plan.active ? (
                                                    <Badge variant="secondary" className='text-green-400 border-green-400'>Ativo</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className='text-red-400 border-red-400'>Inativo</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className='text-right space-x-2'>
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                                                    <Edit className='mr-2 h-3 w-3'/> Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.planId)}>
                                                    <Trash2 className='mr-2 h-3 w-3'/> Desativar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                Nenhum plano configurado. Clique em "Adicionar Novo Plano" para criar.
                                            </TableCell>
                                        </TableRow>
                                    )}
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
