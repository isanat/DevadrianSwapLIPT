'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, ArrowRightLeft } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';


export function TokenPurchase() {
  const { liptPrice, purchaseLipt } = useDashboard();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [liptAmount, setLiptAmount] = useState('');
  const { toast } = useToast();

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
    const amount = parseFloat(liptAmount);
    if (amount > 0) {
        purchaseLipt(amount);
        toast({
            title: "Purchase Successful!",
            description: `You have purchased ${amount.toFixed(2)} LIPT.`,
        });
        setLiptAmount('');
        setUsdtAmount('');
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid amount to purchase.",
        });
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Buy LIPT Token
        </CardTitle>
        <CardDescription>Purchase LIPT tokens using USDT.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="usdt-amount">You pay (USDT)</Label>
          <Input
            id="usdt-amount"
            type="number"
            placeholder="0.0"
            value={usdtAmount}
            onChange={handleUsdtChange}
          />
        </div>
        <div className="flex justify-center my-2">
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lipt-amount">You receive (LIPT)</Label>
          <Input id="lipt-amount" type="text" placeholder="0.0" value={liptAmount} readOnly className="bg-background/50"/>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="default" onClick={handlePurchase}>
          Purchase LIPT
        </Button>
      </CardFooter>
    </Card>
  );
}
