'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/context/dashboard-context';

// === CONFIGURAÇÃO DOS SEGMENTOS (PESOS + CORES) ===
const segments = [
  { value: 0,   label: '0x',   color: 'hsl(4 90% 58%)',   weight: 28 },   // Vermelho
  { value: 0.5, label: '0.5x',  color: 'hsl(36 95% 55%)',  weight: 24 },   // Laranja
  { value: 1,   label: '1x',   color: 'hsl(200 95% 55%)', weight: 26 },   // Azul
  { value: 1.3, label: '1.3x',  color: 'hsl(122 80% 55%)', weight: 12 },   // Verde
  { value: 2,   label: '2x',   color: 'hsl(275 80% 60%)', weight: 7 },    // Roxo
  { value: 3,   label: '3x',   color: 'hsl(48 95% 55%)',  weight: 3 },    // Amarelo
] as const;

const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);

// === FUNÇÃO PARA GERAR GRADIENTE PROPORCIONAL ===
const getConicGradient = () => {
  let gradient = 'conic-gradient(';
  let currentAngle = -90; // Começa no topo (ponteiro)

  segments.forEach((seg, index) => {
    const segmentAngle = (seg.weight / totalWeight) * 360;
    const nextAngle = currentAngle + segmentAngle;
    gradient += `${seg.color} ${currentAngle.toFixed(4)}deg ${nextAngle.toFixed(4)}deg`;
    if (index < segments.length - 1) gradient += ', ';
    currentAngle = nextAngle;
  });

  gradient += ')';
  return gradient;
};

// === SORTEIO PONDERADO ===
const getWinningSegment = () => {
  let r = Math.random() * totalWeight;
  for (const seg of segments) {
    if (r < seg.weight) return seg;
    r -= seg.weight;
  }
  return segments[segments.length - 1];
};

// === COMPONENTE DA RODA ===
const Wheel = ({ rotation, isSpinning }: { rotation: number; isSpinning: boolean }) => {
  const transitionStyle = isSpinning
    ? { transition: 'transform 15s cubic-bezier(0.25, 0.1, 0.25, 1)' }
    : { transition: 'none' };

  let currentAngle = -90;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto my-8 shadow-2xl">
      {/* Efeito de glow interno (cassino style) */}
      <div className="absolute inset-0 rounded-full shadow-inner-glow pointer-events-none" />

      {/* Ponteiro fixo no topo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-0 h-0 
                   border-l-[16px] border-l-transparent 
                   border-r-[16px] border-r-transparent 
                   border-t-[28px] border-t-yellow-400 
                   drop-shadow-lg z-30"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
      />

      {/* Roda giratória */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          ...transitionStyle,
        }}
      >
        {/* Gradiente de fundo */}
        <div
          className="absolute inset-0 rounded-full border-8 border-gray-900"
          style={{ background: getConicGradient() }}
        />

        {/* Linhas separadoras + labels */}
        {segments.map((seg, index) => {
          const segmentAngle = (seg.weight / totalWeight) * 360;
          const midAngle = currentAngle + segmentAngle / 2;
          const labelAngle = currentAngle + segmentAngle / 2;

          const line = (
            <div
              key={`line-${index}`}
              className="absolute w-full h-px bg-white/40 origin-center"
              style={{
                transform: `rotate(${midAngle}deg)`,
                top: '50%',
              }}
            />
          );

          const label = (
            <div
              key={`label-${index}`}
              className="absolute w-full h-full flex items-start justify-center"
              style={{ transform: `rotate(${labelAngle}deg)` }}
            >
              <span
                className="inline-block -rotate-90 translate-y-8 font-bold text-white text-shadow-lg 
                           drop-shadow-md whitespace-nowrap origin-center"
                style={{
                  transform: `rotate(${-labelAngle}deg) translateY(-50%)`,
                  fontSize: seg.weight < 10 ? '0.75rem' : '0.875rem',
                }}
              >
                {seg.label}
              </span>
            </div>
          );

          currentAngle += segmentAngle;
          return (
            <React.Fragment key={index}>
              {line}
              {label}
            </React.Fragment>
          );
        })}

        {/* Círculo central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 
                        border-4 border-yellow-500 shadow-2xl z-20 
                        flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-yellow-400 shadow-inner" />
        </div>
      </div>
    </div>
  );
};

// === ESTILO ADICIONAL (adicione no seu CSS global ou tailwind) ===
/*
.shadow-inner-glow {
  box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.2), 0 0 30px rgba(0, 0, 0, 0.8);
}
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
*/

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

    const winningSegment = getWinningSegment();
    const winningIndex = segments.indexOf(winningSegment);

    // Calcular ângulo acumulado até o segmento vencedor
    let accumulatedAngle = -90;
    for (let i = 0; i < winningIndex; i++) {
      accumulatedAngle += (segments[i].weight / totalWeight) * 360;
    }

    const segmentAngle = (winningSegment.weight / totalWeight) * 360;
    const targetCenterAngle = accumulatedAngle + segmentAngle / 2;
    const targetRotation = -(targetCenterAngle);

    const randomSpins = Math.floor(Math.random() * 5) + 8;
    const finalRotation = (randomSpins * 360) + targetRotation;

    setRotation(finalRotation);

    setTimeout(() => {
      const winnings = bet * winningSegment.value;
      if (winnings > 0) {
        updateLiptBalance(winnings);
        toast({
          title: t('gameZone.wheelOfFortune.toast.win.title'),
          description: t('gameZone.wheelOfFortune.toast.win.description', {
            amount: winnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
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
    }, 15000);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <Wheel rotation={rotation} isSpinning={isSpinning} />

      <div className="w-full max-w-xs space-y-3">
        <Label htmlFor="bet-amount" className="text-lg font-semibold">
          {t('gameZone.wheelOfFortune.betAmount')}
        </Label>
        <Input
          id="bet-amount"
          type="number"
          placeholder="0.0"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={isSpinning}
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground">
          {t('stakingPool.walletBalance')}: {liptBalance.toLocaleString('pt-BR')} LIPT
        </p>
      </div>

      <Button
        className="w-full max-w-xs font-bold text-xl py-7 bg-gradient-to-r from-yellow-500 to-orange-600 
                   hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg 
                   disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? t('gameZone.wheelOfFortune.spinning') : t('gameZone.wheelOfFortune.spinButton')}
      </Button>

      {isSpinning && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {t('gameZone.wheelOfFortune.spinning')}
        </p>
      )}
    </div>
  );
}