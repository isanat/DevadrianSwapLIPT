'use client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrendingUp, Banknote, Coins, PiggyBank } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function StatsGroup() {
    const { liptPrice, totalValueLocked, liptBalance, usdtBalance } = useDashboard();

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatsCard
            title="LIPT Token Price"
            value={`$${liptPrice.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description="Current market price"
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
