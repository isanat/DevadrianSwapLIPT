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

// --- FOGUETE ---
const createRocket = (app: PIXI.Application) => {
  const container = new PIXI.Container() as PIXI.Container & { smoke: any[], flame: PIXI.Graphics };
  container.x = app.screen.width / 2;
  container.y = app.screen.height - 80;

  // Corpo
  const body = new PIXI.Graphics();
  body.beginFill(0x94a3b8);
  body.drawRoundedRect(-12, -30, 24, 45, 5);
  body.endFill();

  // Ponta
  const tip = new PIXI.Graphics();
  tip.beginFill(0xef4444);
  tip.moveTo(0, -45);
  tip.lineTo(-12, -30);
  tip.lineTo(12, -30);
  tip.lineTo(0, -45);
  tip.endFill();

  // Asas
  const leftWing = new PIXI.Graphics();
  leftWing.beginFill(0xdc2626);
  leftWing.moveTo(-12, 15);
  leftWing.lineTo(-25, 25);
  leftWing.lineTo(-12, 5);
  leftWing.endFill();

  const rightWing = new PIXI.Graphics();
  rightWing.beginFill(0xdc2626);
  rightWing.moveTo(12, 15);
  rightWing.lineTo(25, 25);
  rightWing.lineTo(12, 5);
  rightWing.endFill();

  // Chama
  const flame = new PIXI.Graphics();
  flame.beginFill(0xf97316, 0.9);
  flame.drawEllipse(0, 30, 10, 20);
  flame.endFill();
  flame.visible = false;
  container.flame = flame;

  container.smoke = [];

  container.addChild(leftWing, rightWing, body, tip, flame);
  app.stage.addChild(container);
  return container;
};

// --- EXPLOSÃO ---
const createExplosion = (app: PIXI.Application, x: number, y: number) => {
  for (let i = 0; i < 30; i++) {
    const p = new PIXI.Graphics();
    p.beginFill(Math.random() > 0.4 ? 0xf97316 : 0xfef08a);
    p.drawCircle(0, 0, Math.random() * 4 + 1);
    p.endFill();
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = (Math.random() - 0.5) * 12;
    p.alpha = 1;
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

export function LiptRocket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { liptBalance, updateLiptBalance } = useDashboard();

  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'crashed' | 'cashed_out'>('idle');
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [isPixiReady, setIsPixiReady] = useState(false); // NOVO

  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const rocketRef = useRef<PIXI.Container & { smoke: any[], flame: PIXI.Graphics } | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const crashPointRef = useRef(1.0);

  // --- INICIALIZA PIXI ---
  useEffect(() => {
    let app: PIXI.Application;

    const init = async () => {
      if (!canvasRef.current) return;

      app = new PIXI.Application();
      await app.init({
        width: canvasRef.current.clientWidth,
        height: 320,
        backgroundColor: 0x0f172a,
        antialias: true,
        resizeTo: canvasRef.current,
      });

      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;

      // CRIA FOGUETE
      rocketRef.current = createRocket(app);
      setIsPixiReady(true); // SÓ AGORA ESTÁ PRONTO
    };

    init();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, []);

  // --- START GAME (só roda se Pixi estiver pronto) ---
  const startGame = useCallback(() => {
    if (!isPixiReady || !appRef.current || !rocketRef.current) return;

    const app = appRef.current;
    const rocket = rocketRef.current;

    setGameStatus('in_progress');
    setCashedOutMultiplier(null);

    rocket.rotation = 0;
    rocket.x = app.screen.width / 2;
    rocket.y = app.screen.height - 80;
    rocket.alpha = 1;
    rocket.flame.visible = true;

    rocket.smoke.forEach((p: any) => {
      app.stage.removeChild(p);
      p.destroy();
    });
    rocket.smoke = [];

    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    let current = 1.0;

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
          const old = smoke.shift();
          app.stage.removeChild(old);
          old.destroy();
        }
        const p = new PIXI.Graphics();
        p.beginFill(0xdddddd, 0.8);
        p.drawCircle(0, 0, Math.random() * 3 + 2);
        p.endFill();
        p.x = rocket.x + (Math.random() - 0.5) * 18;
        p.y = rocket.y + 30;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = 1 + Math.random();
        p.life = 60;
        p.alpha = 0.9;
        app.stage.addChild(p);
        smoke.push(p);
      }
      smoke.forEach((p: any, i: number) => {
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
      });

      if (current < crashPoint) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
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
  }, [isPixiReady]);

  // --- WAITING ---
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
  };

  const handleCashOut = () => {
    if (gameStatus !== 'in_progress' || !animationFrameId.current) return;
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = null;

    const winnings = parseFloat(betAmount) * multiplier;
    updateLiptBalance(winnings);
    setCashedOutMultiplier(multiplier);
    setGameStatus('cashed_out');
  };

  const handleReset = () => {
    setMultiplier(1.0);
    setGameStatus('idle');
    setCashedOutMultiplier(null);
    setBetAmount('');
  };

  const getButton = () => {
    switch (gameStatus) {
      case 'idle':
        return <Button onClick={handleBet} className="w-full py-6 text-lg">Apostar</Button>;
      case 'waiting':
        return <Button disabled className="w-full py-6 text-lg">Aguarde...</Button>;
      case 'in_progress':
        return <Button onClick={handleCashOut} className="w-full py-6 text-lg bg-green-500">Retirar @ {multiplier.toFixed(2)}x</Button>;
      case 'cashed_out':
      case 'crashed':
        return <Button onClick={handleReset} className="w-full py-6 text-lg">Jogar Novamente</Button>;
    }
  };

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

      <div ref={canvasRef} className="w-full h-72 md:h-80 bg-gradient-to-b from-gray-900 via-indigo-900/80 to-blue-900/50 rounded-lg overflow-hidden relative border-b-2 border-primary/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {gameStatus === 'waiting' ? '...' : `${multiplier.toFixed(2)}x`}
          </h2>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Label>Aposta (LIPT)</Label>
        <Input type="number" placeholder="0.0" value={betAmount} onChange={e => setBetAmount(e.target.value)} disabled={gameStatus !== 'idle'} className="text-center" />
        <p className="text-xs text-center text-muted-foreground">Saldo: {liptBalance} LIPT</p>
      </div>

      <div className="w-full max-w-xs">{getButton()}</div>
    </div>
  );
}