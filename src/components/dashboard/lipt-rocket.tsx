'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

const RocketIcon = () => (
  <Rocket className="w-12 h-12 md:w-16 md:h-16 text-primary transition-transform duration-500" />
);

export function LiptRocket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, updateLiptBalance } = useDashboard();

  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'betting' | 'in_progress' | 'crashed' | 'cashed_out'>('idle');
  const [rocketPosition, setRocketPosition] = useState(0); // 0 to 100
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);

  const calculateCrashPoint = () => {
    // This creates a non-linear probability distribution.
    // The chance of crashing increases as the multiplier gets higher.
    const r = Math.random();
    // This will result in most crashes happening between 1x and 3x, with rare flights going much higher.
    const crashPoint = 1 / (1 - r);
    return Math.max(1.01, crashPoint);
  };

  const runGame = useCallback(() => {
    setGameStatus('in_progress');
    const crashPoint = calculateCrashPoint();
    let currentMultiplier = 1.00;
  
    const interval = setInterval(() => {
      currentMultiplier += 0.01 + (currentMultiplier > 3 ? 0.05 : 0); // Accelerate at higher multipliers
      
      if (currentMultiplier >= crashPoint) {
        clearInterval(interval);
        setGameStatus('crashed');
        setMultiplier(crashPoint);
        setRocketPosition(100);
        if (gameStatus !== 'cashed_out') {
           toast({
            variant: "destructive",
            title: t('gameZone.rocket.toast.crashed.title'),
            description: t('gameZone.rocket.toast.crashed.description', { multiplier: crashPoint.toFixed(2) })
          });
        }
      } else {
        setMultiplier(currentMultiplier);
        // Update rocket position based on multiplier (logarithmic scale makes it feel faster at the start)
        const progress = Math.min(95, Math.log(currentMultiplier) / Math.log(crashPoint) * 100);
        setRocketPosition(progress);
      }
    }, 100);
  
    return () => clearInterval(interval);
  }, [t, toast, gameStatus]);
  

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(() => {
        runGame();
      }, 3000); // 3 second countdown before launch
      return () => clearTimeout(timer);
    }
  }, [gameStatus, runGame]);

  const handleBet = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast({ variant: 'destructive', title: t('gameZone.wheelOfFortune.toast.invalidBet.title') });
      return;
    }
    if (bet > liptBalance) {
      toast({ variant: 'destructive', title: t('stakingPool.toast.invalidAmount.title') });
      return;
    }

    updateLiptBalance(-bet);
    setGameStatus('betting');
    toast({ title: t('gameZone.rocket.toast.betPlaced.title'), description: t('gameZone.rocket.toast.betPlaced.description', { amount: bet }) });
  };

  const handleCashOut = () => {
    const bet = parseFloat(betAmount);
    const winnings = bet * multiplier;
    updateLiptBalance(winnings);
    setCashedOutMultiplier(multiplier);
    setGameStatus('cashed_out');
    toast({
      title: t('gameZone.rocket.toast.cashedOut.title'),
      description: t('gameZone.rocket.toast.cashedOut.description', { amount: winnings.toFixed(2), multiplier: multiplier.toFixed(2) })
    });
  };

  const handleReset = () => {
    setMultiplier(1.00);
    setGameStatus('idle');
    setRocketPosition(0);
    setCashedOutMultiplier(null);
    // betAmount is intentionally not reset to allow for re-betting
  };
  
  const getButton = () => {
    switch (gameStatus) {
      case 'idle':
        return <Button onClick={handleBet} className="w-full py-6 text-lg">{t('gameZone.rocket.placeBet')}</Button>;
      case 'betting':
         return <Button onClick={handleBet} disabled className="w-full py-6 text-lg">{t('gameZone.rocket.waitingForNextRound')}</Button>;
      case 'in_progress':
        return <Button onClick={handleCashOut} className="w-full py-6 text-lg bg-green-500 hover:bg-green-600">{t('gameZone.rocket.cashOut')} @ {multiplier.toFixed(2)}x</Button>;
      case 'cashed_out':
      case 'crashed':
        return <Button onClick={handleReset} className="w-full py-6 text-lg">{t('gameZone.rocket.playAgain')}</Button>;
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg bg-background/50 border">
      <div className="w-full h-64 md:h-80 bg-gray-900/50 rounded-lg overflow-hidden relative flex items-end justify-center border-b-2 border-primary/20">
        {/* Rocket Container */}
        <div 
          className="absolute bottom-0 transition-transform duration-100 ease-linear"
          style={{ transform: `translateY(-${rocketPosition}%)` }}
        >
          <RocketIcon />
        </div>
        
        {/* Multiplier Display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            {gameStatus === 'crashed' || gameStatus === 'cashed_out' ? (
                <div className='flex flex-col items-center'>
                    <span className={cn("text-5xl md:text-7xl font-bold", gameStatus === 'crashed' ? "text-red-500" : "text-green-500")}>
                        {cashedOutMultiplier ? cashedOutMultiplier.toFixed(2) : multiplier.toFixed(2)}x
                    </span>
                    <span className="text-lg md:text-xl text-white/80 font-semibold mt-2">
                        {gameStatus === 'crashed' ? t('gameZone.rocket.crashed') : t('gameZone.rocket.youCashedOut')}
                    </span>
                </div>
            ) : (
                <h2 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
                    {multiplier.toFixed(2)}x
                </h2>
            )}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="bet-amount-rocket">{t('gameZone.wheelOfFortune.betAmount')}</Label>
        <Input
          id="bet-amount-rocket"
          type="number"
          placeholder="0.0"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={gameStatus !== 'idle'}
          className="text-center text-lg"
        />
        <p className="text-xs text-muted-foreground text-center">
          {t('stakingPool.walletBalance')}: {liptBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} LIPT
        </p>
      </div>

      <div className="w-full max-w-xs">
        {getButton()}
      </div>
    </div>
  );
}
