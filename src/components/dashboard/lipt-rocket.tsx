'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';
import * as PIXI from 'pixi.js';

// --- FOGUETE COM FUMAÇA ---
const createRocket = (app: PIXI.Application) => {
  const container = new PIXI.Container() as PIXI.Container & { smoke: (PIXI.Graphics & { vx: number, vy: number, life: number })[], flame: PIXI.Graphics };
  container.x = app.screen.width / 2;
  container.y = app.screen.height - 80;
  container.pivot.set(0, -10);

  // Corpo
  const body = new PIXI.Graphics();
  body.roundRect(-12, -30, 24, 45, 5).fill(0x94a3b8);

  // Ponta
  const tip = new PIXI.Graphics();
  tip.moveTo(0, -45).lineTo(-12, -30).lineTo(12, -30).closePath().fill(0xef4444);

  // Asas
  const leftWing = new PIXI.Graphics();
  leftWing.moveTo(-12, 15).lineTo(-25, 25).lineTo(-12, 5).closePath().fill(0xdc2626);

  const rightWing = new PIXI.Graphics();
  rightWing.moveTo(12, 15).lineTo(25, 25).lineTo(12, 5).closePath().fill(0xdc2626);

  // Chama
  const flame = new PIXI.Graphics();
  flame.ellipse(0, 30, 10, 20).fill({ color: 0xf97316, alpha: 0.9 });
  flame.visible = false;
  container.flame = flame;

  // Fumaça
  container.smoke = [];

  container.addChild(leftWing, rightWing, body, tip, flame);
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

// --- EXPLOSÃO COM TICKER ---
const createExplosion = (app: PIXI.Application, x: number, y: number) => {
  for (let i = 0; i < 30; i++) {
    const p = new PIXI.Graphics() as PIXI.Graphics & { vx: number, vy: number };
    p.circle(0, 0, Math.random() * 4 + 1).fill(Math.random() > 0.4 ? 0xf97316 : 0xfef08a);
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = (Math.random() - 0.5) * 12;
    app.stage.addChild(p);

    const ticker = () => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        app.stage.removeChild(p);
        p.destroy();
        app.ticker.remove(ticker);
      }
    };
    app.ticker.add(ticker);
  }
};

