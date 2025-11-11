'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Rocket, Ticket, History, RotateCw } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import { WheelOfFortune } from './wheel-of-fortune';
import { GameReport } from './game-report';

export function GameZone() {
  const { t } = useI18n();
  const [spinHistory, setSpinHistory] = React.useState<any[]>([]);

  const handleSpinResult = (result: any) => {
    setSpinHistory(prev => [result, ...prev]);
  };


  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                    {t('gameZone.title')}
                </CardTitle>
                <HelpTooltip
                title={t('gameZone.title')}
                content={<p>{t('gameZone.tooltip')}</p>}
                />
            </div>
        </div>
        <CardDescription>{t('gameZone.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="wheel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wheel">{t('gameZone.wheelOfFortune.title')}</TabsTrigger>
            <TabsTrigger value="rocket" disabled>
                <Rocket className="h-4 w-4 mr-2"/>
                {t('gameZone.rocket.title')}
            </TabsTrigger>
            <TabsTrigger value="lottery" disabled>
                <Ticket className="h-4 w-4 mr-2"/>
                {t('gameZone.lottery.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wheel" className="mt-4">
             <Tabs defaultValue="game" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="game">
                        <RotateCw className="h-4 w-4 mr-2"/>
                        {t('gameZone.spin')}
                    </TabsTrigger>
                    <TabsTrigger value="report">
                        <History className="h-4 w-4 mr-2"/>
                        {t('gameZone.report.title')}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="game" className="mt-4">
                    <WheelOfFortune onSpinResult={handleSpinResult} />
                </TabsContent>
                <TabsContent value="report" className="mt-4">
                    <GameReport history={spinHistory} />
                </TabsContent>
             </Tabs>
          </TabsContent>
          <TabsContent value="rocket">
            {/* Rocket Game Component will go here */}
          </TabsContent>
          <TabsContent value="lottery">
            {/* Lottery Game Component will go here */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
