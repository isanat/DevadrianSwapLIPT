'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export const STAKING_PLANS = [
  { duration: 20, apy: 12.5 },
  { duration: 30, apy: 15.0 },
  { duration: 60, apy: 20.0 },
  { duration: 90, apy: 25.0 },
];
const EARLY_UNSTAKE_PENALTY_PERCENTAGE = 10; // 10% penalty

export const MINING_PLANS = [
  { name: 'Basic', cost: 1000, power: 0.5, duration: 30 }, // LIPT/hour
  { name: 'Advanced', cost: 5000, power: 3.0, duration: 60 },
  { name: 'Professional', cost: 10000, power: 7.5, duration: 90 },
];

export interface Stake {
  id: string;
  amount: number;
  startDate: number; // store as timestamp
  plan: {
    duration: number;
    apy: number;
  };
}

export interface Miner {
  id: string;
  startDate: number;
  plan: {
    name: string;
    cost: number;
    power: number; // LIPT per hour
    duration: number; // days
  };
  minedAmount: number;
}


// Define the shape of the context data
interface DashboardContextData {
  // Balances
  liptBalance: number;
  usdtBalance: number;
  
  // LIPT Token
  liptPrice: number;
  priceChange: number;
  
  // TVL
  totalValueLocked: number;
  
  // Staking
  stakes: Stake[];
  stakedBalance: number;
  unclaimedRewards: number;
  totalStakers: number;
  
  // Liquidity Pool
  poolShare: number;
  lpTokens: number;
  feesEarned: number;
  
  // Referral
  referrals: number;
  referralRewards: number;

  // Investor focused stats
  totalInvested: number;
  totalReturns: number;

  // Mining
  miners: Miner[];
  miningPower: number;
  minedRewards: number;

  // Actions
  purchaseLipt: (amount: number) => void;
  stakeLipt: (amount: number, plan: { duration: number; apy: number }) => void;
  unstakeLipt: (stakeId: string) => { penalty: number };
  claimRewards: () => void;
  addLiquidity: (liptAmount: number, usdtAmount: number) => void;
  removeLiquidity: (lpAmount: number) => void;
  activateMiner: (plan: { name: string; cost: number; power: number; duration: number; }) => void;
  claimMinedRewards: () => void;
}

// Create the context with a default undefined value
const DashboardContext = createContext<DashboardContextData | undefined>(undefined);

// Define the props for the provider
interface DashboardProviderProps {
  children: ReactNode;
}

