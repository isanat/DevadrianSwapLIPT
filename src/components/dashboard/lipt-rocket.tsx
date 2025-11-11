'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';
import * as PIXI from 'pixi.js';

// --- PIXI.js Helper Functions ---

const createRocket = (app: PIXI.Application) => {
  const container = new PIXI.Container() as PIXI.Container & { smoke?: PIXI.Graphics[], flame?: PIXI.Graphics };
  container.x = app.screen.width / 2;
  container.y = app.screen.height - 80;
  container.pivot.set(0, -10);

  // Corpo
  const body = new PIXI.Graphics();
  body.beginFill(0x94a3b8); // slate-400
  body.drawRoundedRect(-12, -30, 24, 45, 5);
  body.endFill();

  // Ponta
  const tip = new PIXI.Graphics();
  tip.beginFill(0xef4444); // red-500
  tip.moveTo(0, -45);
  tip.lineTo(-12, -30);
  tip.lineTo(12, -30);
  tip.lineTo(0, -45);
  tip.endFill();
  
  // Asas
  const leftWing = new PIXI.Graphics();
  leftWing.beginFill(0xdc2626); // red-700
  leftWing.moveTo(-12, 15);
  leftWing.lineTo(-25, 25);
  leftWing.lineTo(-12, 5);
  leftWing.endFill();

  const rightWing = new PIXI.Graphics();
  rightWing.beginFill(0xdc2626); // red-700
  rightWing.moveTo(12, 15);
  rightWing.lineTo(25, 25);
  rightWing.lineTo(12, 5);
  rightWing.endFill();

  // Chama
  const flame = new PIXI.Graphics();
  flame.beginFill(0xf97316, 0.9); // orange-500
  flame.drawEllipse(0, 30, 10, 20);
  flame.endFill();
  flame.visible = false;
  container.flame = flame;

  // Fumaça (container de partículas)
  container.smoke = [];

  container.addChild(leftWing, rightWing, body, tip, flame);
  app.stage.addChild(container);
  return container;
};

const generateCrashPoint = (): number => {
  try {
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    const r = h / e;
    const crashPoint = Math.floor(100 / (1 - r)) / 100;
    return Math.max(1.01, crashPoint);
  } catch {
    return Math.max(1.01, 1 + Math.random() * 10);
  }
};


