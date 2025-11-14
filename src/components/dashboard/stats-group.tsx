'use client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrendingUp, Banknote, Coins, PiggyBank, Briefcase, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import useSWR from 'swr';
import { getDashboardStats, getWalletData, priceHistory } from '@/services/mock-api';
import { useAccount } from 'wagmi';
import { Skeleton } from '../ui/skeleton';

export function StatsGroup() {
    const { t } = useI18n();
    const { address: userAddress } = useAccount();
    const { data: stats, isLoading: isLoadingStats } = useSWR(userAddress ? ['stats', userAddress] : null, () => getDashboardStats(userAddress!));
    const { data: wallet, isLoading: isLoadingWallet } = useSWR(userAddress ? ['wallet', userAddress] : null, () => getWalletData(userAddress!));

    const isLoading = isLoadingStats || isLoadingWallet;

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                    </>
                ) : (
                    <>
                    <StatsCard
                        title={t('stats.liptPrice.title')}
                        value={`$${stats?.liptPrice.toFixed(4)}`}
                        icon={<TrendingUp className="h-5 w-5 text-primary" />}
                        description={t('stats.liptPrice.description')}
                        chartData={priceHistory}
                        chartKey="price"
                    />
                    <StatsCard
                        title={t('stats.tvl.title')}
                        value={`$${stats?.totalValueLocked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<Banknote className="h-5 w-5 text-primary" />}
                        description={t('stats.tvl.description')}
                    />
                    <StatsCard
                        title={t('stats.totalInvested.title')}
                        value={`$${stats?.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<Briefcase className="h-5 w-5 text-primary" />}
                        description={t('stats.totalInvested.description')}
                    />
                    </>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                 {isLoading ? <Skeleton className="h-24" /> : (
                     <StatsCard
                        title={t('stats.totalReturns.title')}
                        value={`$${stats?.totalReturns.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={<ArrowUpRight className="h-5 w-5 text-green-400" />}
                        description={t('stats.totalReturns.description')}
                        className="border-green-400/20 hover:border-green-400/50"
                    />
                 )}
                <div className="grid grid-cols-2 gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </>
                    ) : (
                        <>
                        <StatsCard
                            title={t('stats.liptBalance.title')}
                            value={`${wallet?.liptBalance.toLocaleString('en-US')} LIPT`}
                            icon={<Coins className="h-5 w-5 text-primary" />}
                        />
                        <StatsCard
                            title={t('stats.usdtBalance.title')}
                            value={`${wallet?.usdtBalance.toLocaleString('en-US')} USDT`}
                            icon={<PiggyBank className="h-5 w-5 text-primary" />}
                        />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
