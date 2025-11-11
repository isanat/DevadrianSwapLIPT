'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';

// Segments configuration with better color and value distribution
const segments = [
    { value: 1,   label: '1x',   color: '#22c55e', weight: 15 }, // Green
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 }, // Red
    { value: 1.3, label: '1.3x', color: '#6366f1', weight: 10 }, // Indigo
    { value: 0.5, label: '0.5x', color: '#f97316', weight: 22 }, // Orange
    { value: 2,   label: '2x',   color: '#3b82f6', weight: 10  }, // Blue
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 }, // Red
    { value: 3,   label: '3x',   color: '#8b5cf6', weight: 3  }, // Purple
    { value: 1,   label: '1x',   color: '#22c55e', weight: 15 }, // Green
];


const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

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
    ? { transition: 'transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)' }
    : { transition: 'none' };

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto my-8 flex items-center justify-center">
      {/* Holographic Outer Ring */}
      <div className="absolute w-full h-full rounded-full bg-transparent border-4 border-cyan-400/50 shadow-[0_0_20px_theme(colors.cyan.400),inset_0_0_20px_theme(colors.cyan.500)] animate-pulse" />
      
      {/* Tick marks on the outer ring */}
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

      {/* Pointer */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />

      {/* The Wheel itself */}
      <div
        className={cn('relative w-[90%] h-[90%] rounded-full flex items-center justify-center overflow-hidden shadow-2xl')}
        style={{ transform: `rotate(${rotation}deg)`, ...transitionStyle }}
      >
        {/* Wheel background with colors */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{ background: getConicGradient() }}
        />
        {/* Inner shadow for 3D effect */}
        <div className="absolute w-full h-full rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.5)]" />

        {/* Segment Labels */}
        {segments.map((seg, i) => {
          const cumulativeWeight = segments.slice(0, i).reduce((sum, s) => sum + s.weight, 0);
          const segmentStartAngle = (cumulativeWeight / totalWeight) * 360;
          const segmentAngle = (seg.weight / totalWeight) * 360;
          const textAngle = segmentStartAngle + (segmentAngle / 2);

          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 text-white text-xl font-bold drop-shadow-md"
              style={{
                transform: `rotate(${textAngle}deg) translate(0, -95px) rotate(-${textAngle}deg)`,
                transformOrigin: '0 0',
              }}
            >
              {seg.label}
            </span>
          );
        })}
         {/* Segment divider lines */}
        {segments.map((seg, i) => {
            const cumulativeWeight = segments.slice(0, i).reduce((sum, s) => sum + s.weight, 0);
            const angle = (cumulativeWeight / totalWeight) * 360;
            return (
                 <div
                    key={`line-${i}`}
                    className="absolute w-px h-full bg-black/30"
                    style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center center',
                    }}
                />
            );
        })}

        {/* Center Hub */}
        <div className="absolute w-20 h-20 rounded-full bg-gray-800 border-4 border-yellow-400 z-10 shadow-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]" />
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
    
    // Find the position of the winning segment
    let cumulativeWeight = 0;
    let winningSegmentIndex = -1;
    for(let i = 0; i < segments.length; i++) {
        if (segments[i] === winningSeg && Math.random() < 0.5) { // Randomly pick one of the same-value segments
            winningSegmentIndex = i;
            break;
        }
        if (i === segments.length - 1 && winningSegmentIndex === -1) {
            // fallback to first match if random pick fails
            winningSegmentIndex = segments.indexOf(winningSeg);
        }
    }
     if (winningSegmentIndex === -1) winningSegmentIndex = segments.indexOf(winningSeg);


    for(let i = 0; i < winningSegmentIndex; i++) {
        cumulativeWeight += segments[i].weight;
    }
    
    const segmentStartAngle = (cumulativeWeight / totalWeight) * 360;
    const segmentAngle = (winningSeg.weight / totalWeight) * 360;
    const randomAngleInSegment = Math.random() * segmentAngle;
    
    const targetAngle = segmentStartAngle + randomAngleInSegment;

    // The final rotation should point the pointer to the targetAngle
    const randomSpins = Math.floor(Math.random() * 4) + 8;
    const finalRotation = (randomSpins * 360) - targetAngle + (360 - 90); // Adjust to align with top pointer
    
    setRotation(prev => prev + finalRotation);

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
