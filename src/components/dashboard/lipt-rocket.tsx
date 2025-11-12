'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as PIXI from 'pixi.js';
import useSWR, { useSWRConfig } from 'swr';
import { getWalletData, placeRocketBet, cashOutRocket } from '@/services/mock-api';
import { Skeleton } from '../ui/skeleton';

type Star = PIXI.Graphics & { speed: number; layer: number; twinkle: number; size: number };
type SmokeParticle = PIXI.Graphics & { vx: number; vy: number; life: number };
type Rocket = PIXI.Container & { smoke: SmokeParticle[]; flame: PIXI.Graphics };
type ExplosionParticle = PIXI.Graphics & { vx: number, vy: number };


// --- ESTRELAS TURBINADAS (3 CAMADAS) ---
const createStars = (app: PIXI.Application): Star[] => {
    const stars: Star[] = [];
    for (let layer = 0; layer < 3; layer++) {
        const layerCount = layer === 0 ? 40 : layer === 1 ? 60 : 80;
        const baseSpeed = layer === 0 ? 0.8 : layer === 1 ? 3 : 8;
        for (let i = 0; i < layerCount; i++) {
            const star = new PIXI.Graphics() as Star;
            const size = (layer === 0 ? Math.random() * 1.5 + 0.8 : Math.random() * 2 + 1.2);
            star.size = size;
            const colors = [0xfef08a, 0xfcd34d, 0xfbb41c, 0xf97316];
            const color = colors[Math.floor(Math.random() * colors.length)];
            star.circle(0, 0, size).fill(color);
            star.alpha = layer === 0 ? 0.9 : 0.7;
            star.x = Math.random() * app.screen.width;
            star.y = Math.random() * app.screen.height;
            star.speed = baseSpeed + Math.random() * (layer === 2 ? 5 : 2);
            star.layer = layer;
            star.twinkle = Math.random() * Math.PI * 2;
            stars.push(star);
            app.stage.addChildAt(star, 0); // Adiciona no fundo
        }
    }
    return stars;
};

// --- FOGUETE COM FUMAÇA E JANELA ---
const createRocket = (app: PIXI.Application): Rocket => {
  const container = new PIXI.Container() as Rocket;
  container.x = app.screen.width / 2;
  container.y = app.screen.height - 80;
  container.pivot.set(0, -10);

  const body = new PIXI.Graphics().roundRect(-12, -30, 24, 45, 5).fill(0xe2e8f0); // Corpo branco
  const tip = new PIXI.Graphics().moveTo(0, -45).lineTo(-12, -30).lineTo(12, -30).closePath().fill(0xef4444); // Bico vermelho
  const leftWing = new PIXI.Graphics().moveTo(-12, 15).lineTo(-25, 25).lineTo(-12, 5).closePath().fill(0xdc2626);
  const rightWing = new PIXI.Graphics().moveTo(12, 15).lineTo(25, 25).lineTo(12, 5).closePath().fill(0xdc2626);
  
  // Janela
  const windowFrame = new PIXI.Graphics().circle(0, -15, 8).fill(0x94a3b8);
  const windowGlass = new PIXI.Graphics().circle(0, -15, 6).fill(0x38bdf8);
  
  const flame = new PIXI.Graphics().ellipse(0, 30, 10, 20).fill({ color: 0xf97316, alpha: 0.9 });
  flame.visible = false;
  container.flame = flame;

  container.smoke = [];

  container.addChild(leftWing, rightWing, body, tip, windowFrame, windowGlass, flame);
  app.stage.addChild(container);
  return container;
};

// --- CRASH POINT ---
const generateCrashPoint = (): number => {
  try {
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    const r = h / e;
    return Math.max(1.01, Math.floor(100 / (1 - r)) / 100);
  } catch {
    return Math.max(1.01, 1 + Math.random() * 10);
  }
};

// --- EXPLOSÃO ---
const createExplosion = (app: PIXI.Application, x: number, y: number) => {
  const particles: ExplosionParticle[] = [];
  for (let i = 0; i < 30; i++) {
    const p = new PIXI.Graphics() as ExplosionParticle;
    p.circle(0, 0, Math.random() * 4 + 1).fill(Math.random() > 0.4 ? 0xf97316 : 0xfef08a);
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = (Math.random() - 0.5) * 12;
    app.stage.addChild(p);
    particles.push(p);
  }

  const explosionTicker = (delta: PIXI.Ticker) => {
    particles.forEach(p => {
      p.x += p.vx * delta.deltaTime;
      p.y += p.vy * delta.deltaTime;
      p.alpha -= 0.03 * delta.deltaTime;
      if (p.alpha <= 0) {
        p.destroy();
      }
    });
    if (particles.every(p => p.destroyed)) {
      app.ticker.remove(explosionTicker);
    }
  };
  app.ticker.add(explosionTicker);
};

