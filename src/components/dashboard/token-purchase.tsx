'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, ArrowRightLeft } from 'lucide-react';

const LIPT_PRICE_IN_ETH = 0.0005;

export function TokenPurchase() {
  const [ethAmount, setEthAmount] = useState('');
  const [liptAmount, setLiptAmount] = useState('');

  const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    if (amount === '' || parseFloat(amount) < 0) {
      setEthAmount('');
      setLiptAmount('');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      setEthAmount(amount);
      setLiptAmount((numAmount / LIPT_PRICE_IN_ETH).toFixed(4));
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Buy LIPT Token
        </CardTitle>
        <CardDescription>Purchase LIPT tokens using ETH.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="eth-amount">You pay (ETH)</Label>
          <Input
            id="eth-amount"
            type="number"
            placeholder="0.0"
            value={ethAmount}
            onChange={handleEthChange}
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
        <Button className="w-full" variant="default">
          Purchase LIPT
        </Button>
      </CardFooter>
    </Card>
  );
}
