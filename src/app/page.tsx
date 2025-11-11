import { Header } from '@/components/layout/header';
import { StakingPool } from '@/components/dashboard/staking-pool';
import { LiquidityPool } from '@/components/dashboard/liquidity-pool';
import { AppShell } from '@/components/layout/app-shell';

export default function Home() {
  return (
    <AppShell>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <StakingPool />
        <LiquidityPool />
      </div>
    </AppShell>
  );
}
