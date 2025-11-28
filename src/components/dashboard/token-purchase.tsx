'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import useSWR, { useSWRConfig } from 'swr';
import { getDashboardStats, getWalletData, purchaseLipt } from '@/services/mock-api';
import { useAccount } from 'wagmi';
import { Skeleton } from '../ui/skeleton';

export function TokenPurchase() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { address: userAddress } = useAccount();

  const { data: stats, isLoading: isLoadingStats } = useSWR(userAddress ? ['stats', userAddress] : null, () => getDashboardStats(userAddress!));
  const { data: wallet, isLoading: isLoadingWallet } = useSWR(userAddress ? ['wallet', userAddress] : null, () => getWalletData(userAddress!));

  const [usdtAmount, setUsdtAmount] = useState('');
  const [liptAmount, setLiptAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleUsdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!stats) return;
    const amount = e.target.value;
    if (amount === '' || parseFloat(amount) < 0) {
      setUsdtAmount('');
      setLiptAmount('');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      setUsdtAmount(amount);
      setLiptAmount((numAmount / stats.liptPrice).toFixed(4));
    }
  };

  const handlePurchase = async () => {
    const amountToBuy = parseFloat(liptAmount);
    const cost = parseFloat(usdtAmount);
    if (wallet && cost > 0 && wallet.usdtBalance >= cost) {
        setIsPurchasing(true);
        try {
            // Passar cost (USDT amount) ao invés de amountToBuy (LIPT amount)
            // O contrato faz swap de USDT -> LIPT, então precisa do valor em USDT
            const hash = await purchaseLipt(userAddress!, cost);
            
            // A função purchaseLipt já aguarda confirmação, mas adicionar um pequeno delay
            // para garantir que o estado do contrato foi atualizado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Atualizar dados do cache após confirmação
            await Promise.all([
              mutate(['wallet', userAddress]),
              mutate(['stats', userAddress])
            ]);
            
            toast({
                title: t('tokenPurchase.toast.success.title'),
                description: t('tokenPurchase.toast.success.description', { amount: amountToBuy.toFixed(2) }),
            });
            setLiptAmount('');
            setUsdtAmount('');
        } catch (error: any) {
            console.error('Error purchasing LIPT:', error);
            toast({ 
                variant: 'destructive', 
                title: t('errors.generic'), 
                description: error.message || t('errors.genericDescription')
            });
        } finally {
            setIsPurchasing(false);
        }
    } else {
        toast({
            variant: "destructive",
            title: t('tokenPurchase.toast.invalid.title'),
            description: t('tokenPurchase.toast.invalid.description'),
        });
    }
  }

  const isLoading = isLoadingStats || isLoadingWallet;

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-6 w-6 text-primary" />
              {t('tokenPurchase.title')}
            </CardTitle>
            <HelpTooltip
              title={t('tokenPurchase.title')}
              content={<p>{t('tokenPurchase.tooltip')}</p>}
            />
          </div>
        </div>
        <CardDescription>{t('tokenPurchase.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-28" />
            <div className="h-5" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="usdt-amount">{t('tokenPurchase.youPay')}</Label>
              <Input
                id="usdt-amount"
                type="number"
                placeholder="0.0"
                value={usdtAmount}
                onChange={handleUsdtChange}
                disabled={isPurchasing}
              />
              <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {wallet?.usdtBalance.toLocaleString('en-US')} USDT</p>
            </div>
            <div className="flex justify-center my-2">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lipt-amount">{t('tokenPurchase.youReceive')}</Label>
              <Input id="lipt-amount" type="text" placeholder="0.0" value={liptAmount} readOnly className="bg-background/50"/>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="default" onClick={handlePurchase} disabled={isPurchasing || isLoading}>
          {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPurchasing ? 'Purchasing...' : t('tokenPurchase.purchaseButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
