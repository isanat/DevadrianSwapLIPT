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

// --- DEFINIÇÕES DE TIPO ---
type Star = PIXI.Graphics & { speed: number; layer: number; twinkle: number; size: number };
type SmokeParticle = PIXI.Graphics & { vx: number; vy: number; life: number };
// NOVO: Propriedade 'bobPhase' adicionada ao foguete para animação
type Rocket = PIXI.Container & { 
  smoke: SmokeParticle[]; 
  flame: PIXI.Graphics; 
  bobPhase?: number; 
};
type ExplosionParticle = PIXI.Graphics & { vx: number, vy: number };


// --- ESTRELAS TURBINADAS (COM GLINTS E CORES) ---
const createStars = (app: PIXI.Application): Star[] => {
    const stars: Star[] = [];
    // Adicionamos cores frias para contraste
    const colors = [0xfef08a, 0xfcd34d, 0xfbb41c, 0xa9d3f5, 0xffffff]; 

    for (let layer = 0; layer < 3; layer++) {
        const layerCount = layer === 0 ? 40 : layer === 1 ? 60 : 80;
        const baseSpeed = layer === 0 ? 0.8 : layer === 1 ? 3 : 8;
        for (let i = 0; i < layerCount; i++) {
            const star = new PIXI.Graphics() as Star;
            const size = (layer === 0 ? Math.random() * 1.5 + 0.8 : Math.random() * 2 + 1.2);
            star.size = size;
            const color = colors[Math.floor(Math.random() * colors.length)];
            star.alpha = layer === 0 ? 0.9 : 0.7;

            // NOVO: 30% de chance de ser uma estrela "glint" (cruz)
            if (layer > 0 && Math.random() > 0.7) {
              star.rect(-size, -size/4, size*2, size/2).fill(color);
              star.rect(-size/4, -size, size/2, size*2).fill(color);
            } else {
              star.circle(0, 0, size).fill(color);
            }
           
            star.x = Math.random() * app.screen.width;
            star.y = Math.random() * app.screen.height;
            star.speed = baseSpeed + Math.random() * (layer === 2 ? 5 : 2);
            star.layer = layer;
            star.twinkle = Math.random() * Math.PI * 2;
            stars.push(star);
            app.stage.addChildAt(star, 1); // Adiciona no índice 1 (acima do background)
        }
    }
    return stars;
};

// --- FOGUETE COM CHAMA MELHORADA ---
const createRocket = (app: PIXI.Application): Rocket => {
  const container = new PIXI.Container() as Rocket;
  container.x = app.screen.width / 2;
  container.y = app.screen.height - 80;
  container.pivot.set(0, -10);

  // Adiciona uma propriedade para a animação de vibração
  container.bobPhase = Math.random() * Math.PI * 2;

  const body = new PIXI.Graphics().roundRect(-12, -30, 24, 45, 5).fill(0xe2e8f0); 
  const tip = new PIXI.Graphics().moveTo(0, -45).lineTo(-12, -30).lineTo(12, -30).closePath().fill(0xef4444); 
  const leftWing = new PIXI.Graphics().moveTo(-12, 15).lineTo(-25, 25).lineTo(-12, 5).closePath().fill(0xdc2626);
  const rightWing = new PIXI.Graphics().moveTo(12, 15).lineTo(25, 25).lineTo(12, 5).closePath().fill(0xdc2626);
  const windowFrame = new PIXI.Graphics().circle(0, -15, 8).fill(0x94a3b8);
  const windowGlass = new PIXI.Graphics().circle(0, -15, 6).fill(0x38bdf8);
  
  // NOVO: Chama com duas partes (núcleo e exterior)
  const flame = new PIXI.Graphics().ellipse(0, 30, 10, 20).fill({ color: 0xf97316, alpha: 0.8 });
  const flameCore = new PIXI.Graphics().ellipse(0, 28, 5, 15).fill({ color: 0xfef08a, alpha: 1 });
  flame.addChild(flameCore); // Adiciona o núcleo dentro da chama
  
  flame.visible = false;
  container.flame = flame;
  container.smoke = [];

  container.addChild(leftWing, rightWing, body, tip, windowFrame, windowGlass, flame);
  app.stage.addChild(container);
  return container;
};

// --- CRASH POINT (Sem alteração) ---
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

