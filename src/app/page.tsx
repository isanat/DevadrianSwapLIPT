import { DashboardProvider } from '@/context/dashboard-context';
import { Header } from '@/components/layout/header';
import { StatsGroup } from '@/components/dashboard/stats-group';
import { TokenPurchase } from '@/components/dashboard/token-purchase';
import { StakingPool } from '@/components/dashboard/staking-pool';
import { LiquidityPool } from '@/components/dashboard/liquidity-pool';
import { ReferralProgram } from '@/components/dashboard/referral-program';

export default function Home() {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
          <StatsGroup />

          <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 flex flex-col gap-4">
              <StakingPool />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <TokenPurchase />
              <ReferralProgram />
            </div>
          </div>
          
          <div className="grid gap-4 md:gap-8">
            <LiquidityPool />
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
