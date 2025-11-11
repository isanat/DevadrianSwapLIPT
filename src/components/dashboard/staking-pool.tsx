'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Archive, Download, Clock, AlertTriangle } from 'lucide-react';
import { useDashboard, STAKING_PLANS } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const StakedPosition = ({ stake, onUnstake }: { stake: any; onUnstake: (id: string, penalty: number) => void; }) => {
  const { unstakeLipt } = useDashboard();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleUnstake = () => {
    const { penalty } = unstakeLipt(stake.id);
    onUnstake(stake.id, penalty);
  };
  
  const isMature = progress >= 100;

  useEffect(() => {
    const calculateProgress = () => {
      const now = Date.now();
      const endDate = stake.startDate + stake.plan.duration * 24 * 60 * 60 * 1000;
      const totalDuration = endDate - stake.startDate;
      const elapsedTime = now - stake.startDate;
      
      const currentProgress = Math.min(100, (elapsedTime / totalDuration) * 100);
      setProgress(currentProgress);

      const newTimeLeft = currentProgress >= 100 ? 0 : Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      setTimeLeft(newTimeLeft);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [stake.startDate, stake.plan.duration]);


  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border bg-background/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{stake.amount.toLocaleString('en-US')} LIPT</p>
          <p className="text-xs text-muted-foreground">
            {stake.plan.duration} days @ {stake.plan.apy}% APY
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={isMature ? "outline" : "destructive"} size="sm">Unstake</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to unstake?</AlertDialogTitle>
              <AlertDialogDescription>
                {!isMature && (
                  <span className="text-destructive font-semibold flex items-center gap-2">
                    <AlertTriangle/> This stake is not mature. A 10% penalty will be applied to the principal amount.
                  </span>
                )}
                 {isMature && 'Your funds will be returned to your wallet.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnstake} className={!isMature ? "bg-destructive hover:bg-destructive/90" : ""}>
                Yes, Unstake
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</p>
            {isMature ? (
              <Badge variant="secondary" className="text-green-400 border-green-400 text-xs">Mature</Badge>
            ) : (
              <p className="text-xs text-muted-foreground">{timeLeft}d remaining</p>
            )}
        </div>
      </div>
    </div>
  );
};


export function StakingPool() {
  const { stakedBalance, unclaimedRewards, liptBalance, stakeLipt, claimRewards, stakes } = useDashboard();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(STAKING_PLANS[0]);
  const { toast } = useToast();
  const [displayLiptBalance, setDisplayLiptBalance] = React.useState('0');

  React.useEffect(() => {
    setDisplayLiptBalance(liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
  }, [liptBalance]);

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if(amount > 0 && amount <= liptBalance) {
      stakeLipt(amount, selectedPlan);
      toast({ title: 'Staked Successfully', description: `You have staked ${amount} LIPT for ${selectedPlan.duration} days.` });
      setStakeAmount('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please check your balance and try again.' });
    }
  };
  
  const handleUnstake = (stakeId: string, penalty: number) => {
      toast({ 
        title: 'Unstaked Successfully', 
        description: penalty > 0 ? `You have unstaked. A penalty of ${penalty.toFixed(2)} LIPT was applied.` : 'Your funds have been returned to your wallet.'
      });
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
        <CardDescription>Stake your LIPT tokens to earn higher rewards with longer lock-in periods.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Staked Balance</p>
            <p className="text-2xl font-bold">{stakedBalance.toLocaleString('en-US')} LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unclaimed Rewards</p>
            <p className="text-2xl font-bold">{unclaimedRewards.toFixed(2)} LIPT</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Manage Stakes</TabsTrigger>
          </TabsList>
          <TabsContent value="stake" className="mt-4">
            <div className="space-y-4">
              <div>
                  <Label>Select Staking Plan</Label>
                  <RadioGroup defaultValue={String(selectedPlan.duration)} onValueChange={(val) => setSelectedPlan(STAKING_PLANS.find(p => p.duration === parseInt(val))!)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                      {STAKING_PLANS.map(plan => (
                          <Label 
                            key={plan.duration} 
                            htmlFor={`plan-${plan.duration}`} 
                            className={cn(
                              "flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all cursor-pointer",
                              "hover:border-primary/50 hover:bg-accent/50",
                              selectedPlan.duration === plan.duration ? "border-primary bg-accent/20" : "border-muted bg-background/50"
                            )}>
                              <RadioGroupItem value={String(plan.duration)} id={`plan-${plan.duration}`} className="sr-only" />
                              <div className="flex items-center gap-2 font-semibold text-sm">
                                <Clock size={14} /> 
                                {plan.duration} Days
                              </div>
                              <div className="text-lg font-bold text-primary">{plan.apy.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">APY</div>
                          </Label>
                      ))}
                  </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Amount to Stake</Label>
                <div className="flex gap-2">
                  <Input id="stake-amount" type="number" placeholder="0.0" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
                  <Button variant="default" onClick={handleStake}>Stake</Button>
                </div>
                <p className="text-xs text-muted-foreground">Your wallet balance: {displayLiptBalance} LIPT</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="unstake" className="mt-4">
            <div className="space-y-3">
              <Label>Your Active Stakes</Label>
              {stakes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {stakes.map(stake => (
                    <StakedPosition key={stake.id} stake={stake} onUnstake={handleUnstake} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have no active stakes.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleClaim}>
            <Download className="mr-2 h-4 w-4" />
            Claim All Rewards
        </Button>
      </CardFooter>
    </Card>
  );
}
