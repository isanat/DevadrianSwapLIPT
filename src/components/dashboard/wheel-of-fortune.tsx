// Remova o 'use client' se já estiver no topo do arquivo.
// 'use client'; 

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/context/dashboard-context';
import { cn } from '@/lib/utils';

// 🎯 Segmentos com pesos (probabilidades) ajustados para vantagem da casa
// Cores inspiradas na imagem e com bom contraste
const segments = [
    // --- Vitória da Casa (Baixo Retorno/Perda) ---
    { value: 0,   label: '0x',   color: '#DC2626',    weight: 12 }, // Vermelho Vivo (Perda Total)
    { value: 0.5, label: '0.5x', color: '#EA580C',    weight: 10 }, // Laranja Vivo (Perda Parcial)
    { value: 0,   label: '0x',   color: '#1F2937',    weight: 12 }, // Cinza Escuro/Preto (Perda Total)
    { value: 0.5, label: '0.5x', color: '#FCD34D',    weight: 10 }, // Amarelo Vivo (Perda Parcial)

    // --- Neutro (1x) ---
    { value: 1,   label: '1x',   color: '#3B82F6',    weight: 8 },  // Azul Vivo
    { value: 1,   label: '1x',   color: '#22C55E',    weight: 8 },  // Verde Vivo

    // --- Vitória do Jogador (Alto Retorno) ---
    { value: 1.3, label: '1.3x', color: '#A855F7',    weight: 10 }, // Roxo Vivo
    { value: 2,   label: '2x',   color: '#EC4899',    weight: 6 },  // Rosa Vibrante
    { value: 3,   label: '3x',   color: '#F43F5E',    weight: 4 },  // Vermelho-Rosa Intenso
    
    // --- Outros Neutros/Perdas ---
    { value: 0,   label: '0x',   color: '#78350F',    weight: 12 }, // Marrom Escuro (Perda Total)
    { value: 0.5, label: '0.5x', color: '#EAB308',    weight: 10 }, // Amarelo Dourado (Perda Parcial)
    { value: 1,   label: '1x',   color: '#D1D5DB',    weight: 8 },  // Cinza Claro (1x)
];


const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

// 🎨 Gera o gradiente conic proporcional
const getConicGradient = () => {
  let gradient = 'conic-gradient(';
  let currentAngle = -90; // ponteiro no topo
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
  const transitionStyle = isSpinning
    ? { transition: 'transform 8s cubic-bezier(0.25, 1, 0.5, 1)' } // Animação mais suave e lenta
    : { transition: 'none' };

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto my-8 flex items-center justify-center">
      {/* Borda externa vermelha com bolinhas douradas */}
      <div className="absolute w-full h-full rounded-full bg-red-600 shadow-lg flex items-center justify-center p-2">
        {/* Pinos Dourados */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-4 h-4 rounded-full bg-yellow-400 shadow-md"
            style={{
              transform: `rotate(${(360 / 24) * i}deg) translate(185px) `, // Ajuste 'translate' para o tamanho da borda
              transformOrigin: 'center',
              left: '50%',
              top: '50%',
              marginLeft: '-8px', // Centraliza o pino
              marginTop: '-8px'  // Centraliza o pino
            }}
          />
        ))}

        {/* Container da roleta interna */}
        <div
          className={cn(
            'relative w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-full flex items-center justify-center', // Subtrai o padding da borda
            'shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]' // Sombra interna para profundidade
          )}
          style={{ transform: `rotate(${rotation}deg)`, ...transitionStyle }}
        >
          {/* Fundo da roda com gradiente */}
          <div
            className="absolute w-full h-full rounded-full border-4 border-gray-700" // Borda sutil entre segmentos e centro
            style={{ background: getConicGradient() }}
          />

          {/* Marcadores de texto */}
          {segments.map((seg, i) => {
            const startAngle =
              -90 +
              (segments.slice(0, i).reduce((sum, s) => sum + (s.weight / totalWeight) * 360, 0) +
                (seg.weight / totalWeight) * 180);
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 text-sm md:text-base font-extrabold rotate-[270deg]" // Rotaciona 270 para ficar de lado
                style={{
                  // Move o texto para a borda interna
                  transform: `rotate(${startAngle}deg) translateX(110px) rotate(${90 - startAngle}deg)`, // Ajuste para texto de lado
                  color: seg.color === '#D1D5DB' || seg.color === '#FCD34D' ? '#000' : '#fff', // Texto preto em cores claras
                  textShadow: '0 0 5px rgba(0,0,0,0.8)'
                }}
              >
                {seg.label}
              </span>
            );
          })}

          {/* Círculo central "SPIN" */}
          <div className="absolute w-28 h-28 rounded-full bg-red-600 border-4 border-yellow-400 z-10 shadow-[0_0_15px_rgba(255,255,0,0.7)] flex items-center justify-center">
            <span className="text-3xl font-black text-yellow-400 uppercase">
              {isSpinning ? t('gameZone.wheelOfFortune.spinning') : t('gameZone.wheelOfFortune.spinButton').split(' ')[0]} 
            </span>
          </div>
        </div>
      </div>

      {/* Ponteiro sobre a borda */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-700 shadow-xl z-40 transform -translate-y-full" />

    </div>
  );
};

// ... (O restante do componente WheelOfFortune permanece o mesmo)
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
    const winningIndex = segments.indexOf(winningSeg);

    // Cálculo do ângulo alvo proporcional
    let currentAngle = -90;
    for (let i = 0; i < winningIndex; i++) {
      currentAngle += (segments[i].weight / totalWeight) * 360;
    }
    const segAngle = (segments[winningIndex].weight / totalWeight) * 360;
    const targetAngle = -(currentAngle + segAngle / 2);

    const randomSpins = Math.floor(Math.random() * 3) + 6; // 6–8 voltas
    const finalRotation = randomSpins * 360 + targetAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      const winnings = bet * winningSeg.value;

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
      setRotation(finalRotation % 360);
    }, 8000); // 8s animação
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
        className="w-full max-w-xs font-bold text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning
          ? t('gameZone.wheelOfFortune.spinning')
          : t('gameZone.wheelOfFortune.spinButton')}
      </Button>

      {isSpinning && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {t('gameZone.wheelOfFortune.spinning')}
        </p>
      )}
    </div>
  );
}