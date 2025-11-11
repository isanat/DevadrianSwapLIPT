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
  { value: 2, label: '2x', color: '#FFC107' },   // Gold
  { value: 0, label: '0x', color: '#F44336' },   // Red
  { value: 1.5, label: '1.5x', color: '#4CAF50' }, // Green
  { value: 0.5, label: '0.5x', color: '#FF9800' }, // Orange
  { value: 5, label: '5x', color: '#9C27B0' },   // Purple
  { value: 0, label: '0x', color: '#F44336' },   // Red
  { value: 1.5, label: '1.5x', color: '#4CAF50' }, // Green
  { value: 0.5, label: '0.5x', color: '#FF9800' }, // Orange
];
const segmentCount = segments.length;
const segmentAngle = 360 / segmentCount;

const Wheel = ({ rotation }: { rotation: number }) => {
  return (
    <div className="relative w-64 h-64 mx-auto my-8">
      <div 
        className="absolute w-full h-full rounded-full border-4 border-primary/50 transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${index * segmentAngle}deg)` }}
          >
            <div
              className="absolute w-1/2 h-1/2"
              style={{
                clipPath: `polygon(100% 0, 0 50%, 100% 100%)`,
                transformOrigin: '0 50%',
                transform: `rotate(${segmentAngle / 2}deg) skewY(-${90 - segmentAngle}deg) `,
                backgroundColor: segment.color,
                opacity: 0.8
              }}
            />
            <span
              className="absolute w-1/2 h-1/2 flex items-center justify-center font-bold text-white text-lg"
              style={{
                transform: `translate(50%, -50%) rotate(${segmentAngle / 2}deg)`,
                top: '50%',
                left: '0',
              }}
            >
              {segment.label}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
        <div className="h-6 w-6 bg-accent rounded-b-full"/>
      </div>
       <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-card border-2 border-primary" />
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
    const stopAngle = winningSegmentIndex * segmentAngle;
    const finalRotation = rotation + (360 * randomSpins) - stopAngle + (segmentAngle / 2);

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
    }, 4500); // 4000ms for spin + 500ms buffer
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Wheel rotation={rotation} />

      <div className="w-full space-y-2">
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
        className="w-full font-bold text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        onClick={handleSpin} 
        disabled={isSpinning}
      >
        {isSpinning ? t('gameZone.wheelOfFortune.spinning') : t('gameZone.wheelOfFortune.spinButton')}
      </Button>
    </div>
  );
}
