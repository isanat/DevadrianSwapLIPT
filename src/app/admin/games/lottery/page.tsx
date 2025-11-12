'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useSWR from 'swr';
import { getLotteryData, LotteryDraw } from '@/services/mock-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLotteryPage() {
    const { data: lotteryData, isLoading } = useSWR('lottery', getLotteryData);

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Daily Lottery Management</h1>
                <p className="text-muted-foreground">Manage lottery draws, prize pools, and view winners.</p>
            </header>
            <main className='grid gap-4 md:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Draw #{lotteryData?.currentDraw.id}</CardTitle>
                        <CardDescription>
                            Status: <span className='font-bold'>{lotteryData?.currentDraw.status}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className="grid gap-4 sm:grid-cols-2">
                             <div className='p-4 rounded-lg bg-muted/50'>
                                <p className="text-sm text-muted-foreground">Prize Pool</p>
                                {isLoading ? <Skeleton className='h-8 w-3/4' /> : <p className="text-2xl font-bold">{lotteryData?.currentDraw.prizePool.toLocaleString()} LIPT</p>}
                            </div>
                             <div className='p-4 rounded-lg bg-muted/50'>
                                <p className="text-sm text-muted-foreground">Total Tickets Sold</p>
                                {isLoading ? <Skeleton className='h-8 w-1/4' /> : <p className="text-2xl font-bold">{lotteryData?.totalTickets.toLocaleString()}</p>}
                            </div>
                        </div>
                         <div className='space-y-2'>
                            <Label htmlFor='ticketPrice'>Ticket Price (LIPT)</Label>
                            <Input id='ticketPrice' type='number' defaultValue={lotteryData?.ticketPrice} disabled={isLoading} />
                        </div>
                        <Button className='w-full'>Update Ticket Price</Button>
                        <Button className='w-full' variant='destructive'>End Current Draw & Pick Winner</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Previous Draws</CardTitle>
                        <CardDescription>
                           History of past lottery draws.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        {isLoading ? <Skeleton className='h-40 w-full' /> : (
                            lotteryData?.previousDraws.map((draw: LotteryDraw) => (
                                <div key={draw.id} className='p-3 rounded-lg bg-muted/50 flex justify-between items-center'>
                                    <div>
                                        <p className='font-semibold'>Draw #{draw.id}</p>
                                        <p className='text-xs text-muted-foreground'>Winner: {draw.winnerAddress}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='font-bold'>{draw.prizePool.toLocaleString()} LIPT</p>
                                        <p className='text-xs text-muted-foreground'>Ticket #{draw.winningTicket}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
