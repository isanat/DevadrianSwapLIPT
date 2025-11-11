'use client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrendingUp, Banknote, Coins, PiggyBank, Briefcase, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { useI18n } from '@/context/i18n-context';

const priceHistory = Array.from({ length: 20 }, (_, i) => ({
  time: `T-${20 - i}`,
  price: 1.25 + (Math.random() - 0.5) * 0.2 + i * 0.01,
}));


export function StatsGroup() {
    const { liptPrice, totalValueLocked, liptBalance, usdtBalance, totalInvested, totalReturns } = useDashboard();
    const { t } = useI18n();

    const profitLoss = totalReturns - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title={t('stats.liptPrice.title')}
                    value={`$${liptPrice.toFixed(4)}`}
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                    description={t('stats.liptPrice.description')}
                    chartData={priceHistory}
                    chartKey="price"
                />
                <StatsCard
                    title={t('stats.tvl.title')}
                    value={`$${totalValueLocked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<Banknote className="h-5 w-5 text-primary" />}
                    description={t('stats.tvl.description')}
                />
                <StatsCard
                    title={t('stats.totalInvested.title')}
                    value={`$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<Briefcase className="h-5 w-5 text-primary" />}
                    description={t('stats.totalInvested.description')}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                 <StatsCard
                    title={t('stats.totalReturns.title')}
                    value={`$${totalReturns.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<ArrowUpRight className="h-5 w-5 text-green-400" />}
                    description={t('stats.totalReturns.description')}
                    className="border-green-400/20 hover:border-green-400/50"
                />
                <div className="grid grid-cols-2 gap-4">
                    <StatsCard
                        title={t('stats.liptBalance.title')}
                        value={`${liptBalance.toLocaleString('en-US')} LIPT`}
                        icon={<Coins className="h-5 w-5 text-primary" />}
                    />
                    <StatsCard
                        title={t('stats.usdtBalance.title')}
                        value={`${usdtBalance.toLocaleString('en-US')} USDT`}
                        icon={<PiggyBank className="h-5 w-5 text-primary" />}
                    />
                </div>
            </div>
        </div>
    );
}
