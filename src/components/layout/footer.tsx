'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

const contracts = [
  { label: 'LIPT Token', key: 'liptToken' as const },
  { label: 'Mock USDT', key: 'mockUsdt' as const },
  { label: 'Swap Pool', key: 'swapPool' as const },
  { label: 'Staking Pool', key: 'stakingPool' as const },
  { label: 'Mining Pool', key: 'miningPool' as const },
  { label: 'Referral Program', key: 'referralProgram' as const },
  { label: 'Wheel of Fortune', key: 'wheelOfFortune' as const },
  { label: 'Rocket Game', key: 'rocketGame' as const },
  { label: 'Lottery', key: 'lottery' as const },
  { label: 'Protocol Controller', key: 'protocolController' as const },
  { label: 'Tax Handler', key: 'taxHandler' as const },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Contratos implantados (Polygon)</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-xs">
            {contracts.map(({ label, key }) => {
              const address = (CONTRACT_ADDRESSES as any)[key] as string | undefined;
              if (!address) return null;
              return (
                <a
                  key={key}
                  className="flex items-center gap-2 rounded-md border border-border/40 bg-card/50 px-3 py-2 hover:border-primary/60 hover:bg-card/70 transition-colors"
                  href={`https://polygonscan.com/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground/80">{label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{address}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