// --- ESTRELAS TURBINADAS (3 CAMADAS) ---
const createStars = (app: PIXI.Application) => {
  const stars: (PIXI.Graphics & { speed: number; layer: number; twinkle: number; size: number })[] = [];
  
  for (let layer = 0; layer < 3; layer++) { // 3 camadas de profundidade
    const layerCount = layer === 0 ? 40 : layer === 1 ? 60 : 80; // Mais estrelas nas camadas rápidas
    const baseSpeed = layer === 0 ? 0.8 : layer === 1 ? 3 : 8; // Camada lenta/rápida
    
    for (let i = 0; i < layerCount; i++) {
      const star = new PIXI.Graphics() as PIXI.Graphics & { speed: number; layer: number; twinkle: number; size: number };
      
      // Tamanho variável por camada
      const size = (layer === 0 ? Math.random() * 1.5 + 0.8 : Math.random() * 2 + 1.2);
      star.size = size;
      
      // GRADIENTE AMARELO-DOURADO (não branco!)
      const colors = [0xfef08a, 0xfcd34d, 0xfbb41c, 0xf97316];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      star.circle(0, 0, size).fill(color);
      star.alpha = layer === 0 ? 0.9 : 0.7; // Camada lenta mais brilhante
      
      star.x = Math.random() * app.screen.width;
      star.y = Math.random() * app.screen.height;
      star.speed = baseSpeed + Math.random() * (layer === 2 ? 5 : 2); // Velocidade variável
      star.layer = layer;
      star.twinkle = Math.random() * Math.PI * 2; // Pro efeito piscar
      
      stars.push(star);
      app.stage.addChildAt(star, 0);
    }
  }
  
  return stars;
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

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const rocketRef = useRef<PIXI.Container & { smoke: (PIXI.Graphics & { vx: number, vy: number, life: number })[], flame: PIXI.Graphics } | null>(null);
  const starsRef = useRef<(PIXI.Graphics & { speed: number; layer: number; twinkle: number; size: number })[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const crashPointRef = useRef(1.0);
  const audioRef = useRef<{ launch?: HTMLAudioElement; crash?: HTMLAudioElement; smokePlayed?: boolean }>({});

  // --- INICIALIZA PIXI ---
  useEffect(() => {
    const setupPixi = async () => {
      if (canvasContainerRef.current && !appRef.current) {
        const app = new PIXI.Application();
        await app.init({
          width: canvasContainerRef.current.clientWidth,
          height: 320,
          backgroundColor: 0x0f172a,
          backgroundAlpha: 1,
          antialias: true,
          resizeTo: canvasContainerRef.current,
        });

        if (canvasContainerRef.current && !canvasContainerRef.current.querySelector('canvas')) {
          canvasContainerRef.current.appendChild(app.canvas);
        }

        appRef.current = app;
        starsRef.current = createStars(app);
        rocketRef.current = createRocket(app);

        // Sons
        audioRef.current.launch = new Audio('/sounds/rocket-launch.mp3');
        audioRef.current.crash = new Audio('/sounds/explosion.mp3');
      }
    };

    setupPixi();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: false });
        appRef.current = null;
      }
    };
  }, []);

  // --- INICIA JOGO ---
  const startGame = useCallback(() => {
    if (!appRef.current || !rocketRef.current) return;

    const app = appRef.current;
    const rocket = rocketRef.current;

    setGameStatus('in_progress');
    setCashedOutMultiplier(null);

    rocket.x = app.screen.width / 2;
    rocket.y = app.screen.height - 80;
    rocket.alpha = 1;
    rocket.flame.visible = true; // LIGA A CHAMA AQUI

    // Limpa fumaça
    rocket.smoke.forEach(p => {
      app.stage.removeChild(p);
      p.destroy();
    });
    rocket.smoke = [];

    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    let current = 1.01; // COMEÇA COM 1.01x

    const animate = () => {
      current += 0.001 + 0.0008 * current;
      setMultiplier(current);

      const progress = Math.min(0.95, (current - 1) / (crashPoint - 1));
      rocket.y = app.screen.height - 80 - progress * (app.screen.height - 100);
      rocket.flame.scale.y = 1 + progress * 2.5;

      // FUMAÇA
      const smoke = rocket.smoke;
      const emitRate = current > 1.1 ? Math.min(3, Math.floor((current - 1) * 6)) : 0;

      for (let i = 0; i < emitRate; i++) {
        if (smoke.length > 60) {
          const old = smoke.shift()!;
          app.stage.removeChild(old);
          old.destroy();
        }

        const p = new PIXI.Graphics() as PIXI.Graphics & { vx: number, vy: number, life: number };
        p.circle(0, 0, Math.random() * 3 + 2).fill({ color: 0xdddddd, alpha: 0.8 });
        p.x = rocket.x + (Math.random() - 0.5) * 18;
        p.y = rocket.y + 30;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = 1.5 + Math.random();
        p.life = 60;
        app.stage.addChild(p);
        smoke.push(p);
      }

      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= 0.02;
        p.scale.set(p.alpha);
        if (p.alpha <= 0 || p.life-- <= 0) {
          app.stage.removeChild(p);
          p.destroy();
          smoke.splice(i, 1);
        }
      }
      
      // ANIMAÇÃO DAS ESTRELAS TURBINADAS
      const starSpeedMultiplier = 1 + progress * 20; // 20x mais rápido no final!
        starsRef.current!.forEach(star => {
        // Velocidade por camada + multiplicador
        star.y += star.speed * starSpeedMultiplier;
        
        // TWINKLE EFFECT (piscar)
        star.twinkle += 0.15;
        star.alpha = 0.4 + (Math.sin(star.twinkle) * 0.4);
        
        // Reposiciona quando sai da tela
        if (star.y > app.screen.height) {
            star.y = -star.size * 2;
            star.x = Math.random() * app.screen.width;
        }
    });


      if (current < crashPoint) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // CRASH
        setMultiplier(crashPoint);
        setGameStatus('crashed');
        setCrashHistory(prev => [crashPoint, ...prev].slice(0, 10));
        rocket.alpha = 0;
        rocket.flame.visible = false;
        createExplosion(app, rocket.x, rocket.y);
      }
    };

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [toast]);
  

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(startGame, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, startGame]);

  // --- HANDLERS ---
  const handleBet = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || bet > liptBalance) {
      toast({ variant: 'destructive', title: 'Aposta inválida' });
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
    if (gameStatus !== 'in_progress' || !animationFrameId.current) return;
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = null;

    const winnings = parseFloat(betAmount) * multiplier;
    updateLiptBalance(winnings);
    setCashedOutMultiplier(multiplier);
    setGameStatus('cashed_out');

    if (rocketRef.current) rocketRef.current.flame.visible = false;

    toast({
      title: t('gameZone.rocket.toast.cashedOut.title'),
      description: t('gameZone.rocket.toast.cashedOut.description', {
        amount: winnings.toFixed(2),
        multiplier: multiplier.toFixed(2)
      })
    });
  };

  const handleReset = () => {
    if (rocketRef.current && appRef.current) {
        // Limpa fumaça restante
        rocketRef.current.smoke.forEach(p => {
            if (p && !p.destroyed) {
              appRef.current!.stage.removeChild(p);
              p.destroy();
            }
        });
        rocketRef.current.smoke = [];

        // Reseta posição e estado do foguete
        rocketRef.current.alpha = 1;
        rocketRef.current.y = appRef.current.screen.height - 80;
        rocketRef.current.flame.visible = false;
    }
    setMultiplier(1.0);
    setGameStatus('idle');
    setCashedOutMultiplier(null);
    setBetAmount('');
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
    <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-background/50 border">
      {/* HISTÓRICO */}
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

      {/* CANVAS */}
      <div ref={canvasContainerRef} className="w-full h-72 md:h-80 rounded-lg overflow-hidden relative border-b-2 border-primary/20">
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

      {/* INPUT */}
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

      {/* BOTÃO */}
      <div className="w-full max-w-xs">
        {getButton()}
      </div>
    </div>
  );
}
