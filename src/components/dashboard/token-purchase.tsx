'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TokenPurchase() {
  const { liptPrice, purchaseLipt, usdtBalance } = useDashboard();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [liptAmount, setLiptAmount] = useState('');
  const { toast } = useToast();
  const { t } = useI18n();

  const handleUsdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    if (amount === '' || parseFloat(amount) < 0) {
      setUsdtAmount('');
      setLiptAmount('');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      setUsdtAmount(amount);
      setLiptAmount((numAmount / liptPrice).toFixed(4));
    }
  };

  const handlePurchase = () => {
    const amountToBuy = parseFloat(liptAmount);
    const cost = parseFloat(usdtAmount);
    if (amountToBuy > 0 && usdtBalance >= cost) {
        purchaseLipt(amountToBuy);
        toast({
            title: t('tokenPurchase.toast.success.title'),
            description: t('tokenPurchase.toast.success.description', { amount: amountToBuy.toFixed(2) }),
        });
        setLiptAmount('');
        setUsdtAmount('');
    } else {
        toast({
            variant: "destructive",
            title: t('tokenPurchase.toast.invalid.title'),
            description: t('tokenPurchase.toast.invalid.description'),
        });
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-6 w-6 text-primary" />
              {t('tokenPurchase.title')}
            </CardTitle>
            <CardDescription>{t('tokenPurchase.description')}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <HelpCircle size={18} className="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('tokenPurchase.tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="usdt-amount">{t('tokenPurchase.youPay')}</Label>
          <Input
            id="usdt-amount"
            type="number"
            placeholder="0.0"
            value={usdtAmount}
            onChange={handleUsdtChange}
          />
           <p className="text-xs text-muted-foreground">{t('liquidityPool.balance')}: {usdtBalance.toLocaleString('en-US')} USDT</p>
        </div>
        <div className="flex justify-center my-2">
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lipt-amount">{t('tokenPurchase.youReceive')}</Label>
          <Input id="lipt-amount" type="text" placeholder="0.0" value={liptAmount} readOnly className="bg-background/50"/>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="default" onClick={handlePurchase}>
          {t('tokenPurchase.purchaseButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
