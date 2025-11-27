'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, X, Loader2 } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import { getMiningData, Miner } from '@/services/mock-api';
import { getMiningPlans, addMiningPlan, modifyMiningPlan } from '@/services/web3-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Address } from 'viem';

type MiningPlan = {
  name?: string; // Não vem do contrato, será gerado
  cost: number; // LIPT
  power: number; // LIPT por segundo (ou por hora?)
  duration: number; // dias
  active?: boolean;
};

export default function AdminMiningPage() {
    const { address: userAddress } = useAccount();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: miningData, isLoading: isLoadingData } = useSWR('mining', getMiningData);
    const { data: contractPlans, isLoading: isLoadingPlans, mutate: mutatePlans } = useSWR('miningPlans', getMiningPlans);
    const [editingPlan, setEditingPlan] = useState<{ plan: MiningPlan; planId?: number } | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Converter planos do contrato para formato da UI
    const plans: (MiningPlan & { planId: number })[] = contractPlans?.map((plan: any, index: number) => ({
        name: plan.name || `Plan ${index + 1}`, // Gerar nome se não existir
        cost: plan.cost, // já está convertido
        power: plan.power, // já está convertido
        duration: plan.duration, // já está em dias
        active: plan.active,
        planId: index,
    })) || [];

    const handleEdit = (plan: MiningPlan & { planId: number }) => {
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

        if (!editingPlan.plan.cost || !editingPlan.plan.power || !editingPlan.plan.duration) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Preencha todos os campos.' });
            return;
        }

        setIsSaving(true);
        try {
            if (editingPlan.planId !== undefined) {
                // Modificar plano existente
                await modifyMiningPlan(
                    userAddress as Address,
                    editingPlan.planId,
                    editingPlan.plan.cost,
                    editingPlan.plan.power,
                    editingPlan.plan.duration,
                    editingPlan.plan.active ?? true
                );
                toast({ title: 'Sucesso', description: 'Plano modificado com sucesso!' });
            } else {
                // Adicionar novo plano
                await addMiningPlan(
                    userAddress as Address,
                    editingPlan.plan.cost,
                    editingPlan.plan.power,
                    editingPlan.plan.duration
                );
                toast({ title: 'Sucesso', description: 'Plano adicionado com sucesso!' });
            }
            
            // Atualizar planos do contrato
            await mutatePlans();
            mutate('mining'); // Atualizar dados de mining também
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
        const newPlan: MiningPlan = { cost: 0, power: 0, duration: 0, active: true };
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

            await modifyMiningPlan(
                userAddress as Address,
                planId,
                plan.cost,
                plan.power,
                plan.duration,
                false // desativar
            );
            
            toast({ title: 'Sucesso', description: 'Plano desativado com sucesso!' });
            await mutatePlans();
            mutate('mining');
        } catch (error: any) {
            console.error('Error deactivating plan:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao desativar plano', 
                description: error.message || 'Erro desconhecido' 
            });
        }
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
                        {isLoadingPlans ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : editingPlan ? (
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                <h3 className='text-lg font-semibold'>{editingPlan.planId !== undefined ? 'Editando Plano' : 'Novo Plano'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cost">Cost (LIPT)</Label>
                                        <Input 
                                            id="cost" 
                                            type="number" 
                                            step="0.001"
                                            value={editingPlan.plan.cost} 
                                            onChange={(e) => setEditingPlan({
                                                ...editingPlan, 
                                                plan: {...editingPlan.plan, cost: parseFloat(e.target.value) || 0}
                                            })} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="power">Power (LIPT/s)</Label>
                                        <Input 
                                            id="power" 
                                            type="number" 
                                            step="0.000001"
                                            value={editingPlan.plan.power} 
                                            onChange={(e) => setEditingPlan({
                                                ...editingPlan, 
                                                plan: {...editingPlan.plan, power: parseFloat(e.target.value) || 0}
                                            })} 
                                        />
                                        <p className="text-xs text-muted-foreground">Geração por segundo (ex: 0.001 = 1 LIPT/1000s)</p>
                                    </div>
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
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Cost (LIPT)</TableHead>
                                        <TableHead>Power (LIPT/s)</TableHead>
                                        <TableHead>Duration (days)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isClient && plans.length > 0 ? plans.map(plan => (
                                        <TableRow key={plan.planId}>
                                            <TableCell className='font-mono text-xs'>{plan.planId}</TableCell>
                                            <TableCell className='font-medium'>{plan.name}</TableCell>
                                            <TableCell>{plan.cost.toLocaleString()}</TableCell>
                                            <TableCell>{plan.power.toFixed(6)}</TableCell>
                                            <TableCell>{plan.duration}</TableCell>
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
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                Nenhum plano configurado. Clique em "Adicionar Novo Plano" para criar.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                        {!editingPlan && !isLoadingPlans && <Button variant="outline" className='mt-4' onClick={handleAddNew}><Plus className='mr-2'/> Adicionar Novo Plano</Button>}
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
                       {isLoadingData || !isClient ? <Skeleton className='h-40 w-full' /> : (
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
                                    {miningData?.miners.map((miner: Miner) => (
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