// Create the provider component
export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  // ======== MOCK DATA STATE ========
  const [liptBalance, setLiptBalance] = useState(10500);
  const [usdtBalance, setUsdtBalance] = useState(5000);
  const [liptPrice, setLiptPrice] = useState(1.25);
  const [priceChange, setPriceChange] = useState(2.1);
  const [totalValueLocked, setTotalValueLocked] = useState(1234567);
  
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [unclaimedRewards, setUnclaimedRewards] = useState(0);

  const [totalStakers, setTotalStakers] = useState(2345);
  const [poolShare, setPoolShare] = useState(0.12);
  const [lpTokens, setLpTokens] = useState(45.8);
  const [feesEarned, setFeesEarned] = useState(55.75);
  const [referrals, setReferrals] = useState(15);
  const [referralRewards, setReferralRewards] = useState(350);

  // Investor focused stats
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);

  // Mining state
  const [miners, setMiners] = useState<Miner[]>([]);
  const [miningPower, setMiningPower] = useState(0);
  const [minedRewards, setMinedRewards] = useState(0);


  // Update derived states
  useEffect(() => {
    const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0);
    setStakedBalance(totalStaked);

    const totalStakedValue = totalStaked * liptPrice;
    // Assuming LP tokens value is somewhat represented by fees earned for simplicity
    const totalLPValue = (lpTokens / (poolShare / 100)) * (feesEarned / poolShare) || 0;
    setTotalInvested(totalStakedValue + totalLPValue);

    const rewardsValue = unclaimedRewards * liptPrice;
    setTotalReturns(rewardsValue + feesEarned);
    
    const totalMiningPower = miners.reduce((sum, miner) => {
      const isExpired = Date.now() > miner.startDate + miner.plan.duration * 24 * 60 * 60 * 1000;
      return isExpired ? sum : sum + miner.plan.power;
    }, 0);
    setMiningPower(totalMiningPower);

  }, [stakes, liptPrice, lpTokens, poolShare, feesEarned, unclaimedRewards, miners]);


  // Simulate reward accumulation
  useEffect(() => {
    const interval = setInterval(() => {
        if (stakes.length > 0) {
            let newRewards = 0;
            stakes.forEach(stake => {
                const secondsInYear = 365 * 24 * 60 * 60;
                const rewardPerSecond = (stake.amount * (stake.plan.apy / 100)) / secondsInYear;
                newRewards += rewardPerSecond * 5; // new rewards for 5 seconds
            });
            setUnclaimedRewards(prev => prev + newRewards);
        }
        setFeesEarned(prev => prev + 0.05 * lpTokens); // Simulate LP fee earnings

        if (miners.length > 0) {
          let newMined = 0;
          const updatedMiners = miners.map(miner => {
            const isExpired = Date.now() > miner.startDate + miner.plan.duration * 24 * 60 * 60 * 1000;
            if (!isExpired) {
              const rewardPerSecond = miner.plan.power / 3600;
              newMined += rewardPerSecond * 5;
              return { ...miner, minedAmount: miner.minedAmount + rewardPerSecond * 5 };
            }
            return miner;
          }).filter(miner => !isExpired);
          setMinedRewards(prev => prev + newMined);
          // setMiners(updatedMiners); // This can cause issues if not handled carefully, better to just let rewards accumulate
        }

    }, 5000); // run every 5 seconds
    return () => clearInterval(interval);
  }, [stakes, lpTokens, miners]);

  // Simulate real-time LIPT price change
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setLiptPrice(prevPrice => {
        const change = (Math.random() - 0.5) * 0.01; // small random change
        const newPrice = prevPrice + change;
        return newPrice > 0 ? newPrice : 0.01; // ensure price doesn't go below zero
      });
    }, 3000); // update every 3 seconds

    return () => clearInterval(priceInterval);
  }, []);

  // ======== ACTIONS ========
  const purchaseLipt = (amount: number) => {
    const cost = amount * liptPrice;
    if (usdtBalance >= cost) {
      setLiptBalance(prev => prev + amount);
      setUsdtBalance(prev => prev - cost);
    }
  };
  
  const stakeLipt = (amount: number, plan: { duration: number; apy: number }) => {
    if (liptBalance >= amount) {
      const newStake: Stake = {
        id: `stake_${Date.now()}_${Math.random()}`,
        amount,
        plan,
        startDate: Date.now(),
      };
      setLiptBalance(prev => prev - amount);
      setStakes(prev => [...prev, newStake]);
      setTotalValueLocked(prev => prev + (amount * liptPrice));
      setTotalStakers(prev => prev + 1);
    }
  };
  
  const unstakeLipt = (stakeId: string) => {
    const stake = stakes.find(s => s.id === stakeId);
    if (!stake) return { penalty: 0 };

    const now = Date.now();
    const stakeAgeInDays = (now - stake.startDate) / (1000 * 60 * 60 * 24);
    
    let amountToReturn = stake.amount;
    let penalty = 0;

    if (stakeAgeInDays < stake.plan.duration) {
      penalty = (stake.amount * EARLY_UNSTAKE_PENALTY_PERCENTAGE) / 100;
      amountToReturn = stake.amount - penalty;
    }

    setStakes(prev => prev.filter(s => s.id !== stakeId));
    setLiptBalance(prev => prev + amountToReturn);
    setTotalValueLocked(prev => prev - (stake.amount * liptPrice));
    setTotalStakers(prev => prev - 1);
    
    return { penalty };
  };
  
  const claimRewards = () => {
    setLiptBalance(prev => prev + unclaimedRewards);
    setUnclaimedRewards(0);
  };
  
  const addLiquidity = (liptAmount: number, usdtAmount: number) => {
      if(liptBalance >= liptAmount && usdtBalance >= usdtAmount){
          setLiptBalance(prev => prev - liptAmount);
          setUsdtBalance(prev => prev - usdtAmount);
          const addedValue = (liptAmount * liptPrice) + usdtAmount;
          setTotalValueLocked(prev => prev + addedValue);
          // Mock LP token calculation
          const newLpTokens = Math.sqrt(liptAmount * usdtAmount) / 10;
          setLpTokens(prev => prev + newLpTokens);
          // Mock pool share increase
          setPoolShare(prev => prev + 0.01);
      }
  };
  
  const removeLiquidity = (lpAmount: number) => {
      if(lpTokens >= lpAmount) {
          // Mock calculation of returned assets
          const totalLPLiquidity = (totalValueLocked * 0.2); // Assume 20% of TVL is this LP
          const userShareValue = (lpAmount / lpTokens) * totalLPLiquidity;

          const removedLipt = (userShareValue / 2) / liptPrice;
          const removedUsdt = userShareValue / 2;
          
          setLpTokens(prev => prev - lpAmount);
          setLiptBalance(prev => prev + removedLipt);
          setUsdtBalance(prev => prev + removedUsdt);
          
          const removedValue = (removedLipt * liptPrice) + removedUsdt;
          setTotalValueLocked(prev => prev - removedValue);
          setPoolShare(prev => Math.max(0, prev - 0.01 * (lpAmount/lpTokens)));
      }
  };

  const activateMiner = (plan: { name: string; cost: number; power: number; duration: number; }) => {
    if (liptBalance >= plan.cost) {
      const newMiner: Miner = {
        id: `miner_${Date.now()}_${Math.random()}`,
        plan,
        startDate: Date.now(),
        minedAmount: 0,
      };
      setLiptBalance(prev => prev - plan.cost);
      setMiners(prev => [...prev, newMiner]);
      setTotalValueLocked(prev => prev + (plan.cost * liptPrice));
    }
  };

  const claimMinedRewards = () => {
    setLiptBalance(prev => prev + minedRewards);
    setMinedRewards(0);
  };


  const value: DashboardContextData = {
    liptBalance,
    usdtBalance,
    liptPrice,
    priceChange,
    totalValueLocked,
    stakes,
    stakedBalance,
    unclaimedRewards,
    totalStakers,
    poolShare,
    lpTokens,
    feesEarned,
    referrals,
    referralRewards,
    totalInvested,
    totalReturns,
    miners,
    miningPower,
    minedRewards,
    purchaseLipt,
    stakeLipt,
    unstakeLipt,
    claimRewards,
    addLiquidity,
    removeLiquidity,
    activateMiner,
    claimMinedRewards
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Create a custom hook to use the context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
