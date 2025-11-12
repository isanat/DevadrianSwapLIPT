'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/context/i18n-context';
import { Ticket, Clock, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import useSWR, { useSWRConfig } from 'swr';
import { buyLotteryTickets, claimLotteryPrize, getLotteryData, getWalletData, LotteryState } from '@/services/mock-api';
import { Skeleton } from '../ui/skeleton';

const CountdownTimer = ({ endTime }: { endTime: number }) => {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">--</div>
          <div className="text-sm text-muted-foreground">{t('gameZone.lottery.hours')}</div>
        </div>
        <div className="text-4xl font-bold">:</div>
        <div className="text-center">
          <div className="text-4xl font-bold">--</div>
          <div className="text-sm text-muted-foreground">{t('gameZone.lottery.minutes')}</div>
        </div>
        <div className="text-4xl font-bold">:</div>
        <div className="text-center">
          <div className="text-4xl font-bold">--</div>
          <div className="text-sm text-muted-foreground">{t('gameZone.lottery.seconds')}</div>
        </div>
      </div>
    );
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex justify-center items-center gap-4">
      <div className="text-center">
        <div className="text-4xl font-bold">{String(hours).padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">{t('gameZone.lottery.hours')}</div>
      </div>
      <div className="text-4xl font-bold">:</div>
      <div className="text-center">
        <div className="text-4xl font-bold">{String(minutes).padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">{t('gameZone.lottery.minutes')}</div>
      </div>
      <div className="text-4xl font-bold">:</div>
      <div className="text-center">
        <div className="text-4xl font-bold">{String(seconds).padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">{t('gameZone.lottery.seconds')}</div>
      </div>
    </div>
  );
};


export function DailyLottery() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  
  const { data: lottery, isLoading: isLoadingLottery } = useSWR<LotteryState>('lottery', getLotteryData);
  const { data: wallet, isLoading: isLoadingWallet } = useSWR('wallet', getWalletData);

  const [ticketAmount, setTicketAmount] = useState('1');
  const [isBuying, setIsBuying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Trigger a re-fetch when the draw ends
  useEffect(() => {
    if (lottery && lottery.currentDraw.status === 'OPEN') {
      const timeUntilEnd = lottery.currentDraw.endTime - Date.now();
      if (timeUntilEnd > 0) {
        const timer = setTimeout(() => {
          mutate('lottery');
        }, timeUntilEnd + 2000); // add a 2s buffer
        return () => clearTimeout(timer);
      }
    }
  }, [lottery, mutate]);
  
  const isWinner = lottery?.currentDraw.status === 'CLOSED' && lottery?.currentDraw.winnerAddress === 'user123';
  const canClaim = isWinner && !lottery?.currentDraw.prizeClaimed;

  const handleBuyTickets = async () => {
    const amount = parseInt(ticketAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: t('gameZone.lottery.toast.invalidAmount.title') });
      return;
    }
    
    setIsBuying(true);
    try {
      await buyLotteryTickets(amount);
      mutate('lottery');
      mutate('wallet');
      toast({ title: t('gameZone.lottery.toast.success.title'), description: t('gameZone.lottery.toast.success.description', { amount }) });
      setTicketAmount('1');
    } catch (error: any) {
      toast({ variant: 'destructive', title: error.message });
    } finally {
      setIsBuying(false);
    }
  };

  const handleClaim = async () => {
    if (!lottery) return;
    setIsClaiming(true);
    const prizeAmount = lottery.currentDraw.prizePool;
    try {
        await claimLotteryPrize();
        mutate('lottery');
        mutate('wallet');
        toast({ 
            title: t('gameZone.lottery.toast.claimed.title'), 
            description: t('gameZone.lottery.toast.claimed.description', { amount: prizeAmount.toLocaleString() }) 
        });
    } catch (error: any) {
         toast({ variant: 'destructive', title: error.message });
    } finally {
        setIsClaiming(false);
    }
  };

  if (isLoadingLottery || isLoadingWallet || !lottery || !wallet) {
     return (
      <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
       {canClaim && (
        <Card className="bg-yellow-400/20 border-yellow-500 animate-pulse">
            <CardHeader className='text-center'>
                <CardTitle className='text-yellow-300'>{t('gameZone.lottery.winner.title')}</CardTitle>
                <CardDescription>{t('gameZone.lottery.winner.description', { amount: lottery.currentDraw.prizePool.toLocaleString() })}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" onClick={handleClaim} disabled={isClaiming}>
                    <Trophy className="mr-2 h-4 w-4" />
                    {isClaiming ? 'Claiming...' : t('gameZone.lottery.winner.claimButton')}
                </Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-muted-foreground">{t('gameZone.lottery.prizePool')}</CardTitle>
          <p className="text-5xl font-bold tracking-tighter text-primary">
            {lottery.currentDraw.prizePool.toLocaleString()} LIPT
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-full p-4 rounded-lg bg-background/50">
             <h3 className="text-center text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5"/>
                {lottery.currentDraw.status === 'OPEN' ? t('gameZone.lottery.drawInProgress') : 'Draw Closed'}
             </h3>
             {lottery.currentDraw.status === 'OPEN' ? (
                <CountdownTimer endTime={lottery.currentDraw.endTime} />
             ) : (
                <div className="text-center font-bold text-xl py-4">Waiting for next draw...</div>
             )}
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
                <label htmlFor="ticket-amount" className="font-medium">{t('gameZone.lottery.buyTickets')}</label>
                <div className="flex items-center gap-2">
                    <Input id="ticket-amount" type="number" value={ticketAmount} onChange={e => setTicketAmount(e.target.value)} min="1" className="text-center" disabled={isBuying} />
                    <Button onClick={handleBuyTickets} disabled={isBuying || lottery.currentDraw.status !== 'OPEN'}>
                        {isBuying ? 'Buying...' : t('gameZone.lottery.buyButton')}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">{t('gameZone.lottery.ticketCost')}: {lottery.ticketPrice} LIPT. {t('stakingPool.walletBalance')}: {wallet.liptBalance.toLocaleString()}</p>
            </div>
            
            <Card className='bg-background/50'>
                <CardHeader className='p-4'>
                    <CardTitle className='text-base'>{t('gameZone.lottery.yourTickets')}: {lottery.userTickets.length}</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    <ScrollArea className="h-24 w-full">
                        <div className='p-4 pt-0'>
                            {lottery.userTickets.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {lottery.userTickets.map(ticket => (
                                        <span key={ticket} className="flex items-center gap-1 text-xs font-semibold bg-primary/20 text-primary-foreground py-1 px-2 rounded-full">
                                            <Ticket size={12} /> #{String(ticket).padStart(6, '0')}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">{t('gameZone.lottery.noTickets')}</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>{t('gameZone.lottery.previousDraws')}</CardTitle>
            <CardDescription>{t('gameZone.lottery.previousDrawsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {lottery.previousDraws.map(draw => (
                    <div key={draw.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                        <div>
                            <p className="font-semibold flex items-center gap-2"><Trophy size={14} className="text-yellow-400"/> {t('gameZone.lottery.draw')} #{draw.id}</p>
                            <p className="text-xs text-muted-foreground">{t('gameZone.lottery.winner')}: {draw.winnerAddress && `${draw.winnerAddress.substring(0, 6)}...${draw.winnerAddress.substring(draw.winnerAddress.length - 4)}`}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-lg text-primary">{draw.prizePool.toLocaleString()} LIPT</p>
                           <p className="text-xs font-semibold text-muted-foreground flex items-center justify-end gap-1"><Ticket size={12}/> #{draw.winningTicket && String(draw.winningTicket).padStart(6, '0')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
