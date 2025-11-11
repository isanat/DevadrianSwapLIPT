'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function LiquidityPool() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          Liquidity Pool (LIPT/USDT)
        </CardTitle>
        <CardDescription>Provide liquidity to earn trading fees from the LIPT/USDT pair.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Your Pool Share</p>
            <p className="text-2xl font-bold">0.12%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your LP Tokens</p>
            <p className="text-2xl font-bold">45.8</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fees Earned</p>
            <p className="text-2xl font-bold">55.75 USDT</p>
          </div>
        </div>
        <Separator className="my-4" />
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-lipt-amount">LIPT Amount</Label>
                <Input id="add-lipt-amount" type="number" placeholder="0.0" />
                <p className="text-xs text-muted-foreground">Balance: 10,500 LIPT</p>
              </div>
              <div className="flex justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-usdt-amount">USDT Amount</Label>
                <Input id="add-usdt-amount" type="number" placeholder="0.0" />
                <p className="text-xs text-muted-foreground">Balance: 5,000 USDT</p>
              </div>
              <Button className="w-full mt-4" variant="default">Add Liquidity</Button>
            </div>
          </TabsContent>
          <TabsContent value="remove" className="mt-4">
             <div className="space-y-2">
                <Label htmlFor="remove-lp-amount">LP Token Amount to Remove</Label>
                <div className="flex gap-2">
                  <Input id="remove-lp-amount" type="number" placeholder="0.0" />
                  <Button variant="destructive">Remove</Button>
                </div>
                <p className="text-xs text-muted-foreground">Your LP tokens: 45.8</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
