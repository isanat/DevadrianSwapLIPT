'use client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrendingUp, Banknote, Coins, PiggyBank } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

const priceHistory = Array.from({ length: 20 }, (_, i) => ({
  time: `T-${20 - i}`,
  price: 1.25 + (Math.random() - 0.5) * 0.2 + i * 0.01,
}));


export function StatsGroup() {
    const { liptPrice, totalValueLocked, liptBalance, usdtBalance } = useDashboard();

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatsCard
            title="LIPT Token Price"
            value={`$${liptPrice.toFixed(4)}`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description="Last 24 hours"
            chartData={priceHistory}
            chartKey="price"
        />
        <StatsCard
            title="Total Value Locked (TVL)"
            value={`$${totalValueLocked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Banknote className="h-5 w-5 text-primary" />}
            description="Across all pools"
        />
        <StatsCard
            title="Your LIPT Balance"
            value={`${liptBalance.toLocaleString('en-US')} LIPT`}
            icon={<Coins className="h-5 w-5 text-primary" />}
            description="In your wallet"
        />
        <StatsCard
            title="Your USDT Balance"
            value={`${usdtBalance.toLocaleString('en-US')} USDT`}
            icon={<PiggyBank className="h-5 w-5 text-primary" />}
            description="In your wallet"
        />
        </div>
    );
}
