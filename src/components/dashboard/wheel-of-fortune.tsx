'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';

// Cores e valores baseados na imagem de referência.
// Pesos ajustados para que a soma seja 100 e a vantagem seja da casa.
const segments = [
    { value: 1.5, label: '1.5x', color: '#6319f1', weight: 10 },  // Indigo
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 }, // Red
    { value: 1,   label: '1x',   color: '#22c55e', weight: 15 }, // Green
    { value: 3,   label: '3x',   color: '#8b5cf6', weight: 5 },  // Purple
    { value: 0.5, label: '0.5x', color: '#f97316', weight: 25 }, // Orange
    { value: 2,   label: '2x',   color: '#3b82f6', weight: 5 },  // Blue
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 }, // Red
];


const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

// 🎨 Gera o gradiente conic proporcional
const getConicGradient = () => {
  let gradient = 'conic-gradient(';
  let currentAngle = 0; 
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
  const { t } = useI18n();
  const transitionStyle = isSpinning
    ? { transition: 'transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)' }
    : { transition: 'none' };

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto my-8 flex items-center justify-center">
      {/* Anel externo holográfico */}
      <div className="absolute w-full h-full rounded-full bg-transparent border-4 border-cyan-400/50 shadow-[0_0_20px_theme(colors.cyan.400),inset_0_0_20px_theme(colors.cyan.500)]" />
      
      {/* Marcadores de divisão */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
          key={`tick-${i}`}
          className="absolute w-0.5 h-2 bg-cyan-200/50"
          style={{
            transform: `rotate(${i * 6}deg) translateY(-150px)`,
            transformOrigin: 'center'
          }}
        />
      ))}

      {/* Ponteiro */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />

      {/* A Roda */}
      <div
        className={cn('relative w-[90%] h-[90%] rounded-full flex items-center justify-center overflow-hidden shadow-2xl')}
        style={{ transform: `rotate(${rotation}deg)`, ...transitionStyle }}
      >
        {/* Fundo da roda com cores */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{ background: getConicGradient() }}
        />
        {/* Sombra interna para efeito 3D */}
        <div className="absolute w-full h-full rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.5)]" />

        {/* Labels dos Segmentos */}
        {segments.map((seg, i) => {
          const cumulativeWeight = segments.slice(0, i).reduce((sum, s) => sum + s.weight, 0);
          const segmentAngle = (seg.weight / totalWeight) * 360;
          const textAngle = (cumulativeWeight / totalWeight) * 360 + segmentAngle / 2 - 90;

          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 text-white text-base font-bold drop-shadow-md"
              style={{
                transform: `rotate(${textAngle}deg) translate(105px) rotate(90deg)`,
                transformOrigin: 'center center',
              }}
            >
              {seg.label}
            </span>
          );
        })}

        {/* Centro */}
        <div className="absolute w-20 h-20 rounded-full bg-gray-800 border-4 border-yellow-400 z-10 shadow-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)] flex items-center justify-center text-white font-bold">
              {t('gameZone.wheelOfFortune.spinButton').split(' ')[0].toUpperCase()}
            </div>
        </div>
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
    
    // Encontra a posição do segmento vencedor
    let cumulativeWeight = 0;
    let winningSegmentIndex = -1;
    
    // Encontra um índice aleatório para o segmento vencedor se houver duplicados
    const matchingIndices = segments.reduce((acc, segment, index) => {
        if (segment.label === winningSeg.label && segment.color === winningSeg.color) {
            acc.push(index);
        }
        return acc;
    }, [] as number[]);

    winningSegmentIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

    for(let i = 0; i < winningSegmentIndex; i++) {
        cumulativeWeight += segments[i].weight;
    }
    
    const segmentStartAngle = (cumulativeWeight / totalWeight) * 360;
    const segmentAngle = (winningSeg.weight / totalWeight) * 360;
    // Ponto aleatório dentro do segmento vencedor
    const randomAngleInSegment = Math.random() * segmentAngle;
    
    const targetAngle = segmentStartAngle + randomAngleInSegment;

    // A rotação final deve apontar o ponteiro para o targetAngle
    const randomSpins = Math.floor(Math.random() * 4) + 8; // 8 a 11 voltas
    const finalRotation = (randomSpins * 360) - targetAngle;
    
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
      // Mantém a posição visual final para a próxima rodada
      setRotation(finalRotation % 360);
    }, 8000); 
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
        className="w-full max-w-xs font-bold text-lg py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
