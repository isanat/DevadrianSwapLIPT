'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';

const mockLeaderboardData = [
  { rank: 1, name: 'CryptoKing', commission: 2500.75, avatar: '1' },
  { rank: 2, name: 'DiamondHands', commission: 2210.50, avatar: '2' },
  { rank: 3, name: 'SatoshiJr', commission: 1980.20, avatar: '3' },
  { rank: 4, name: 'MoonLambo', commission: 1850.00, avatar: '4' },
  { rank: 5, name: 'ShibaInuFan', commission: 1600.90, avatar: '5' },
  { rank: 6, name: ' DeFiWhale', commission: 1450.60, avatar: '6' },
  { rank: 7, name: 'EtherChad', commission: 1200.00, avatar: '7' },
  { rank: 8, name: 'YieldFarmer', commission: 1100.45, avatar: '8' },
  { rank: 9, name: 'ApeInvestor', commission: 980.30, avatar: '9' },
  { rank: 10, name: 'ToTheMoon', commission: 850.10, avatar: '10' },
].sort((a, b) => b.commission - a.commission);

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-yellow-600';
  return 'text-muted-foreground';
};

export function Leaderboard() {
  const { t } = useI18n();

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          {t('leaderboard.title')}
        </CardTitle>
        <CardDescription>{t('leaderboard.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">{t('leaderboard.rank')}</TableHead>
              <TableHead>{t('leaderboard.user')}</TableHead>
              <TableHead className="text-right">{t('leaderboard.commission')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeaderboardData.map((user, index) => (
              <TableRow key={user.rank}>
                <TableCell className={`text-center font-bold text-lg ${getRankColor(index + 1)}`}>
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/40/40`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {user.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