export function LiptRocket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, updateLiptBalance } = useDashboard();

  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'crashed' | 'cashed_out'>('idle');
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application>();
  const rocketRef = useRef<PIXI.Container & { smoke?: PIXI.Graphics[], flame?: PIXI.Graphics }>();
  const animationFrameId = useRef<number>();
  const crashPointRef = useRef(1.0);
  const audioRef = useRef<{ launch?: HTMLAudioElement; crash?: HTMLAudioElement; smokePlayed?: boolean }>({});

  useEffect(() => {
    // --- Setup Pixi ---
    const setupPixi = async () => {
      if (canvasRef.current && !appRef.current) {
        const app = new PIXI.Application();
        
        await app.init({
            width: canvasRef.current.clientWidth,
            height: 320,
            backgroundColor: 0x000000,
            backgroundAlpha: 0,
            antialias: true,
            resizeTo: canvasRef.current,
        });

        if (canvasRef.current && !canvasRef.current.querySelector('canvas')) {
            canvasRef.current.appendChild(app.view as HTMLCanvasElement);
        }

        appRef.current = app;
        rocketRef.current = createRocket(app);

        // Load sounds
        audioRef.current.launch = new Audio('/sounds/rocket-launch.mp3');
        audioRef.current.crash = new Audio('/sounds/explosion.mp3');
      }
    };
    
    setupPixi();

    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };
  }, [canvasRef.current]);

 const startGame = useCallback(() => {
    if (!appRef.current || !rocketRef.current) return;
    
    setGameStatus('in_progress');
    setCashedOutMultiplier(null);

    const app = appRef.current;
    const rocket = rocketRef.current;
    
    // Reset visual elements
    rocket.rotation = 0;
    rocket.x = app.screen.width / 2;
    rocket.y = app.screen.height - 80;
    rocket.alpha = 1;
    if (rocket.flame) rocket.flame.visible = false;
    
    // Clear old smoke
    if (rocket.smoke) {
      rocket.smoke.forEach(p => {
        app.stage.removeChild(p);
        p.destroy();
      });
      rocket.smoke = [];
    }

    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    let current = 1.00;

    audioRef.current.launch?.play().catch(()=>{});
    audioRef.current.smokePlayed = false;

    const animate = () => {
        const baseGrowth = 0.001; 
        const acceleration = 0.0008 * current;
        current += baseGrowth + acceleration;

        setMultiplier(current);

        if (rocket && app) {
            const progress = Math.min(0.9, (current - 1) / (crashPoint - 1));
            const targetY = app.screen.height - 80 - progress * (app.screen.height - 100);
            rocket.y = targetY; // Smooth Y movement
            
            if (rocket.flame) {
              rocket.flame.scale.y = 1 + progress * 2.5;
              rocket.flame.scale.x = 1 + progress * 0.5;
              rocket.flame.visible = true;
            }

            if(current > 1.5 && !audioRef.current.smokePlayed){
                new Audio('/sounds/smoke-whoosh.mp3').play().catch(()=>{});
                audioRef.current.smokePlayed = true;
            }

            // --- FUMAÇA DINÂMICA ---
            const smoke = rocket.smoke!;
            const emitRate = current > 1.1 ? Math.min(3, Math.floor((current - 1) * 6)) : 0;

            for (let i = 0; i < emitRate; i++) {
                if (smoke.length > 60) {
                    const old = smoke.shift()!;
                    app.stage.removeChild(old);
                    old.destroy();
                }

                const p = new PIXI.Graphics() as PIXI.Graphics & { vx: number, vy: number, life: number };
                const size = Math.random() * 3 + 2;
                p.beginFill(0xdddddd, 0.7 + Math.random() * 0.2);
                p.drawCircle(0, 0, size);
                p.endFill();

                p.x = rocket.x + (Math.random() - 0.5) * 18;
                p.y = rocket.y + 25 + Math.random() * 8;
                p.vx = (Math.random() - 0.5) * 3 - 1.5;
                p.vy = 1.5 + Math.random() * 2;
                p.life = 50 + Math.random() * 50;
                p.alpha = 0.9;

                app.stage.addChild(p);
                smoke.push(p);
            }

            smoke.forEach((p, i) => {
                const particle = p as PIXI.Graphics & { vx: number, vy: number, life: number };
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.06;
                particle.alpha -= 0.018;
                if (p.scale) {
                  p.scale.set(particle.alpha * 1.3);
                }
                if (particle.alpha <= 0 || particle.life-- <= 0) {
                    app.stage.removeChild(p);
                    p.destroy();
                    smoke.splice(i, 1);
                }
            });
        }
        
        if (current < crashPoint) {
            animationFrameId.current = requestAnimationFrame(animate);
        } else {
            // --- CRASH ---
            setMultiplier(crashPoint);
            setGameStatus('crashed');
            setCrashHistory(prev => [crashPoint, ...prev].slice(0, 10));
            audioRef.current.crash?.play().catch(()=>{});

            // Explosion effect
            if(rocket) {
                rocket.alpha = 0; // Hide rocket
                if (rocket.flame) rocket.flame.visible = false;

                for (let i = 0; i < 30; i++) {
                    const explosion_p = new PIXI.Graphics() as PIXI.Graphics & { vx: number; vy: number };
                    explosion_p.beginFill(Math.random() > 0.4 ? 0xf97316 : 0xfef08a, 1);
                    explosion_p.drawCircle(0, 0, Math.random() * 4 + 1);
                    explosion_p.endFill();
                    explosion_p.x = rocket.x;
                    explosion_p.y = rocket.y;
                    explosion_p.vx = (Math.random() - 0.5) * (Math.random() * 12);
                    explosion_p.vy = (Math.random() - 0.5) * (Math.random() * 12);
                    app.stage.addChild(explosion_p);

                    const fadeAway = () => {
                        explosion_p.x += explosion_p.vx;
                        explosion_p.y += explosion_p.vy;
                        explosion_p.alpha -= 0.03;
                        if (explosion_p.alpha > 0) {
                            requestAnimationFrame(fadeAway);
                        } else {
                            app.stage.removeChild(explosion_p);
                            explosion_p.destroy();
                        }
                    };
                    fadeAway();
                }
            }

            toast({
                variant: "destructive",
                title: t('gameZone.rocket.toast.crashed.title'),
                description: t('gameZone.rocket.toast.crashed.description', { multiplier: crashPoint.toFixed(2) })
            });
        }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  }, [t, toast]);

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(startGame, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, startGame]);

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
    if (gameStatus !== 'in_progress') return;

    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }

    const bet = parseFloat(betAmount);
    const winnings = bet * multiplier;
    updateLiptBalance(winnings);
    setCashedOutMultiplier(multiplier);
    setGameStatus('cashed_out');

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
    setCashedOutMultiplier(null);
    setBetAmount('');
    if(rocketRef.current && appRef.current) {
        rocketRef.current.alpha = 1;
        rocketRef.current.y = appRef.current.screen.height - 80;
    }
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
       {crashHistory.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center">
          {crashHistory.map((m, i) => (
            <span
              key={i}
              className={cn(
                "px-2 py-1 text-xs font-bold rounded",
                m < 2 ? "bg-red-900 text-red-300" : m < 5 ? "bg-yellow-900 text-yellow-300" : "bg-green-900 text-green-300"
              )}
            >
              {m.toFixed(2)}x
            </span>
          ))}
        </div>
      )}

      <div ref={canvasRef} className="w-full h-72 md:h-80 bg-gradient-to-b from-gray-900 via-indigo-900/80 to-blue-900/50 rounded-lg overflow-hidden relative border-b-2 border-primary/20">
        {/* PIXI Canvas will be mounted here */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
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
