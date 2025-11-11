'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/context/dashboard-context';

const segments = [
  { value: 2, label: '2x', color: 'hsl(45 95% 55%)' },   // Gold
  { value: 0, label: '0x', color: 'hsl(4 90% 58%)' },   // Red
  { value: 1.5, label: '1.5x', color: 'hsl(122 80% 55%)' }, // Green
  { value: 0.5, label: '0.5x', color: 'hsl(36 95% 55%)' }, // Orange
  { value: 5, label: '5x', color: 'hsl(275 80% 60%)' },   // Purple
  { value: 0, label: '0x', color: 'hsl(4 90% 58%)' },   // Red
  { value: 1.5, label: '1.5x', color: 'hsl(122 80% 55%)' }, // Green
  { value: 0.5, label: '0.5x', color: 'hsl(36 95% 55%)' }, // Orange
];
const segmentCount = segments.length;
const segmentAngle = 360 / segmentCount;

const getConicGradient = () => {
    let gradient = 'conic-gradient(';
    let currentAngle = 0;
    for (let i = 0; i < segments.length; i++) {
        gradient += `${segments[i].color} ${currentAngle}deg ${currentAngle + segmentAngle}deg`;
        currentAngle += segmentAngle;
        if (i < segments.length - 1) {
            gradient += ', ';
        }
    }
    gradient += ')';
    return gradient;
};

const Wheel = ({ rotation }: { rotation: number }) => {
  return (
    <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto my-8">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-accent z-20" />
      
      <div 
        className="relative w-full h-full rounded-full transition-transform duration-[4000ms] ease-out flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div 
          className="absolute w-full h-full rounded-full border-4 border-primary/50"
          style={{ background: getConicGradient() }}
        />
        
        {segments.map((segment, index) => (
            <React.Fragment key={index}>
                {/* Segment lines */}
                <div 
                    className="absolute h-full w-px bg-black/30"
                    style={{ transform: `rotate(${index * segmentAngle}deg)`}}
                />
                {/* Segment labels */}
                <div
                    className="absolute h-full w-full flex items-center justify-start"
                    style={{transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`}}
                >
                    <span className="pl-4 font-bold text-white text-lg drop-shadow-md">
                        {segment.label}
                    </span>
                </div>
            </React.Fragment>
        ))}

        {/* Center circle */}
        <div className="absolute w-12 h-12 rounded-full bg-card border-4 border-primary z-10" />
      </div>
    </div>
  );
};


export function WheelOfFortune() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, purchaseLipt } = useDashboard(); // Assuming purchaseLipt can be used to deduct balance for now
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
    
    // Deduct bet amount immediately
    // In a real scenario, this would be a transaction
    purchaseLipt(-bet); // Using purchaseLipt to represent spending tokens

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full spins
    const winningSegmentIndex = Math.floor(Math.random() * segmentCount);
    // Calculate stop angle to center the pointer on the middle of the segment
    const stopAngle = winningSegmentIndex * segmentAngle + (segmentAngle / 2);

    // The rotation needs to land on the opposite side of the wheel, so we adjust
    const finalRotation = rotation + (360 * randomSpins) - stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const result = segments[winningSegmentIndex];
      const winnings = bet * result.value;

      if (winnings > 0) {
        // Add winnings
        purchaseLipt(winnings);
        toast({
          title: t('gameZone.wheelOfFortune.toast.win.title'),
          description: t('gameZone.wheelOfFortune.toast.win.description', { amount: winnings.toFixed(2) }),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('gameZone.wheelOfFortune.toast.lose.title'),
          description: t('gameZone.wheelOfFortune.toast.lose.description'),
        });
      }
      setBetAmount('');
    }, 4000); // Sync with animation duration
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Wheel rotation={rotation} />

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
        <p className="text-xs text-muted-foreground">{t('stakingPool.walletBalance')}: {liptBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} LIPT</p>
      </div>

      <Button 
        className="w-full max-w-xs font-bold text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        onClick={handleSpin} 
        disabled={isSpinning}
      >
        {isSpinning ? t('gameZone.wheelOfFortune.spinning') : t('gameZone.wheelOfFortune.spinButton')}
      </Button>
    </div>
  );
}
