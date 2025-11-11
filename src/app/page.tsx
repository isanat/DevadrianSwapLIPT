import { Header } from '@/components/layout/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TokenPurchase } from '@/components/dashboard/token-purchase';
import { StakingPool } from '@/components/dashboard/staking-pool';
import { LiquidityPool } from '@/components/dashboard/liquidity-pool';
import { ReferralProgram } from '@/components/dashboard/referral-program';
import { TrendingUp, Banknote, Coins, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <StatsCard
            title="LIPT Token Price"
            value="$1.25"
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description="+2.1% from last hour"
          />
          <StatsCard
            title="Total Value Locked"
            value="$1,234,567"
            icon={<Banknote className="h-5 w-5 text-primary" />}
            description="Across all pools"
          />
          <StatsCard
            title="Your LIPT Balance"
            value="10,500 LIPT"
            icon={<Coins className="h-5 w-5 text-primary" />}
            description="In your wallet"
          />
          <StatsCard
            title="Total Stakers"
            value="2,345"
            icon={<Users className="h-5 w-5 text-primary" />}
            description="Participating in staking"
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-4 row-start-2 xl:row-start-1">
            <TokenPurchase />
            <ReferralProgram />
          </div>
          <div className="xl:col-span-2 row-start-1">
            <StakingPool />
          </div>
        </div>
        
        <div className="grid gap-4 md:gap-8">
          <LiquidityPool />
        </div>
      </main>
    </div>
  );
}
