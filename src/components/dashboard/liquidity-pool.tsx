'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Plus, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function LiquidityPool() {
  const { 
    poolShare, 
    lpTokens, 
    feesEarned, 
    liptBalance, 
    usdtBalance,
    addLiquidity,
    removeLiquidity
  } = useDashboard();
  const [addLiptAmount, setAddLiptAmount] = useState('');
  const [addUsdtAmount, setAddUsdtAmount] = useState('');
  const [removeLpAmount, setRemoveLpAmount] = useState('');
  const { toast } = useToast();
  const { t } = useI18n();

  const handleAddLiquidity = () => {
    const lipt = parseFloat(addLiptAmount);
    const usdt = parseFloat(addUsdtAmount);

    if (lipt > 0 && usdt > 0 && lipt <= liptBalance && usdt <= usdtBalance) {
      addLiquidity(lipt, usdt);
      toast({ title: t('liquidityPool.toast.added.title'), description: t('liquidityPool.toast.added.description', { lipt, usdt }) });
      setAddLiptAmount('');
      setAddUsdtAmount('');
    } else {
      toast({ variant: 'destructive', title: t('liquidityPool.toast.invalidAmount.title'), description: t('liquidityPool.toast.invalidAmount.description') });
    }
  };

  const handleRemoveLiquidity = () => {
    const amount = parseFloat(removeLpAmount);
    if (amount > 0 && amount <= lpTokens) {
      removeLiquidity(amount);
      toast({ title: t('liquidityPool.toast.removed.title'), description: t('liquidityPool.toast.removed.description', { amount }) });
      setRemoveLpAmount('');
    } else {
      toast({ variant: 'destructive', title: t('liquidityPool.toast.invalidAmount.title'), description: t('liquidityPool.toast.invalidAmount.description') });
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              {t('liquidityPool.title')}
            </CardTitle>
            <CardDescription>{t('liquidityPool.description')}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <HelpCircle size={18} className="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('liquidityPool.tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
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
                <Input id="add-lipt-amount" type="number" placeholder="0.0" value={addLiptAmount} onChange={(e) => setAddLiptAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} LIPT</p>
              </div>
              <div className="flex justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-usdt-amount">{t('liquidityPool.usdtAmount')}</Label>
                <Input id="add-usdt-amount" type="number" placeholder="0.0" value={addUsdtAmount} onChange={(e) => setAddUsdtAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {usdtBalance.toLocaleString('en-US')} USDT</p>
              </div>
              <Button className="w-full mt-4" variant="default" onClick={handleAddLiquidity}>{t('liquidityPool.addButton')}</Button>
            </div>
          </TabsContent>
          <TabsContent value="remove" className="mt-4">
             <div className="space-y-2">
                <Label htmlFor="remove-lp-amount">{t('liquidityPool.removeLpAmount')}</Label>
                <div className="flex gap-2">
                  <Input id="remove-lp-amount" type="number" placeholder="0.0" value={removeLpAmount} onChange={(e) => setRemoveLpAmount(e.target.value)} />
                  <Button variant="destructive" onClick={handleRemoveLiquidity}>{t('liquidityPool.removeButton')}</Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('liquidityPool.yourLpTokens')}: {lpTokens.toLocaleString('en-US')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
