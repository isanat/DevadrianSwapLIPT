'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';

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

  const handleAddLiquidity = () => {
    const lipt = parseFloat(addLiptAmount);
    const usdt = parseFloat(addUsdtAmount);

    if (lipt > 0 && usdt > 0 && lipt <= liptBalance && usdt <= usdtBalance) {
      addLiquidity(lipt, usdt);
      toast({ title: 'Liquidity Added', description: `Added ${lipt} LIPT and ${usdt} USDT.` });
      setAddLiptAmount('');
      setAddUsdtAmount('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please check your balances and try again.' });
    }
  };

  const handleRemoveLiquidity = () => {
    const amount = parseFloat(removeLpAmount);
    if (amount > 0 && amount <= lpTokens) {
      removeLiquidity(amount);
      toast({ title: 'Liquidity Removed', description: `You removed ${amount} LP tokens.` });
      setRemoveLpAmount('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please check your LP token balance and try again.' });
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          Liquidity Pool (LIPT/USDT)
        </CardTitle>
        <CardDescription>Provide liquidity to earn trading fees from the LIPT/USDT pair.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Your Pool Share</p>
            <p className="text-2xl font-bold">{poolShare.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your LP Tokens</p>
            <p className="text-2xl font-bold">{lpTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fees Earned</p>
            <p className="text-2xl font-bold">{feesEarned.toFixed(2)} USDT</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-lipt-amount">LIPT Amount</Label>
                <Input id="add-lipt-amount" type="number" placeholder="0.0" value={addLiptAmount} onChange={(e) => setAddLiptAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Balance: {liptBalance.toLocaleString()} LIPT</p>
              </div>
              <div className="flex justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-usdt-amount">USDT Amount</Label>
                <Input id="add-usdt-amount" type="number" placeholder="0.0" value={addUsdtAmount} onChange={(e) => setAddUsdtAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Balance: {usdtBalance.toLocaleString()} USDT</p>
              </div>
              <Button className="w-full mt-4" variant="default" onClick={handleAddLiquidity}>Add Liquidity</Button>
            </div>
          </TabsContent>
          <TabsContent value="remove" className="mt-4">
             <div className="space-y-2">
                <Label htmlFor="remove-lp-amount">LP Token Amount to Remove</Label>
                <div className="flex gap-2">
                  <Input id="remove-lp-amount" type="number" placeholder="0.0" value={removeLpAmount} onChange={(e) => setRemoveLpAmount(e.target.value)} />
                  <Button variant="destructive" onClick={handleRemoveLiquidity}>Remove</Button>
                </div>
                <p className="text-xs text-muted-foreground">Your LP tokens: {lpTokens.toLocaleString()}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
