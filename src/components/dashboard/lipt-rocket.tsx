'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';
import { Rocket, Star } from 'lucide-react';

const RocketIcon = ({ crashed }: { crashed: boolean }) => (
  <div className={cn("relative transition-all duration-500 w-16 h-16 md:w-20 md:h-20", crashed && "opacity-0 scale-50 rotate-45")}>
    <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-orange-400 rounded-t-full blur-md transition-all duration-300", crashed ? "opacity-0" : "opacity-100")} />
    <Rocket className={cn("w-full h-full text-slate-300 -rotate-45 transition-transform duration-300", crashed && "rotate-0")} />
  </div>
);

const StarField = ({ count = 50 }: { count?: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: Math.random() * 2 + 1,
      animationDelay: Math.random() * 3,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-yellow-300 animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

const ShootingStar = ({ id }: { id: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      const hideTimeout = setTimeout(() => setVisible(false), 3000);
      return hideTimeout;
    };

    const interval = setInterval(() => {
      const hideTimeout = show();
      return () => clearTimeout(hideTimeout);
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const top = -10;
  const left = Math.random() * 100;
  const duration = Math.random() * 1.5 + 2;

  return (
    <div
      key={id}
      className="absolute animate-shooting-star pointer-events-none"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        animationDuration: `${duration}s`,
      }}
    >
      <Star className="w-4 h-4 text-yellow-300/60 fill-yellow-300/40" />
    </div>
  );
};

const generateCrashPoint = (): number => {
  try {
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    const r = h / e;
    const crash = Math.floor(100 / (1 - r)) / 100;
    return Math.max(1.01, crash);
  } catch {
    // Fallback seguro
    return Math.max(1.01, Math.random() * 10 + 1.01);
  }
};

export function LiptRocket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, updateLiptBalance } = useDashboard();

  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'crashed' | 'cashed_out'>('idle');
  const [rocketPosition, setRocketPosition] = useState(0);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCashingOut = useRef(false);

  const startGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const crashPoint = generateCrashPoint();
    let current = 1.0;

    setGameStatus('in_progress');
    setMultiplier(1.0);
    setRocketPosition(0);
    setCashedOutMultiplier(null);
    isCashingOut.current = false;

    intervalRef.current = setInterval(() => {
      if (gameStatus !== 'in_progress') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      current += 0.01 + current * 0.015;
      setMultiplier(current);

      // Progresso logarítmico suave
      const progress = crashPoint > 1.01
        ? (Math.log10(current) / Math.log10(crashPoint)) * 90
        : 0;
      setRocketPosition(Math.min(90, progress));

      if (current >= crashPoint) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGameStatus('crashed');
        setMultiplier(crashPoint);
        setRocketPosition(100);
        toast({
          variant: "destructive",
          title: t('gameZone.rocket.toast.crashed.title'),
          description: t('gameZone.rocket.toast.crashed.description', { multiplier: crashPoint.toFixed(2) })
        });
      }
    }, 80);
  }, [gameStatus, t, toast]);

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(startGame, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, startGame]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
    setGameStatus('waiting');
    toast({
      title: t('gameZone.rocket.toast.betPlaced.title'),
      description: t('gameZone.rocket.toast.betPlaced.description', { amount: bet })
    });
  };

  const handleCashOut = () => {
    if (gameStatus !== 'in_progress' || isCashingOut.current) return;
    isCashingOut.current = true;

    const bet = parseFloat(betAmount);
    const winnings = bet * multiplier;
    updateLiptBalance(winnings);
    setCashedOutMultiplier(multiplier);
    setGameStatus('cashed_out');

    if (intervalRef.current) clearInterval(intervalRef.current);

    toast({
      title: t('gameZone.rocket.toast.cashedOut.title'),
      description: t('gameZone.rocket.toast.cashedOut.description', {
        amount: winnings.toFixed(2),
        multiplier: multiplier.toFixed(2)
      })
    });
  };

  const handleReset = () => {
    setMultiplier(1.0);
    setGameStatus('idle');
    setRocketPosition(0);
    setCashedOutMultiplier(null);
    setBetAmount('');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getButton = () => {
    switch (gameStatus) {
      case 'idle':
        return <Button onClick={handleBet} className="w-full py-6 text-lg">{t('gameZone.rocket.placeBet')}</Button>;
      case 'waiting':
        return <Button disabled className="w-full py-6 text-lg">{t('gameZone.rocket.waitingForNextRound')}</Button>;
      case 'in_progress':
        return (
          <Button onClick={handleCashOut} className="w-full py-6 text-lg bg-green-500 hover:bg-green-600">
            {t('gameZone.rocket.cashOut')} @ {multiplier.toFixed(2)}x
          </Button>
        );
      case 'cashed_out':
      case 'crashed':
        return <Button onClick={handleReset} className="w-full py-6 text-lg">{t('gameZone.rocket.playAgain')}</Button>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg bg-background/50 border">
      <div className="w-full h-72 md:h-80 bg-gradient-to-b from-gray-900 via-indigo-900/80 to-blue-900/50 rounded-lg overflow-hidden relative flex items-end justify-center border-b-2 border-primary/20">
        <StarField />
        {[1, 2, 3].map(i => <ShootingStar key={i} id={i} />)}

        <div
          className="absolute bottom-4 transition-transform duration-100 ease-linear"
          style={{ transform: `translateY(-${rocketPosition * 2.5}px)` }}
        >
          <RocketIcon crashed={gameStatus === 'crashed'} />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          {gameStatus === 'crashed' || gameStatus === 'cashed_out' ? (
            <div className='flex flex-col items-center'>
              <span className={cn("text-4xl md:text-5xl font-bold drop-shadow-lg", gameStatus === 'crashed' ? "text-red-500" : "text-green-500")}>
                {(cashedOutMultiplier ?? multiplier).toFixed(2)}x
              </span>
              <span className="text-lg md:text-xl text-white/80 font-semibold mt-2">
                {gameStatus === 'crashed' ? t('gameZone.rocket.crashed') : t('gameZone.rocket.youCashedOut')}
              </span>
            </div>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {gameStatus === 'waiting' ? '...' : `${multiplier.toFixed(2)}x`}
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
          {t('stakingPool.walletBalance')}: {liptBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} LIPT
        </p>
      </div>

      <div className="w-full max-w-xs">
        {getButton()}
      </div>
    </div>
  );
}