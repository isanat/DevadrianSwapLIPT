'use client';
import { useI18n } from "@/context/i18n-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ArrowDownRight, ArrowUpRight, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type RocketResult = {
  id: number;
  bet: number;
  crashPoint: number;
  cashedOutAt: number | null;
  net: number;
};

type RocketReportProps = {
  history: RocketResult[];
};

export function RocketReport({ history }: RocketReportProps) {
  const { t } = useI18n();

  const totalPlays = history.length;
  const totalWagered = history.reduce((sum, play) => sum + play.bet, 0);
  const totalNet = history.reduce((sum, play) => sum + play.net, 0);

  const last5Plays = history.slice(0, 5);

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('gameZone.report.totalPlays')}</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPlays}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('gameZone.report.totalWagered')}</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalWagered.toLocaleString()} LIPT</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('gameZone.report.netBalance')}</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", totalNet >= 0 ? "text-green-500" : "text-red-500")}>
                        {totalNet >= 0 ? '+' : ''}{totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LIPT
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('gameZone.rocket.report.last5Plays')}</CardTitle>
                <CardDescription>{t('gameZone.rocket.report.last5PlaysDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('gameZone.rocket.report.bet')}</TableHead>
                            <TableHead>{t('gameZone.rocket.report.crashPoint')}</TableHead>
                            <TableHead>{t('gameZone.rocket.report.cashedOutAt')}</TableHead>
                            <TableHead className="text-right">{t('gameZone.rocket.report.netReturn')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {last5Plays.length > 0 ? (
                            last5Plays.map(play => (
                                <TableRow key={play.id}>
                                    <TableCell>{play.bet.toLocaleString()} LIPT</TableCell>
                                    <TableCell>{play.crashPoint.toFixed(2)}x</TableCell>
                                    <TableCell>
                                        {play.cashedOutAt ? (
                                            <span className="text-green-400 font-semibold flex items-center gap-1"><TrendingUp size={14}/> {play.cashedOutAt.toFixed(2)}x</span>
                                        ) : (
                                            <span className="text-red-400 font-semibold flex items-center gap-1"><TrendingDown size={14}/> Crashed</span>
                                        )}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-semibold", play.net >= 0 ? 'text-green-400' : 'text-red-400')}>
                                      {play.net >= 0 ? '+' : ''}{play.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LIPT
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">{t('gameZone.rocket.report.noPlays')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
