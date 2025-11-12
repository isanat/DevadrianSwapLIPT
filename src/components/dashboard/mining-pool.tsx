'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pickaxe, Bolt, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import useSWR, { useSWRConfig } from 'swr';
import { getMiningData, getWalletData, activateMiner, claimMinedRewards, MINING_PLANS, Miner } from '@/services/mock-api';
import { Skeleton } from '../ui/skeleton';

const ActiveMiner = ({ miner }: { miner: Miner }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useI18n();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateProgress = () => {
      const now = Date.now();
      const endDate = miner.startDate + miner.plan.duration * 24 * 60 * 60 * 1000;
      const totalDuration = endDate - miner.startDate;
      const elapsedTime = now - miner.startDate;
      
      const currentProgress = Math.min(100, (elapsedTime / totalDuration) * 100);
      setProgress(currentProgress);

      const newTimeLeft = currentProgress >= 100 ? 0 : Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      setTimeLeft(newTimeLeft);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000 * 60);

    return () => clearInterval(interval);
  }, [miner.startDate, miner.plan.duration]);

  if (!isClient) {
    return (
      <div className="flex flex-col gap-3 p-3 rounded-lg border bg-background/50">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between items-center mt-1">
             <Skeleton className="h-3 w-16" />
             <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    );
  }

  const isComplete = progress >= 100;

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border bg-background/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{miner.plan.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Bolt size={12} className="text-yellow-400" /> {miner.plan.power} LIPT/{t('miningPool.hour')}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{miner.minedAmount.toFixed(4)} LIPT</p>
          <p className="text-xs text-muted-foreground">{t('miningPool.mined')}</p>
        </div>
      </div>
      <div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% {t('stakingPool.complete')}</p>
          {isComplete ? (
            <p className="text-xs text-green-400">{t('miningPool.completed')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{timeLeft}d {t('stakingPool.remaining')}</p>
          )}
        </div>
      </div>
    </div>
  );
};


export function MiningPool() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const { data: miningData, isLoading: isLoadingMining } = useSWR('mining', getMiningData);
  const { data: walletData, isLoading: isLoadingWallet } = useSWR('wallet', getWalletData);
  
  const [selectedPlan, setSelectedPlan] = useState(MINING_PLANS[0]);
  const [isActivating, setIsActivating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleActivateMiner = async () => {
    if(walletData && walletData.liptBalance >= selectedPlan.cost) {
      setIsActivating(true);
      try {
        await activateMiner(selectedPlan);
        mutate('mining');
        mutate('wallet');
        toast({ title: t('miningPool.toast.activated.title'), description: t('miningPool.toast.activated.description', { name: selectedPlan.name }) });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsActivating(false);
      }
    } else {
      toast({ variant: 'destructive', title: t('miningPool.toast.insufficientFunds.title'), description: t('miningPool.toast.insufficientFunds.description') });
    }
  };

  const handleClaim = async () => {
    if(miningData && miningData.minedRewards > 0) {
      setIsClaiming(true);
      const amount = miningData.minedRewards.toFixed(2);
      try {
        await claimMinedRewards();
        mutate('mining');
        mutate('wallet');
        toast({ title: t('miningPool.toast.rewardsClaimed.title'), description: t('miningPool.toast.rewardsClaimed.description', { amount }) });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsClaiming(false);
      }
    } else {
      toast({ variant: 'destructive', title: t('stakingPool.toast.noRewards.title'), description: t('stakingPool.toast.noRewards.description') });
    }
  };

  const isLoading = isLoadingMining || isLoadingWallet;

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Pickaxe className="h-6 w-6 text-primary" />
              {t('miningPool.title')}
            </CardTitle>
            <HelpTooltip
              title={t('miningPool.title')}
              content={<p>{t('miningPool.tooltip')}</p>}
            />
          </div>
        </div>
        <CardDescription>{t('miningPool.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         {isLoading ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
                    <div>
                        <Skeleton className="h-4 w-28 mx-auto" />
                        <Skeleton className="h-8 w-24 mx-auto mt-2" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-32 mx-auto" />
                        <Skeleton className="h-8 w-20 mx-auto mt-2" />
                    </div>
                </div>
                <Skeleton className="h-24 w-full" />
            </div>
         ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
            <div>
                <p className="text-sm text-muted-foreground">{t('miningPool.totalPower')}</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-1"><Zap size={20} className="text-yellow-400" /> {miningData?.miningPower.toFixed(2)} LIPT/{t('miningPool.hour')}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{t('miningPool.unclaimedRewards')}</p>
                <p className="text-2xl font-bold">{miningData?.minedRewards.toFixed(4)} LIPT</p>
            </div>
            </div>
            <Tabs defaultValue="activate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activate">{t('miningPool.activateTab')}</TabsTrigger>
                <TabsTrigger value="active">{t('miningPool.activeTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="activate" className="mt-4">
                <div className="space-y-4">
                <div>
                    <Label>{t('miningPool.selectMiner')}</Label>
                    <RadioGroup defaultValue={selectedPlan.name} onValueChange={(val) => setSelectedPlan(MINING_PLANS.find(p => p.name === val)!)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {MINING_PLANS.map(plan => (
                            <Label 
                                key={plan.name} 
                                htmlFor={`miner-${plan.name}`} 
                                className={cn(
                                "flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all cursor-pointer",
                                "hover:border-primary/50 hover:bg-accent/50",
                                selectedPlan.name === plan.name ? "border-primary bg-accent/20" : "border-muted bg-background/50"
                                )}>
                                <RadioGroupItem value={plan.name} id={`miner-${plan.name}`} className="sr-only" />
                                <div className="text-lg font-bold">{plan.name}</div>
                                <div className="flex items-center gap-2 font-semibold text-sm text-primary">
                                    <Bolt size={14} /> 
                                    {plan.power} LIPT/{t('miningPool.hour')}
                                </div>
                                <div className="text-xs text-muted-foreground">{t('miningPool.cost')}: {plan.cost.toLocaleString('en-US',{useGrouping:true})} LIPT</div>
                                <div className="text-xs text-muted-foreground">{plan.duration} {t('stakingPool.days')}</div>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Button className="w-full" variant="default" onClick={handleActivateMiner} disabled={isActivating}>
                        {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isActivating ? 'Activating...' : `${t('miningPool.activateButton')} '${selectedPlan.name}'`}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">{t('stakingPool.walletBalance')}: {walletData?.liptBalance.toLocaleString('en-US')} LIPT</p>
                </div>
                </div>
            </TabsContent>
            <TabsContent value="active" className="mt-4">
                <div className="space-y-3">
                <Label>{t('miningPool.yourActiveMiners')}</Label>              
                {miningData && miningData.miners.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {miningData.miners.map(miner => (
                        <ActiveMiner key={miner.id} miner={miner} />
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('miningPool.noActiveMiners')}</p>
                )}
                </div>
            </TabsContent>
            </Tabs>
        </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleClaim} disabled={isClaiming}>
            {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isClaiming ? 'Claiming...' : t('miningPool.claimRewardsButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
