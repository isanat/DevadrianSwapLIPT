'use client';
import { useI18n } from "@/context/i18n-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
import { cn } from "@/lib/utils";


type SpinResult = {
  id: number;
  bet: number;
  multiplier: string;
  winnings: number;
  net: number;
};

type GameReportProps = {
  history: SpinResult[];
};

export function GameReport({ history }: GameReportProps) {
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
                <CardTitle>{t('gameZone.report.last5Plays')}</CardTitle>
                <CardDescription>{t('gameZone.report.last5PlaysDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('gameZone.report.bet')}</TableHead>
                            <TableHead>{t('gameZone.report.multiplier')}</TableHead>
                            <TableHead className="text-right">{t('gameZone.report.result')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {last5Plays.length > 0 ? (
                            last5Plays.map(play => (
                                <TableRow key={play.id}>
                                    <TableCell>{play.bet.toLocaleString()} LIPT</TableCell>
                                    <TableCell>{play.multiplier}</TableCell>
                                    <TableCell className={cn("text-right font-semibold", play.net >= 0 ? 'text-green-400' : 'text-red-400')}>
                                      {play.net >= 0 ? '+' : ''}{play.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LIPT
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">{t('gameZone.report.noPlays')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
