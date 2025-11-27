'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Plus, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import useSWR, { useSWRConfig } from 'swr';
import { getLiquidityData, getWalletData, addLiquidity, removeLiquidity } from '@/services/mock-api';
import { useAccount } from 'wagmi';
import { Skeleton } from '../ui/skeleton';

export function LiquidityPool() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { address: userAddress } = useAccount();

  const { data: lpData, isLoading: isLoadingLp } = useSWR(userAddress ? ['liquidity', userAddress] : null, () => getLiquidityData(userAddress!));
  const { data: walletData, isLoading: isLoadingWallet } = useSWR(userAddress ? ['wallet', userAddress] : null, () => getWalletData(userAddress!));

  const [addLiptAmount, setAddLiptAmount] = useState('');
  const [addUsdtAmount, setAddUsdtAmount] = useState('');
  const [removeLpAmount, setRemoveLpAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Calcular valores derivados antes das funções para garantir consistência
  // Use fallback para garantir consistência entre exibição e validação
  const lpTokens = lpData ? Number(lpData.lpTokens ?? lpData.userLpBalance ?? 0) : 0;
  
  const handleAddLiquidity = async () => {
    const lipt = parseFloat(addLiptAmount);
    const usdt = parseFloat(addUsdtAmount);

    if (walletData && lipt > 0 && usdt > 0 && lipt <= walletData.liptBalance && usdt <= walletData.usdtBalance) {
      setIsAdding(true);
      try {
        await addLiquidity(userAddress!, lipt, usdt);
        mutate('liquidity');
        mutate('wallet');
        toast({ title: t('liquidityPool.toast.added.title'), description: t('liquidityPool.toast.added.description', { lipt, usdt }) });
        setAddLiptAmount('');
        setAddUsdtAmount('');
      } catch (error: any) {
        toast({ variant: 'destructive', title: t('errors.generic'), description: error.message || t('errors.genericDescription') });
      } finally {
        setIsAdding(false);
      }
    } else {
      toast({ variant: 'destructive', title: t('liquidityPool.toast.invalidAmount.title'), description: t('liquidityPool.toast.invalidAmount.description') });
    }
  };

  const handleRemoveLiquidity = async () => {
    const amount = parseFloat(removeLpAmount);
    // Usar a mesma variável lpTokens que inclui fallback para userLpBalance
    // Isso garante consistência entre o que é exibido e o que pode ser removido
    if (lpData && amount > 0 && amount <= lpTokens) {
      setIsRemoving(true);
      try {
        await removeLiquidity(userAddress!, amount);
        mutate('liquidity');
        mutate('wallet');
        toast({ title: t('liquidityPool.toast.removed.title'), description: t('liquidityPool.toast.removed.description', { amount }) });
        setRemoveLpAmount('');
      } catch (error: any) {
        toast({ variant: 'destructive', title: t('errors.generic'), description: error.message || t('errors.genericDescription') });
      } finally {
        setIsRemoving(false);
      }
    } else {
      toast({ variant: 'destructive', title: t('liquidityPool.toast.invalidAmount.title'), description: t('liquidityPool.toast.invalidAmount.description') });
    }
  };
  
  const isLoading = isLoadingLp || isLoadingWallet;
  const poolShare = lpData ? Number(lpData.poolShare ?? 0) : 0;
  const feesEarned = lpData ? Number(lpData.feesEarned ?? 0) : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              {t('liquidityPool.title')}
            </CardTitle>
            <HelpTooltip
              title={t('liquidityPool.title')}
              content={<p>{t('liquidityPool.tooltip')}</p>}
            />
          </div>
        </div>
        <CardDescription>{t('liquidityPool.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                        <Skeleton className="h-4 w-20 mx-auto" />
                        <Skeleton className="h-8 w-16 mx-auto mt-2" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-8 w-20 mx-auto mt-2" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-20 mx-auto" />
                        <Skeleton className="h-8 w-16 mx-auto mt-2" />
                    </div>
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div>
                <p className="text-sm text-muted-foreground">{t('liquidityPool.yourPoolShare')}</p>
                <p className="text-2xl font-bold">{poolShare.toFixed(2)}%</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{t('liquidityPool.yourLpTokens')}</p>
                <p className="text-2xl font-bold">{lpTokens.toLocaleString('en-US')}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{t('liquidityPool.feesEarned')}</p>
                <p className="text-2xl font-bold">{feesEarned.toFixed(2)} USDT</p>
            </div>
            </div>
            <Separator className="my-4" />
            <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">{t('liquidityPool.addTab')}</TabsTrigger>
                <TabsTrigger value="remove">{t('liquidityPool.removeTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="add" className="mt-4">
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="add-lipt-amount">{t('liquidityPool.liptAmount')}</Label>
                    <Input id="add-lipt-amount" type="number" placeholder="0.0" value={addLiptAmount} onChange={(e) => setAddLiptAmount(e.target.value)} disabled={isAdding} />
                    <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {walletData?.liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} LIPT</p>
                </div>
                <div className="flex justify-center">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="add-usdt-amount">{t('liquidityPool.usdtAmount')}</Label>
                    <Input id="add-usdt-amount" type="number" placeholder="0.0" value={addUsdtAmount} onChange={(e) => setAddUsdtAmount(e.target.value)} disabled={isAdding} />
                    <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {walletData?.usdtBalance.toLocaleString('en-US')} USDT</p>
                </div>
                <Button className="w-full mt-4" variant="default" onClick={handleAddLiquidity} disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAdding ? 'Adding...' : t('liquidityPool.addButton')}
                </Button>
                </div>
            </TabsContent>
            <TabsContent value="remove" className="mt-4">
                <div className="space-y-2">
                    <Label htmlFor="remove-lp-amount">{t('liquidityPool.removeLpAmount')}</Label>
                    <div className="flex gap-2">
                    <Input id="remove-lp-amount" type="number" placeholder="0.0" value={removeLpAmount} onChange={(e) => setRemoveLpAmount(e.target.value)} disabled={isRemoving} />
                    <Button variant="destructive" onClick={handleRemoveLiquidity} disabled={isRemoving}>
                        {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isRemoving ? 'Removing...' : t('liquidityPool.removeButton')}
                    </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('liquidityPool.yourLpTokens')}: {lpTokens.toLocaleString('en-US')}</p>
                </div>
            </TabsContent>
            </Tabs>
        </>
        )}
      </CardContent>
    </Card>
  );
}
