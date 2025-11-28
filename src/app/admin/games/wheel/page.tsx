'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { getWheelSegments, setWheelSegments, checkContractOwner } from '@/services/web3-api';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import useSWR, { useSWRConfig } from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Address } from 'viem';

type Segment = {
    value: number; // multiplicador (ex: 1.5 = 1.5x)
    weight: number; // peso para probabilidade
    color?: string; // cor (não vai para o contrato)
};

const defaultColors = [
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#22c55e', // Green
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#14b8a6', // Teal
];

export default function AdminWheelPage() {
    const { address: userAddress } = useAccount();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: contractSegments, isLoading: isLoadingSegments, mutate: mutateSegments } = useSWR('wheelSegments', getWheelSegments);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Carregar segmentos do contrato quando disponíveis
    useEffect(() => {
        if (contractSegments && contractSegments.length > 0) {
            setSegments(contractSegments.map((seg: any, index: number) => ({
                value: seg.value,
                weight: seg.weight,
                color: seg.color || defaultColors[index % defaultColors.length],
            })));
        } else if (contractSegments && contractSegments.length === 0) {
            // Se não há segmentos no contrato, iniciar com array vazio
            setSegments([]);
        }
    }, [contractSegments]);

    const handleSegmentChange = (index: number, field: keyof Segment, newValue: number | string) => {
        const newSegments = [...segments];
        if (typeof newValue === 'string' && field !== 'color') {
            newSegments[index] = { ...newSegments[index], [field]: parseFloat(newValue) || 0 };
        } else {
             newSegments[index] = { ...newSegments[index], [field]: newValue };
        }
        setSegments(newSegments);
    };

    const handleAddSegment = () => {
        setSegments([...segments, { 
            value: 1, 
            weight: 5, 
            color: defaultColors[segments.length % defaultColors.length] 
        }]);
    };

    const handleDeleteSegment = (index: number) => {
        setSegments(segments.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!userAddress) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Conecte sua carteira para salvar segmentos.' });
            return;
        }

        if (segments.length === 0) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Adicione pelo menos um segmento.' });
            return;
        }

        // Verificar se o usuário é owner do contrato WheelOfFortune
        try {
            const isOwner = await checkContractOwner(CONTRACT_ADDRESSES.wheelOfFortune as Address, userAddress as Address);
            if (!isOwner) {
                toast({ 
                    variant: 'destructive', 
                    title: 'Acesso Negado', 
                    description: 'Apenas o owner do contrato WheelOfFortune pode configurar segmentos. Conecte a carteira do owner.' 
                });
                return;
            }
        } catch (error: any) {
            console.error('Error checking owner:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro', 
                description: 'Não foi possível verificar se você é owner do contrato.' 
            });
            return;
        }

        setIsSaving(true);
        try {
            // Converter valores para formato do contrato
            const multipliers = segments.map(s => s.value);
            const weights = segments.map(s => s.weight);

            await setWheelSegments(userAddress as Address, multipliers, weights);
            
            toast({ title: 'Sucesso', description: 'Segmentos configurados com sucesso!' });
            
            // Atualizar segmentos do contrato
            await mutateSegments();
            mutate('wheelSegments'); // Atualizar cache global
        } catch (error: any) {
            console.error('Error saving segments:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao salvar segmentos', 
                description: error.message || 'Erro desconhecido' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const totalWeight = segments.reduce((acc: number, seg: Segment) => acc + seg.weight, 0);

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Wheel of Fortune Management</h1>
                <p className="text-muted-foreground">Adjust game parameters and view play history.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Wheel Configuration</CardTitle>
                        <CardDescription>
                            Modify segment multipliers and weights to control the game's economy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingSegments ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : segments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="mb-4">Nenhum segmento configurado no contrato.</p>
                                <p className="text-sm mb-4">Adicione segmentos e clique em "Salvar Configuração" para configurar a roda.</p>
                                <Button variant="outline" onClick={handleAddSegment}>
                                    <Plus className='mr-2 h-4 w-4'/> Adicionar Primeiro Segmento
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Multiplier (ex: 1.5x)</TableHead>
                                            <TableHead>Weight (Probability)</TableHead>
                                            <TableHead>Color</TableHead>
                                            <TableHead className='text-right'>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {segments.map((seg, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        step="0.1"
                                                        value={seg.value} 
                                                        onChange={(e) => handleSegmentChange(index, 'value', e.target.value)} 
                                                        className='w-24' 
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center gap-2'>
                                                        <Input 
                                                            type="number" 
                                                            value={seg.weight} 
                                                            onChange={(e) => handleSegmentChange(index, 'weight', e.target.value)} 
                                                            className='w-24' 
                                                        />
                                                        {totalWeight > 0 && (
                                                            <span className='text-xs text-muted-foreground'>
                                                                ({((seg.weight / totalWeight) * 100).toFixed(2)}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="color" 
                                                        value={seg.color || defaultColors[index % defaultColors.length]} 
                                                        onChange={(e) => handleSegmentChange(index, 'color', e.target.value)} 
                                                        className='p-0 w-12 h-10' 
                                                    />
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSegment(index)}>
                                                        <Trash2 className='h-4 w-4 text-destructive' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className='flex justify-between items-center mt-4'>
                                    <div>
                                        <Button variant="outline" onClick={handleAddSegment}>
                                            <Plus className='mr-2 h-4 w-4'/> Adicionar Segmento
                                        </Button>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <p className='text-sm font-medium'>Total Weight: {totalWeight}</p>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                            <Save className='mr-2 h-4 w-4'/> {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
