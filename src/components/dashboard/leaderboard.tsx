'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import useSWR from 'swr';
import { getLeaderboardData } from '@/services/mock-api';
import { Skeleton } from '../ui/skeleton';

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-yellow-600';
  return 'text-muted-foreground';
};

export function Leaderboard() {
  const { t } = useI18n();
  const { data: leaderboardData, isLoading } = useSWR('leaderboard', getLeaderboardData);

  return (
    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              {t('leaderboard.title')}
            </CardTitle>
            <HelpTooltip
              title={t('leaderboard.title')}
              content={<p>{t('leaderboard.tooltip')}</p>}
            />
          </div>
        </div>
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
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : (
                leaderboardData?.map((user, index) => (
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
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
