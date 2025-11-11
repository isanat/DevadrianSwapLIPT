'use client';
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useDashboard } from "@/context/dashboard-context";
import { Banknote, PiggyBank, Archive, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PortfolioPage() {
    const {
        totalInvested,
        totalReturns,
        stakedBalance,
        unclaimedRewards,
        liptPrice,
        lpTokens,
        feesEarned,
        poolShare
    } = useDashboard();

    const stakingValue = stakedBalance * liptPrice;
    const stakingReturnValue = unclaimedRewards * liptPrice;

    // A mock calculation for LP value
    const totalLpValue = (lpTokens > 0 && poolShare > 0) ? (feesEarned / (poolShare / 100)) * 0.1 : 0;
    const lpValue = totalLpValue * (poolShare / 100);


    return (
        <AppShell>
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8">
                    <StatsCard
                        title="Total Invested (USD)"
                        value={`$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<Banknote className="h-5 w-5 text-primary" />}
                        description="Your total contribution across all activities"
                    />
                    <StatsCard
                        title="Total Returns (USD)"
                        value={`$${totalReturns.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<PiggyBank className="h-5 w-5 text-primary" />}
                        description="Staking Rewards + LP Fees Earned"
                    />
                </div>

                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Archive /> Staking Details</CardTitle>
                        <CardDescription>Your performance in the staking pools.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Staked Balance</TableCell>
                                    <TableCell className="text-right">{stakedBalance.toLocaleString('en-US')} LIPT</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Staked Value (USD)</TableCell>
                                    <TableCell className="text-right">${stakingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Unclaimed Rewards</TableCell>
                                    <TableCell className="text-right">{unclaimedRewards.toLocaleString('en-US', { minimumFractionDigits: 2 })} LIPT</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Unclaimed Rewards Value (USD)</TableCell>
                                    <TableCell className="text-right">${stakingReturnValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Droplets /> Liquidity Pool Details</CardTitle>
                        <CardDescription>Your performance in the LIPT/USDT liquidity pool.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Your LP Tokens</TableCell>
                                    <TableCell className="text-right">{lpTokens.toLocaleString('en-US')}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Your Pool Share</TableCell>
                                    <TableCell className="text-right">{poolShare.toFixed(2)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fees Earned (USD)</TableCell>
                                    <TableCell className="text-right">${feesEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Your Liquidity Value (USD)</TableCell>
                                    <TableCell className="text-right">${lpValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
