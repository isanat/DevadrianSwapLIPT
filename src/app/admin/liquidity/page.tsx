'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLiquidityData, getWalletData } from '@/services/mock-api';
import { addLiquidity as web3AddLiquidity, getTokenDecimals } from '@/services/web3-api';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import useSWR, { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Banknote, Coins, TrendingUp, Wallet, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { parseUnits } from 'viem';

export default function AdminLiquidityPage() {
    const { address: userAddress, isConnected } = useAccount();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data, isLoading } = useSWR(userAddress ? ['liquidity', userAddress] : null, () => getLiquidityData(userAddress!));
    const { data: walletData } = useSWR(userAddress ? ['wallet', userAddress] : null, () => getWalletData(userAddress!));
    const [isClient, setIsClient] = useState(false);
    
    const [liptAmount, setLiptAmount] = useState('');
    const [usdtAmount, setUsdtAmount] = useState('');
    const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

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
            <main className="grid gap-4 md:grid-cols-2">
                {/* Adicionar Liquidez Inicial */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Adicionar Liquidez Inicial
                        </CardTitle>
                        <CardDescription>
                            Adicione liquidez LIPT/USDT ao pool para permitir que usuários comprem LIPT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data && (data.totalLipt > 0 || data.totalUsdt > 0) ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Pool já possui liquidez</AlertTitle>
                                <AlertDescription>
                                    O pool já possui {data.totalLipt.toFixed(2)} LIPT e {data.totalUsdt.toFixed(2)} USDT.
                                    Você ainda pode adicionar mais liquidez se desejar.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Pool sem liquidez!</AlertTitle>
                                <AlertDescription>
                                    O pool está vazio. Adicione liquidez inicial para permitir que usuários comprem LIPT.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="lipt-amount">Quantidade LIPT</Label>
                            <Input
                                id="lipt-amount"
                                type="number"
                                placeholder="10000"
                                value={liptAmount}
                                onChange={(e) => setLiptAmount(e.target.value)}
                                disabled={isAddingLiquidity || !isConnected}
                            />
                            <p className="text-xs text-muted-foreground">
                                Saldo disponível: {walletData?.liptBalance.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) || '0'} LIPT
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="usdt-amount">Quantidade USDT</Label>
                            <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="10000"
                                value={usdtAmount}
                                onChange={(e) => setUsdtAmount(e.target.value)}
                                disabled={isAddingLiquidity || !isConnected}
                            />
                            <p className="text-xs text-muted-foreground">
                                Saldo disponível: {walletData?.usdtBalance.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) || '0'} USDT
                            </p>
                        </div>
                        
                        <Button
                            className="w-full"
                            onClick={handleAddLiquidity}
                            disabled={isAddingLiquidity || !isConnected || !liptAmount || !usdtAmount}
                        >
                            {isAddingLiquidity ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adicionando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Liquidez
                                </>
                            )}
                        </Button>
                        
                        {!isConnected && (
                            <Alert>
                                <AlertDescription>
                                    Conecte sua carteira para adicionar liquidez.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
                
                {/* Histórico */}
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
                                <p className="text-muted-foreground">Histórico de liquidez será exibido aqui.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
    
    async function handleAddLiquidity() {
        if (!userAddress || !isConnected) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Conecte sua carteira primeiro.',
            });
            return;
        }
        
        const lipt = parseFloat(liptAmount);
        const usdt = parseFloat(usdtAmount);
        
        if (!lipt || !usdt || lipt <= 0 || usdt <= 0) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Preencha valores válidos para ambos os tokens.',
            });
            return;
        }
        
        if (walletData && (lipt > walletData.liptBalance || usdt > walletData.usdtBalance)) {
            toast({
                variant: 'destructive',
                title: 'Saldo insuficiente',
                description: 'Você não tem saldo suficiente de LIPT ou USDT.',
            });
            return;
        }
        
        try {
            setIsAddingLiquidity(true);
            
            // Obter decimais
            const [liptDecimals, usdtDecimals] = await Promise.all([
                getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any),
                getTokenDecimals(CONTRACT_ADDRESSES.mockUsdt as any),
            ]);
            
            const liptAmountBigInt = parseUnits(liptAmount, liptDecimals);
            const usdtAmountBigInt = parseUnits(usdtAmount, usdtDecimals);
            
            // Adicionar liquidez
            const hash = await web3AddLiquidity(userAddress, liptAmountBigInt, usdtAmountBigInt);
            
            toast({
                title: 'Sucesso!',
                description: `Liquidez adicionada com sucesso! Hash: ${hash.substring(0, 10)}...`,
            });
            
            // Limpar campos e atualizar dados
            setLiptAmount('');
            setUsdtAmount('');
            mutate(['liquidity', userAddress]);
            mutate(['wallet', userAddress]);
        } catch (error: any) {
            console.error('Error adding liquidity:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao adicionar liquidez',
                description: error.message || 'Ocorreu um erro ao adicionar liquidez. Verifique os saldos e tente novamente.',
            });
        } finally {
            setIsAddingLiquidity(false);
        }
    }
}
