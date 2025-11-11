'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';

// 🎯 Segmentos com pesos e os valores dos prêmios
const segments = [
  { value: 3,   label: '3x' },
  { value: 2,   label: '2x' },
  { value: 1.3, label: '1.3x' },
  { value: 1,   label: '1x' },
  { value: 0.5, label: '0.5x' },
  { value: 0,   label: '0x' },
];

const totalSegments = segments.length;
const segmentAngle = 360 / totalSegments;

// Para dar vantagem à casa, podemos criar um array de pesos
// A ordem DEVE corresponder à ordem dos segmentos acima
const weights = [3, 6, 12, 25, 24, 30]; // Pesos: 3x é mais raro, 0x é mais comum
const totalWeight = weights.reduce((sum, w) => sum + w, 0);

const getWeightedRandomSegment = () => {
  let r = Math.random() * totalWeight;
  for (let i = 0; i < segments.length; i++) {
    if (r < weights[i]) return { segment: segments[i], index: i };
    r -= weights[i];
  }
  // Fallback (não deve acontecer com lógica correta)
  return { segment: segments[segments.length - 1], index: segments.length - 1 };
};

const Wheel = ({ rotation, isSpinning }: { rotation: number; isSpinning: boolean }) => {
  const transitionStyle = isSpinning
    ? { transition: 'transform 8s cubic-bezier(0.25, 1, 0.5, 1)' }
    : { transition: 'none' };

  return (
    <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto my-8 flex items-center justify-center">
      {/* Círculo externo e interno que giram */}
      <div
        className="absolute w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, ...transitionStyle }}
      >
        {/* Círculo externo */}
        <div className="w-full h-full rounded-full border-2 border-primary/30" />
        
        {/* Círculo interno */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border-2 border-primary/30" />

        {/* Labels dos prêmios */}
        {segments.map((seg, i) => {
          const angle = segmentAngle * i + segmentAngle / 2;
          const radius = 105; // Distância do centro
          const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
          const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 text-lg font-semibold text-foreground/80"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              }}
            >
              {seg.label}
            </span>
          );
        })}
      </div>

      {/* Ponteiro fixo no topo */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-primary z-20" />

      {/* Círculo central fixo */}
      <div className="absolute w-[40%] h-[40%] rounded-full border-2 border-primary flex items-center justify-center">
        <span className="text-xl font-bold text-primary tracking-widest">
          GIRAR
        </span>
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

    const { segment: winningSeg, index: winningIndex } = getWeightedRandomSegment();

    // Ângulo alvo precisa apontar para o meio do segmento vencedor
    const targetBaseAngle = -(segmentAngle * winningIndex + segmentAngle / 2);
    
    // Adiciona uma pequena variação para não parar sempre no mesmo ponto exato
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const targetAngle = targetBaseAngle + randomOffset;

    const randomSpins = Math.floor(Math.random() * 3) + 6; // 6–8 voltas
    const finalRotation = (rotation - (rotation % 360)) + (randomSpins * 360) + targetAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      const winnings = parseFloat((bet * winningSeg.value).toFixed(2));

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
      // Não reseta a rotação para manter a posição, mas normaliza para a próxima rodada
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
        className="w-full max-w-xs font-bold text-lg py-6 bg-primary hover:bg-primary/90"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning
          ? t('gameZone.wheelOfFortune.spinning')
          : t('gameZone.wheelOfFortune.spinButton')}
      </Button>

      {isSpinning && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {t('gameZone.wheelOfFortune.spinning')}...
        </p>
      )}
    </div>
  );
}