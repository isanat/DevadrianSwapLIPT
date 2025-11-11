import { Header } from '@/components/layout/header';
import { StakingPool } from '@/components/dashboard/staking-pool';
import { LiquidityPool } from '@/components/dashboard/liquidity-pool';
import { StatsGroup } from '@/components/dashboard/stats-group';
import { TokenPurchase } from '@/components/dashboard/token-purchase';
import { ReferralDashboard } from '@/components/dashboard/referral-program';
import { MiningPool } from '@/components/dashboard/mining-pool';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
         <div className="space-y-8">
            <StatsGroup />
            <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-4 md:gap-8 auto-rows-fr">
                <StakingPool />
                <MiningPool />
              </div>
              <div className="grid gap-4 md:gap-8 auto-rows-fr">
                <LiquidityPool />
                <TokenPurchase />
              </div>
            </div>
            <ReferralDashboard />
        </div>
      </main>
    </div>
  );
}
