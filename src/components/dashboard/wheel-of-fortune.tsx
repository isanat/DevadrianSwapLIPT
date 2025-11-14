'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import useSWR, { useSWRConfig } from 'swr';
import { getWalletData, spinWheel } from '@/services/mock-api';
import { getWheelSegments } from '@/services/web3-api';
import { useAccount } from 'wagmi';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';

// Segmentos padrão (fallback se o contrato não retornar)
const defaultSegments = [
    { value: 1.5, label: '1.5x', color: '#6366f1', weight: 8 },  // Indigo
    { value: 0,   label: '0x',   color: '#ef4444', weight: 25 }, // Red
    { value: 1,   label: '1x',   color: '#22c55e', weight: 10 }, // Green
    { value: 3,   label: '3x',   color: '#8b5cf6', weight: 2 },  // Purple
    { value: 0.5, label: '0.5x', color: '#f97316', weight: 20 }, // Orange
    { value: 2,   label: '2x',   color: '#3b82f6', weight: 5 },  // Blue
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 }, // Red
    { value: 1,   label: '1x',   color: '#16a34a', weight: 10 }, // Darker Green
];

// 🎨 Gera o gradiente conic proporcional
const getConicGradient = (segments: typeof defaultSegments) => {
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
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

// REMOVIDO: getWeightedRandomSegment - O contrato decide o resultado
// O frontend não deve calcular qual segmento ganha


const Wheel = ({ rotation, isSpinning, segments }: { rotation: number; isSpinning: boolean; segments: typeof defaultSegments }) => {
  const { t } = useI18n();
  const transitionStyle = isSpinning
    ? { transition: 'transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)' }
    : { transition: 'none' };

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

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
          style={{ background: getConicGradient(segments) }}
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


type WheelOfFortuneProps = {
  onSpinResult: (result: any) => void;
};


export function WheelOfFortune({ onSpinResult }: WheelOfFortuneProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { address: userAddress } = useAccount();
  const { data: wallet, isLoading: isLoadingWallet } = useSWR(userAddress ? ['wallet', userAddress] : null, () => getWalletData(userAddress!));
  const { data: segments, isLoading: isLoadingSegments } = useSWR('wheelSegments', getWheelSegments);
  
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Usar segmentos do contrato ou fallback
  const currentSegments = segments && segments.length > 0 ? segments : defaultSegments;

  const handleSpin = async () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || !wallet || bet > wallet.liptBalance) {
      toast({
        variant: 'destructive',
        title: t('gameZone.wheelOfFortune.toast.invalidBet.title'),
        description: t('gameZone.wheelOfFortune.toast.invalidBet.description'),
      });
      return;
    }

    setIsSpinning(true);
    mutate(['wallet', userAddress], { ...wallet, liptBalance: wallet.liptBalance - bet }, false);

    // Animação visual enquanto aguarda o contrato
    const randomSpins = Math.floor(Math.random() * 4) + 8;
    const randomAngle = Math.random() * 360;
    const finalRotation = (randomSpins * 360) + randomAngle;
    setRotation(finalRotation);

    try {
        // O contrato decide o resultado
        const result = await spinWheel(userAddress!, bet);
        setTimeout(() => {
            mutate(['wallet', userAddress]);
            onSpinResult({
                id: Date.now(),
                bet,
                multiplier: result.multiplier,
                winnings: result.winnings,
                net: result.winnings - bet,
            });

            if (result.winnings > 0) {
                toast({
                    title: t('gameZone.wheelOfFortune.toast.win.title'),
                    description: t('gameZone.wheelOfFortune.toast.win.description', {
                        amount: result.winnings.toLocaleString('en-US', { minimumFractionDigits: 2 }),
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
        }, 8000); 
    } catch(e: any) {
        toast({ 
            variant: 'destructive', 
            title: t('gameZone.wheelOfFortune.toast.spinFailed.title'), 
            description: e.message || t('gameZone.wheelOfFortune.toast.spinFailed.description')
        });
        mutate(['wallet', userAddress]);
        setIsSpinning(false);
    }
  };

  if (isLoadingSegments) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-72 h-72 md:w-80 md:h-80 rounded-full" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Wheel rotation={rotation} isSpinning={isSpinning} segments={currentSegments} />

      {isLoadingWallet ? (
        <div className="w-full max-w-xs space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32" />
        </div>
      ) : (
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
            {t('stakingPool.walletBalance')}: {wallet?.liptBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} LIPT
            </p>
        </div>
      )}


      <Button
        className="w-full max-w-xs font-bold text-lg py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={handleSpin}
        disabled={isSpinning || isLoadingWallet}
      >
        {isSpinning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSpinning
          ? t('gameZone.wheelOfFortune.spinning')
          : t('gameZone.wheelOfFortune.spinButton')}
      </Button>

    </div>
  );
}
