'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Archive, Download } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';

export function StakingPool() {
  const { stakedBalance, unclaimedRewards, stakingApy, liptBalance, stakeLipt, unstakeLipt, claimRewards } = useDashboard();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const { toast } = useToast();

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if(amount > 0 && amount <= liptBalance) {
      stakeLipt(amount);
      toast({ title: 'Staked Successfully', description: `You have staked ${amount} LIPT.` });
      setStakeAmount('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please check your balance and try again.' });
    }
  };
  
  const handleUnstake = () => {
    const amount = parseFloat(unstakeAmount);
    if(amount > 0 && amount <= stakedBalance) {
      unstakeLipt(amount);
      toast({ title: 'Unstaked Successfully', description: `You have unstaked ${amount} LIPT.` });
      setUnstakeAmount('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please check your staked balance and try again.' });
    }
  };

  const handleClaim = () => {
    if(unclaimedRewards > 0) {
      claimRewards();
      toast({ title: 'Rewards Claimed', description: `You have claimed ${unclaimedRewards.toFixed(2)} LIPT.` });
    } else {
      toast({ variant: 'destructive', title: 'No Rewards', description: 'You have no rewards to claim.' });
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-6 w-6 text-primary" />
          LIPT Staking Pool
        </CardTitle>
        <CardDescription>Stake your LIPT tokens to earn rewards.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Staked Balance</p>
            <p className="text-2xl font-bold">{stakedBalance.toLocaleString()} LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unclaimed Rewards</p>
            <p className="text-2xl font-bold">{unclaimedRewards.toFixed(2)} LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Staking APY</p>
            <p className="text-2xl font-bold text-chart-2">{stakingApy}%</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          <TabsContent value="stake" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <div className="flex gap-2">
                <Input id="stake-amount" type="number" placeholder="0.0" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
                <Button variant="default" onClick={handleStake}>Stake</Button>
              </div>
               <p className="text-xs text-muted-foreground">Your wallet balance: {liptBalance.toLocaleString()} LIPT</p>
            </div>
          </TabsContent>
          <TabsContent value="unstake" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="unstake-amount">Amount to Unstake</Label>
              <div className="flex gap-2">
                <Input id="unstake-amount" type="number" placeholder="0.0" value={unstakeAmount} onChange={e => setUnstakeAmount(e.target.value)} />
                <Button variant="destructive" onClick={handleUnstake}>Unstake</Button>
              </div>
              <p className="text-xs text-muted-foreground">Your staked balance: {stakedBalance.toLocaleString()} LIPT</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleClaim}>
            <Download className="mr-2 h-4 w-4" />
            Claim Rewards
        </Button>
      </CardFooter>
    </Card>
  );
}
