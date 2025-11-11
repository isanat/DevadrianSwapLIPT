
'use client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrendingUp, Banknote, Coins, Users } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function StatsGroup() {
    const { liptPrice, priceChange, totalValueLocked, liptBalance, totalStakers } = useDashboard();

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatsCard
            title="LIPT Token Price"
            value={`$${liptPrice.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description={`+${priceChange}% from last hour`}
        />
        <StatsCard
            title="Total Value Locked"
            value={`$${totalValueLocked.toLocaleString('en-US')}`}
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
            title="Total Stakers"
            value={totalStakers}
            icon={<Users className="h-5 w-5 text-primary" />}
            description="Participating in staking"
        />
        </div>
    );
}