export function LiptRocket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const { data: wallet, isLoading: isLoadingWallet } = useSWR('wallet', getWalletData);

  const [betAmount, setBetAmount] = useState('');
  const [displayMultiplier, setDisplayMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'crashed' | 'cashed_out'>('idle');
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const rocketRef = useRef<Rocket | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const crashPointRef = useRef(1.0);
  const multiplierRef = useRef(1.0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- INICIALIZA PIXI ---
  useEffect(() => {
    if (!isClient) return;

    let app: PIXI.Application;

    const setup = async () => {
        if (!canvasContainerRef.current) return;

        app = new PIXI.Application();
        await app.init({
          width: canvasContainerRef.current.clientWidth,
          height: 320,
          backgroundColor: 0x0f172a,
          antialias: true,
          resizeTo: canvasContainerRef.current,
        });

        if (canvasContainerRef.current) {
            canvasContainerRef.current.innerHTML = ''; // Limpa antes de adicionar
            canvasContainerRef.current.appendChild(app.canvas);
        }

        appRef.current = app;
        starsRef.current = createStars(app);
        rocketRef.current = createRocket(app);
    };

    setup();

    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (appRef.current) {
            appRef.current.destroy(true, { children: true, texture: true, context: true });
            appRef.current = null;
        }
    };
  }, [isClient]);

  const startGame = useCallback(() => {
    const app = appRef.current;
    const rocket = rocketRef.current;
    if (!app || !rocket) return;

    setGameStatus('in_progress');
    setCashedOutMultiplier(null);
    multiplierRef.current = 1.01;
    setIsLoadingAction(false); // Enable cash out button

    rocket.x = app.screen.width / 2;
    rocket.y = app.screen.height - 80;
    rocket.alpha = 1;
    rocket.flame.visible = true;

    const animate = () => {
        const currentMultiplier = multiplierRef.current;

        if (currentMultiplier >= crashPointRef.current) {
          setGameStatus('crashed');
          setCrashHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
          if (rocketRef.current) {
            rocketRef.current.alpha = 0;
            rocketRef.current.flame.visible = false;
          }
          createExplosion(app, rocket.x, rocket.y);
          setIsLoadingAction(false);
          return;
        } 
        
        multiplierRef.current += 0.001 + 0.0008 * currentMultiplier;
        setDisplayMultiplier(multiplierRef.current);
        
        // Limitar a subida vertical do foguete
        const maxRocketY = app.screen.height * 0.3; // Sobe até 70% da altura da tela
        const verticalProgress = Math.min(1, (currentMultiplier - 1) / 3); // A subida é mais rápida no início
        const targetY = app.screen.height - 80 - (verticalProgress * (app.screen.height - 80 - maxRocketY));
        
        rocket.y = targetY;
        rocket.flame.scale.y = 1 + verticalProgress * 2.5;

        // FUMAÇA
        const smoke = rocket.smoke;
        const emitRate = currentMultiplier > 1.1 ? Math.min(3, Math.floor((currentMultiplier - 1) * 6)) : 0;
        for (let i = 0; i < emitRate; i++) {
            if (smoke.length > 60) {
                const old = smoke.shift()!;
                if (old && !old.destroyed) old.destroy();
            }
            const p = new PIXI.Graphics() as SmokeParticle;
            p.circle(0, 0, Math.random() * 3 + 2).fill({ color: 0xdddddd, alpha: 0.8 });
            p.x = rocket.x + (Math.random() - 0.5) * 18;
            p.y = rocket.y + 30;
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = 1.5 + Math.random();
            app.stage.addChild(p);
            smoke.push(p);
        }
        for (let i = smoke.length - 1; i >= 0; i--) {
            const p = smoke[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.alpha -= 0.02;
            if (p.alpha > 0) p.scale.set(p.alpha);
            if (p.alpha <= 0) {
                p.destroy();
                smoke.splice(i, 1);
            }
        }

        // ESTRELAS
        const starSpeedMultiplier = 1 + verticalProgress * 30;
        starsRef.current.forEach(star => {
            star.y += star.speed * starSpeedMultiplier;
            star.twinkle += 0.15;
            star.alpha = 0.4 + (Math.sin(star.twinkle) * 0.4);
            if (star.y > app.screen.height + star.size) {
            star.y = -star.size * 2;
            star.x = Math.random() * app.screen.width;
            }
        });
        
        animationFrameId.current = requestAnimationFrame(animate);
    };

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(startGame, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, startGame]);

  const handleBet = async () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || !wallet || bet > wallet.liptBalance) {
      toast({ variant: 'destructive', title: 'Aposta inválida' });
      return;
    }
    
    setIsLoadingAction(true);
    crashPointRef.current = generateCrashPoint();
    
    try {
        await placeRocketBet(bet);
        mutate('wallet');
        setGameStatus('waiting');
        toast({ title: t('gameZone.rocket.toast.betPlaced.title'), description: t('gameZone.rocket.toast.betPlaced.description', { amount: bet }) });
    } catch (e: any) {
        toast({ variant: 'destructive', title: e.message });
        setIsLoadingAction(false);
    }
  };

  const handleCashOut = async () => {
    if (gameStatus !== 'in_progress' || !animationFrameId.current) return;
    
    setIsLoadingAction(true);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = null;
    
    const finalMultiplier = multiplierRef.current;

    try {
        const { winnings } = await cashOutRocket(parseFloat(betAmount), finalMultiplier);
        mutate('wallet');
        setCashedOutMultiplier(finalMultiplier);
        setGameStatus('cashed_out');
        if (rocketRef.current) rocketRef.current.flame.visible = false;
        toast({ title: t('gameZone.rocket.toast.cashedOut.title'), description: t('gameZone.rocket.toast.cashedOut.description', { amount: winnings.toFixed(2), multiplier: finalMultiplier.toFixed(2) }) });
    } catch (e: any) {
        toast({ variant: 'destructive', title: e.message });
        // Resume animation if cash out fails by calling start game again
        if (gameStatus === 'in_progress') {
           animationFrameId.current = requestAnimationFrame(startGame);
        }
    } finally {
        setIsLoadingAction(false);
    }
  };

  const handleReset = () => {
    const rocket = rocketRef.current;
    if (rocket) {
        rocket.smoke.forEach(p => {
            if (p && !p.destroyed) {
              p.destroy();
            }
        });
        rocket.smoke = [];
        rocket.alpha = 1;
        rocket.y = appRef.current!.screen.height - 80;
        rocket.flame.visible = false;
    }
    setDisplayMultiplier(1.0);
    setGameStatus('idle');
    setCashedOutMultiplier(null);
    setBetAmount('');
    setIsLoadingAction(false);
  };

  const getButton = () => {
    switch (gameStatus) {
      case 'idle':
        return <Button onClick={handleBet} disabled={isLoadingAction} className="w-full py-6 text-lg">{isLoadingAction ? "Placing Bet..." : t('gameZone.rocket.placeBet')}</Button>;
      case 'waiting':
        return <Button disabled className="w-full py-6 text-lg">{t('gameZone.rocket.waitingForNextRound')}</Button>;
      case 'in_progress':
        return (
          <Button onClick={handleCashOut} disabled={isLoadingAction} className="w-full py-6 text-lg bg-green-500 hover:bg-green-600">
            {isLoadingAction ? 'Cashing out...' : `${t('gameZone.rocket.cashOut')} @ ${displayMultiplier.toFixed(2)}x`}
          </Button>
        );
      case 'cashed_out':
      case 'crashed':
        return <Button onClick={handleReset} className="w-full py-6 text-lg">{t('gameZone.rocket.playAgain')}</Button>;
      default:
        return null;
    }
  };
  
    if (!isClient || isLoadingWallet || !wallet) {
      return (
        <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-background/50 border">
            <div className="flex gap-1 flex-wrap justify-center h-6"></div>
             <div className="w-full text-center">
                <Skeleton className="h-12 w-48 mx-auto" />
            </div>
            <Skeleton className="w-full h-72 md:h-80 rounded-lg" />
            <div className="w-full max-w-xs space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <div className="w-full max-w-xs">
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-background/50 border">
      {crashHistory.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center">
          {crashHistory.map((m, i) => (
            <span key={i} className={cn("px-2 py-1 text-xs font-bold rounded", m < 2 ? "bg-red-900 text-red-300" : m < 5 ? "bg-yellow-900 text-yellow-300" : "bg-green-900 text-green-300")}>
              {m.toFixed(2)}x
            </span>
          ))}
        </div>
      )}

      <div className="w-full text-center">
          {gameStatus === 'crashed' || gameStatus === 'cashed_out' ? (
            <div className='flex flex-col items-center'>
              <span className={cn("text-4xl md:text-5xl font-bold drop-shadow-lg", gameStatus === 'crashed' ? "text-red-500" : "text-green-500")}>
                {(cashedOutMultiplier ?? crashPointRef.current).toFixed(2)}x
              </span>
              <span className="text-lg md:text-xl text-foreground/80 font-semibold mt-1">
                {gameStatus === 'crashed' ? t('gameZone.rocket.crashed') : t('gameZone.rocket.youCashedOut')}
              </span>
            </div>
          ) : (
            <h2 className={cn(
                "text-4xl md:text-5xl font-bold drop-shadow-lg transition-colors",
                displayMultiplier < 2 ? 'text-foreground' : displayMultiplier < 5 ? 'text-yellow-400' : 'text-green-400'
            )}>
              {gameStatus === 'waiting' ? '...' : `${displayMultiplier.toFixed(2)}x`}
            </h2>
          )}
        </div>


      <div ref={canvasContainerRef} className="w-full h-72 md:h-80 rounded-lg overflow-hidden relative border-b-2 border-primary/20" />

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
          {t('stakingPool.walletBalance')}: {wallet.liptBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} LIPT
        </p>
      </div>

      <div className="w-full max-w-xs">
        {getButton()}
      </div>
    </div>
  );
}
