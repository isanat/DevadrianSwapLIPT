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
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';

const StakedPosition = ({ stake, onUnstake }: { stake: any; onUnstake: (id: string, penalty: number) => void; }) => {
  const { unstakeLipt } = useDashboard();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useI18n();

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
            {stake.plan.duration} {t('stakingPool.days')} @ {stake.plan.apy}% {t('stakingPool.apy')}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={isMature ? "outline" : "destructive"} size="sm">{t('stakingPool.unstakeButton')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('stakingPool.unstakeModal.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {!isMature ? (
                  <span className="text-destructive font-semibold flex items-center gap-2">
                    <AlertTriangle/> {t('stakingPool.unstakeModal.descriptionPenalty')}
                  </span>
                ) : t('stakingPool.unstakeModal.descriptionMature')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('stakingPool.unstakeModal.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnstake} className={!isMature ? "bg-destructive hover:bg-destructive/90" : ""}>
                {t('stakingPool.unstakeModal.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% {t('stakingPool.complete')}</p>
            {isMature ? (
              <Badge variant="secondary" className="text-green-400 border-green-400 text-xs">{t('stakingPool.mature')}</Badge>
            ) : (
              <p className="text-xs text-muted-foreground">{timeLeft}d {t('stakingPool.remaining')}</p>
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
  const { t } = useI18n();

  React.useEffect(() => {
    setDisplayLiptBalance(liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
  }, [liptBalance]);

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if(amount > 0 && amount <= liptBalance) {
      stakeLipt(amount, selectedPlan);
      toast({ title: t('stakingPool.toast.staked.title'), description: t('stakingPool.toast.staked.description', { amount, duration: selectedPlan.duration }) });
      setStakeAmount('');
    } else {
      toast({ variant: 'destructive', title: t('stakingPool.toast.invalidAmount.title'), description: t('stakingPool.toast.invalidAmount.description') });
    }
  };
  
  const handleUnstake = (stakeId: string, penalty: number) => {
      toast({ 
        title: t('stakingPool.toast.unstaked.title'), 
        description: penalty > 0 ? t('stakingPool.toast.unstaked.descriptionPenalty', { penalty: penalty.toFixed(2) }) : t('stakingPool.toast.unstaked.description')
      });
  };

  const handleClaim = () => {
    if(unclaimedRewards > 0) {
      const amount = unclaimedRewards.toFixed(2);
      claimRewards();
      toast({ title: t('stakingPool.toast.rewardsClaimed.title'), description: t('stakingPool.toast.rewardsClaimed.description', { amount }) });
    } else {
      toast({ variant: 'destructive', title: t('stakingPool.toast.noRewards.title'), description: t('stakingPool.toast.noRewards.description') });
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" />
            {t('stakingPool.title')}
          </CardTitle>
          <HelpTooltip
            title={t('stakingPool.title')}
            content={<p>{t('stakingPool.tooltip')}</p>}
          />
        </div>
        <CardDescription>{t('stakingPool.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">{t('stakingPool.totalStaked')}</p>
            <p className="text-2xl font-bold">{stakedBalance.toLocaleString('en-US')} LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('stakingPool.unclaimedRewards')}</p>
            <p className="text-2xl font-bold">{unclaimedRewards.toFixed(2)} LIPT</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">{t('stakingPool.stakeTab')}</TabsTrigger>
            <TabsTrigger value="unstake">{t('stakingPool.manageTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="stake" className="mt-4">
            <div className="space-y-4">
              <div>
                  <Label>{t('stakingPool.selectPlan')}</Label>
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
                                {plan.duration} {t('stakingPool.days')}
                              </div>
                              <div className="text-lg font-bold text-primary">{plan.apy.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">{t('stakingPool.apy')}</div>
                          </Label>
                      ))}
                  </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stake-amount">{t('stakingPool.amountToStake')}</Label>
                <div className="flex gap-2">
                  <Input id="stake-amount" type="number" placeholder="0.0" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
                  <Button variant="default" onClick={handleStake}>{t('stakingPool.stakeButton')}</Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('stakingPool.walletBalance')}: {displayLiptBalance} LIPT</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="unstake" className="mt-4">
            <div className="space-y-3">
              <Label>{t('stakingPool.yourActiveStakes')}</Label>
              {stakes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {stakes.map(stake => (
                    <StakedPosition key={stake.id} stake={stake} onUnstake={handleUnstake} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('stakingPool.noActiveStakes')}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleClaim}>
            <Download className="mr-2 h-4 w-4" />
            {t('stakingPool.claimRewardsButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}