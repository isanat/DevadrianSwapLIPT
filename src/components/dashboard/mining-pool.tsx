'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pickaxe, Bolt, Zap } from 'lucide-react';
import { useDashboard, MINING_PLANS } from '@/context/dashboard-context';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';

const ActiveMiner = ({ miner }: { miner: any }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
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
  const { miningPower, minedRewards, liptBalance, activateMiner, claimMinedRewards, miners } = useDashboard();
  const [selectedPlan, setSelectedPlan] = useState(MINING_PLANS[0]);
  const [displayLiptBalance, setDisplayLiptBalance] = React.useState('0');

  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    setDisplayLiptBalance(liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
  }, [liptBalance]);

  const handleActivateMiner = () => {
    if(liptBalance >= selectedPlan.cost) {
      activateMiner(selectedPlan);
      toast({ title: t('miningPool.toast.activated.title'), description: t('miningPool.toast.activated.description', { name: selectedPlan.name }) });
    } else {
      toast({ variant: 'destructive', title: t('miningPool.toast.insufficientFunds.title'), description: t('miningPool.toast.insufficientFunds.description') });
    }
  };

  const handleClaim = () => {
    if(minedRewards > 0) {
      const amount = minedRewards.toFixed(2);
      claimMinedRewards();
      toast({ title: t('miningPool.toast.rewardsClaimed.title'), description: t('miningPool.toast.rewardsClaimed.description', { amount }) });
    } else {
      toast({ variant: 'destructive', title: t('stakingPool.toast.noRewards.title'), description: t('stakingPool.toast.noRewards.description') });
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">{t('miningPool.totalPower')}</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1"><Zap size={20} className="text-yellow-400" /> {miningPower.toFixed(2)} LIPT/{t('miningPool.hour')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('miningPool.unclaimedRewards')}</p>
            <p className="text-2xl font-bold">{minedRewards.toFixed(4)} LIPT</p>
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
                <Button className="w-full" variant="default" onClick={handleActivateMiner}>{t('miningPool.activateButton')} '{selectedPlan.name}'</Button>
                <p className="text-xs text-muted-foreground text-center">{t('stakingPool.walletBalance')}: {displayLiptBalance} LIPT</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <div className="space-y-3">
              <Label>{t('miningPool.yourActiveMiners')}</Label>              {miners.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {miners.map(miner => (
                    <ActiveMiner key={miner.id} miner={miner} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('miningPool.noActiveMiners')}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleClaim}>
            {t('miningPool.claimRewardsButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
