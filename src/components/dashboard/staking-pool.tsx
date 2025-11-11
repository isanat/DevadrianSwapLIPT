'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Archive, Download } from 'lucide-react';

export function StakingPool() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-6 w-6 text-primary" />
          LIPT Staking Pool
        </CardTitle>
        <CardDescription>Stake your LIPT tokens to earn rewards.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Staked Balance</p>
            <p className="text-2xl font-bold">5,000 LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unclaimed Rewards</p>
            <p className="text-2xl font-bold">125.7 LIPT</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Staking APY</p>
            <p className="text-2xl font-bold text-chart-2">12.5%</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          <TabsContent value="stake" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <div className="flex gap-2">
                <Input id="stake-amount" type="number" placeholder="0.0" />
                <Button variant="default">Stake</Button>
              </div>
               <p className="text-xs text-muted-foreground">Your wallet balance: 10,500 LIPT</p>
            </div>
          </TabsContent>
          <TabsContent value="unstake" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="unstake-amount">Amount to Unstake</Label>
              <div className="flex gap-2">
                <Input id="unstake-amount" type="number" placeholder="0.0" />
                <Button variant="destructive">Unstake</Button>
              </div>
              <p className="text-xs text-muted-foreground">Your staked balance: 5,000 LIPT</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Claim Rewards
        </Button>
      </CardFooter>
    </Card>
  );
}
