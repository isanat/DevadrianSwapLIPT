'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';

// 🎯 Segmentos com pesos (probabilidades) — casa com vantagem ~17%
const segments = [
  { value: 0,   label: '0x',   color: 'hsl(4 90% 58%)',    weight: 28 },
  { value: 0.5, label: '0.5x', color: 'hsl(36 95% 55%)',   weight: 24 },
  { value: 1,   label: '1x',   color: 'hsl(200 95% 55%)',  weight: 26 },
  { value: 1.3, label: '1.3x', color: 'hsl(122 80% 55%)',  weight: 12 },
  { value: 2,   label: '2x',   color: 'hsl(275 80% 60%)',  weight: 7 },
  { value: 3,   label: '3x',   color: 'hsl(48 95% 55%)',   weight: 3 },
];

const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

// 🎨 Gera o gradiente conic proporcional
const getConicGradient = () => {
  let gradient = 'conic-gradient(';
  let currentAngle = -90; // ponteiro no topo
  segments.forEach((seg, i) => {
    const segmentAngle = (seg.weight / totalWeight) * 360;
    const nextAngle = currentAngle + segmentAngle;
    gradient += `${seg.color} ${currentAngle}deg ${nextAngle}deg`;
    if (i < segments.length - 1) gradient += ', ';
    currentAngle = nextAngle;
  });
  gradient += ')';
  return gradient;
};

// 📊 Sorteio ponderado por peso
const getWeightedRandomSegment = () => {
  let r = Math.random() * totalWeight;
  for (const seg of segments) {
    if (r < seg.weight) return seg;
    r -= seg.weight;
  }
  return segments[segments.length - 1];
};

const Wheel = ({ rotation, isSpinning }: { rotation: number; isSpinning: boolean }) => {
  const transitionStyle = isSpinning
    ? { transition: 'transform 8s cubic-bezier(0.25, 1, 0.5, 1)' } // ease-out-cubic
    : { transition: 'none' };

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto my-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.3),0_0_25px_rgba(0,0,0,0.7)] rounded-full">
      {/* Ponteiro */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-accent z-20" />

      <div
        className={cn('relative w-full h-full rounded-full flex items-center justify-center')}
        style={{ transform: `rotate(${rotation}deg)`, ...transitionStyle }}
      >
        {/* Fundo da roda */}
        <div
          className="absolute w-full h-full rounded-full border-4 border-primary/40"
          style={{ background: getConicGradient() }}
        />

        {/* Marcadores de texto */}
        {segments.map((seg, i) => {
          const startAngle =
            -90 +
            (segments.slice(0, i).reduce((sum, s) => sum + (s.weight / totalWeight) * 360, 0) +
              (seg.weight / totalWeight) * 180);
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 text-white text-sm font-bold drop-shadow-md"
              style={{
                transform: `rotate(${startAngle}deg) translateX(110px) rotate(${-startAngle}deg)`,
              }}
            >
              {seg.label}
            </span>
          );
        })}

        {/* Círculo central */}
        <div className="absolute w-16 h-16 rounded-full bg-card border-4 border-primary z-10 shadow-md" />
      </div>
    </div>
  );
};

export function WheelOfFortune() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, updateLiptBalance } = useDashboard();
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || bet > liptBalance) {
      toast({
        variant: 'destructive',
        title: t('gameZone.wheelOfFortune.toast.invalidBet.title'),
        description: t('gameZone.wheelOfFortune.toast.invalidBet.description'),
      });
      return;
    }

    setIsSpinning(true);
    updateLiptBalance(-bet);

    const winningSeg = getWeightedRandomSegment();
    const winningIndex = segments.indexOf(winningSeg);

    // Cálculo do ângulo alvo proporcional
    let currentAngle = -90;
    for (let i = 0; i < winningIndex; i++) {
      currentAngle += (segments[i].weight / totalWeight) * 360;
    }
    const segAngle = (segments[winningIndex].weight / totalWeight) * 360;
    const targetAngle = -(currentAngle + segAngle / 2);

    const randomSpins = Math.floor(Math.random() * 3) + 6; // 6–8 voltas
    const finalRotation = randomSpins * 360 + targetAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      const winnings = bet * winningSeg.value;

      if (winnings > 0) {
        updateLiptBalance(winnings);
        toast({
          title: t('gameZone.wheelOfFortune.toast.win.title'),
          description: t('gameZone.wheelOfFortune.toast.win.description', {
            amount: winnings.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          }),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('gameZone.wheelOfFortune.toast.lose.title'),
          description: t('gameZone.wheelOfFortune.toast.lose.description'),
        });
      }

      setIsSpinning(false);
      setBetAmount('');
      setRotation(finalRotation % 360);
    }, 8000); // 8s animação
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Wheel rotation={rotation} isSpinning={isSpinning} />

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="bet-amount">{t('gameZone.wheelOfFortune.betAmount')}</Label>
        <Input
          id="bet-amount"
          type="number"
          placeholder="0.0"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={isSpinning}
        />
        <p className="text-xs text-muted-foreground">
          {t('stakingPool.walletBalance')}: {liptBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} LIPT
        </p>
      </div>

      <Button
        className="w-full max-w-xs font-bold text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning
          ? t('gameZone.wheelOfFortune.spinning')
          : t('gameZone.wheelOfFortune.spinButton')}
      </Button>

      {isSpinning && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {t('gameZone.wheelOfFortune.spinning')}
        </p>
      )}
    </div>
  );
}