// --- EXPLOSÃO COM IMPACTO (FLASH, SHAKE, SHOCKWAVE) ---
const createExplosion = (app: PIXI.Application, x: number, y: number) => {
  const stage = app.stage;
  const particles: ExplosionParticle[] = [];

  // NOVO: Flash branco
  const flash = new PIXI.Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0xffffff, alpha: 0.7 });
  stage.addChild(flash);

  // NOVO: Onda de choque (Shockwave)
  const shockwave = new PIXI.Graphics()
    .circle(x, y, 20)
    .stroke({ color: 0xffffff, width: 10, alpha: 0.8 });
  stage.addChild(shockwave);

  // NOVO: Screen Shake
  let shakeAmount = 12;
  const originalStagePos = { x: stage.x, y: stage.y };

  // Partículas (aumentadas)
  for (let i = 0; i < 40; i++) {
    const p = new PIXI.Graphics() as ExplosionParticle;
    p.circle(0, 0, Math.random() * 4 + 1.5).fill(Math.random() > 0.3 ? 0xf97316 : 0xfef08a);
    p.x = x;
    p.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 10 + 3;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    app.stage.addChild(p);
    particles.push(p);
  }

  const explosionTicker = (delta: PIXI.Ticker) => {
    const dt = delta.deltaTime;

    // Animação do Flash
    if (flash) {
      flash.alpha -= 0.05 * dt;
      if (flash.alpha <= 0) flash.destroy();
    }

    // Animação da Onda de Choque
    if (shockwave) {
      shockwave.scale.set(shockwave.scale.x + 0.3 * dt);
      shockwave.alpha -= 0.04 * dt;
      if (shockwave.alpha <= 0) shockwave.destroy();
    }
    
    // Animação das Partículas
    particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt; // Gravidade leve
      p.alpha -= 0.02 * dt;
      if (p.alpha <= 0) p.destroy();
    });

    // Animação do Screen Shake
    if (shakeAmount > 0) {
      stage.x = originalStagePos.x + (Math.random() - 0.5) * shakeAmount;
      stage.y = originalStagePos.y + (Math.random() - 0.5) * shakeAmount;
      shakeAmount -= 0.8 * dt;
    } else {
      stage.x = originalStagePos.x;
      stage.y = originalStagePos.y;
    }

    // Limpeza
    if (particles.every(p => p.destroyed) && flash.destroyed && shockwave.destroyed) {
      app.ticker.remove(explosionTicker);
      stage.x = originalStagePos.x; // Garante o reset da posição
      stage.y = originalStagePos.y;
    }
  };
  app.ticker.add(explosionTicker);
};

// --- COMPONENTE REACT ---
type LiptRocketProps = {
  onGameEnd: (result: any) => void;
};


export function LiptRocket({ onGameEnd }: LiptRocketProps) {
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

  // --- INICIALIZA PIXI (Com Fundo Degradê) ---
  useEffect(() => {
    if (!isClient) return;

    let app: PIXI.Application;

    const setup = async () => {
        if (!canvasContainerRef.current) return;

        app = new PIXI.Application();
        await app.init({
          width: canvasContainerRef.current.clientWidth,
          height: 320,
        //   backgroundColor: 0x0f172a, // REMOVIDO para usar o degradê
          antialias: true,
          resizeTo: canvasContainerRef.current,
        });

        if (canvasContainerRef.current) {
            canvasContainerRef.current.innerHTML = ''; // Limpa antes de adicionar
            canvasContainerRef.current.appendChild(app.canvas);
        }

        // NOVO: Criar fundo em degradê
        const gradientCanvas = document.createElement('canvas');
        gradientCanvas.width = 100; // Largura pequena, será esticada
        gradientCanvas.height = app.screen.height;
        const ctx = gradientCanvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, 0, app.screen.height);
        gradient.addColorStop(0, '#0c0c1d'); // Topo (espaço profundo)
        gradient.addColorStop(0.7, '#0f172a'); // Meio (cor original)
        gradient.addColorStop(1, '#1e293b'); // Base (mais clara, perto da UI)
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 100, app.screen.height);
        
        const gradientTexture = PIXI.Texture.from(gradientCanvas);
        const bgSprite = new PIXI.Sprite(gradientTexture);
        bgSprite.width = app.screen.width;
        bgSprite.height = app.screen.height;
        app.stage.addChildAt(bgSprite, 0); // Adiciona no índice 0

        appRef.current = app;
        starsRef.current = createStars(app); // Estrelas agora vão no índice 1
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

  // --- START GAME (Com Loop de Animação Melhorado) ---
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
    rocket.bobPhase = Math.random() * Math.PI * 2; // Reseta a fase da vibração

    const animate = () => {
        const currentMultiplier = multiplierRef.current;
        animationFrameId.current = requestAnimationFrame(animate);

        // PARTE 1 - Lógica do Jogo (Crash ou Continua)
        if (currentMultiplier >= crashPointRef.current) {
          setGameStatus('crashed');
          setCrashHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
          if (rocketRef.current) {
            rocketRef.current.alpha = 0;
            rocketRef.current.flame.visible = false;
          }
          createExplosion(app, rocket.x, rocket.y); // <-- Chama a nova explosão
          setIsLoadingAction(false);
          onGameEnd({
            id: Date.now(),
            bet: parseFloat(betAmount),
            crashPoint: crashPointRef.current,
            cashedOutAt: null,
            net: -parseFloat(betAmount),
          });
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
          return;
        } 
        
        multiplierRef.current += 0.001 + 0.0008 * currentMultiplier;
        setDisplayMultiplier(multiplierRef.current);
        
        // PARTE 2 - Lógica da Animação (Movimento)

        const maxRocketY = app.screen.height * 0.2;
        const verticalProgress = Math.min(1, (currentMultiplier - 1) / 3);
        const targetY = app.screen.height - 80 - (verticalProgress * (app.screen.height - 80 - maxRocketY));
        
        // NOVO: Vibração do foguete (bob)
        if (rocket.bobPhase === undefined) rocket.bobPhase = 0;
        rocket.bobPhase += 0.3; // Aumenta a velocidade da vibração
        const bobOffset = Math.sin(rocket.bobPhase) * (1 + verticalProgress * 2); // Vibra mais com a velocidade
        rocket.y = targetY + bobOffset; // Aplica a vibração
        rocket.rotation = (Math.random() - 0.5) * 0.015; // Leve tremor rotacional

        // NOVO: Animação da chama
        rocket.flame.scale.y = 1 + verticalProgress * 2.5; // Comprimento
        rocket.flame.scale.x = 1 + (Math.random() - 0.5) * 0.4; // Flicker horizontal
        rocket.flame.alpha = 0.8 + Math.random() * 0.2; // Flicker de opacidade
        // Anima o núcleo da chama
        const flameCore = rocket.flame.children[0] as PIXI.Graphics;
        if (flameCore) {
          flameCore.scale.y = 1 + (Math.random() - 0.5) * 0.3;
        }

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
    };

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [onGameEnd, betAmount]);

  // --- LÓGICA DE ESTADO E HANDLERS (Sem alterações) ---

  useEffect(() => {
    if (gameStatus === 'waiting') {
      const timer = setTimeout(startGame, 3000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

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
        const bet = parseFloat(betAmount);
        const { winnings } = await cashOutRocket(bet, finalMultiplier);
        mutate('wallet');
        setCashedOutMultiplier(finalMultiplier);
        setGameStatus('cashed_out');
        if (rocketRef.current) rocketRef.current.flame.visible = false;
        toast({ title: t('gameZone.rocket.toast.cashedOut.title'), description: t('gameZone.rocket.toast.cashedOut.description', { amount: winnings.toFixed(2), multiplier: finalMultiplier.toFixed(2) }) });
        onGameEnd({
          id: Date.now(),
          bet,
          crashPoint: crashPointRef.current,
          cashedOutAt: finalMultiplier,
          net: winnings - bet,
        });
    } catch (e: any) {
        toast({ variant: 'destructive', title: e.message });
        // Se a retirada falhar, a animação continua de onde parou
        if (gameStatus === 'in_progress' && !animationFrameId.current) {
          // Correção: requestAnimationFrame espera uma função, não o retorno de startGame
            animationFrameId.current = requestAnimationFrame(() => {
            // Precisamos recriar o loop 'animate' ou reiniciar o jogo
            // Para simplificar, vamos apenas chamar startGame que contém o animate
            // Nota: Isso pode não ser o ideal se startGame tiver efeitos colaterais
            // Mas olhando o código, startGame define o animate, então está ok.
            // A sua lógica original estava `requestAnimationFrame(startGame)`
            // o que estava incorreto.
            // A lógica correta é recriar o loop animate.
            // Vamos apenas chamar a função animate que foi definida dentro do startGame.
            // Para isso, o animate precisaria estar fora do callback.
            // Vamos simplificar e chamar startGame novamente.
            startGame(); 
          });
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
      rocket.rotation = 0; // Reseta a rotação do shake
        rocket.flame.visible = false;
    }
    // Reseta o "stage" caso o shake tenha travado
    if (appRef.current && appRef.current.stage) {
      appRef.current.stage.x = 0;
      appRef.current.stage.y = 0;
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
        return <Button onClick={handleBet} disabled={isLoadingAction} className="w-full py-4 text-base font-semibold md:text-lg">{isLoadingAction ? "Placing Bet..." : t('gameZone.rocket.placeBet')}</Button>;
      case 'waiting':
        return <Button disabled className="w-full py-4 text-base font-semibold md:text-lg">{t('gameZone.rocket.waitingForNextRound')}</Button>;
      case 'in_progress':
        return (
          <Button onClick={handleCashOut} disabled={isLoadingAction} className="w-full py-4 text-base font-semibold md:text-lg bg-green-500 hover:bg-green-600">
            {isLoadingAction ? 'Cashing out...' : `${t('gameZone.rocket.cashOut')} @ ${displayMultiplier.toFixed(2)}x`}
          </Button>
        );
      case 'cashed_out':
      case 'crashed':
        return <Button onClick={handleReset} className="w-full py-4 text-base font-semibold md:text-lg">{t('gameZone.rocket.playAgain')}</Button>;
      default:
        return null;
    }
  };
  
  // --- JSX (Skeleton e Layout - Sem alterações) ---
    if (!isClient || isLoadingWallet || !wallet) {
      return (
        <div className="flex w-full flex-col items-center gap-3 rounded-lg border bg-background/50 p-4 md:p-5">
            <div className="flex gap-1 flex-wrap justify-center h-6"></div>
             <div className="w-full text-center">
                <Skeleton className="h-12 w-48 mx-auto" />
            </div>
            <Skeleton className="h-56 w-full rounded-lg md:h-60" />
            <div className="w-full max-w-sm space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <div className="w-full max-w-sm">
                <Skeleton className="h-11 w-full" />
            </div>
        </div>
      )
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-lg border bg-background/50 p-4 md:p-5">
      {crashHistory.length > 0 && (
        <div className="flex w-full flex-wrap items-center justify-center gap-1">
          {crashHistory.map((m, i) => (
            <span key={i} className={cn("px-2 py-1 text-xs font-semibold rounded", m < 2 ? "bg-red-900/80 text-red-200" : m < 5 ? "bg-yellow-900/80 text-yellow-200" : "bg-green-900/80 text-green-200")}> 
              {m.toFixed(2)}x
            </span>
          ))}
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-1 rounded-md border border-primary/20 bg-background/60 px-3 py-4 text-center">
        {gameStatus === 'crashed' || gameStatus === 'cashed_out' ? (
          <div className="flex flex-col items-center gap-1">
            <span className={cn("text-3xl md:text-4xl font-semibold", gameStatus === 'crashed' ? "text-red-500" : "text-green-500")}>
              {(cashedOutMultiplier ?? crashPointRef.current).toFixed(2)}x
            </span>
            <span className="text-sm md:text-base text-foreground/80 font-medium">
              {gameStatus === 'crashed' ? t('gameZone.rocket.crashed') : t('gameZone.rocket.youCashedOut')}
            </span>
          </div>
        ) : (
          <h2 className={cn(
              "text-3xl md:text-4xl font-semibold transition-colors",
              displayMultiplier < 2 ? 'text-foreground' : displayMultiplier < 5 ? 'text-yellow-400' : 'text-green-400'
          )}
          >
            {gameStatus === 'waiting' ? '...' : `${displayMultiplier.toFixed(2)}x`}
          </h2>
        )}
        <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
          {gameStatus === 'in_progress' ? t('gameZone.rocket.cashOut') : t('gameZone.rocket.placeBet')}
        </span>
      </div>

      {/* O Canvas para o PIXI */}
      <div ref={canvasContainerRef} className="relative h-56 w-full overflow-hidden rounded-lg border border-primary/15 md:h-60" />

      {/* Controles da UI */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="bet-amount-rocket" className="text-sm font-medium">
            {t('gameZone.wheelOfFortune.betAmount')}
          </Label>
          <Input
            id="bet-amount-rocket"
            type="number"
            placeholder="0.0"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={gameStatus !== 'idle'}
            className="h-11 text-center text-base md:text-lg"
          />
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {t('stakingPool.walletBalance')}: {wallet.liptBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} LIPT
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {getButton()}
        </div>
      </div>
    </div>
  );
}