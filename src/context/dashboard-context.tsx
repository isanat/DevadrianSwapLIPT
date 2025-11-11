'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export const STAKING_PLANS = [
  { duration: 20, apy: 12.5 },
  { duration: 30, apy: 15.0 },
  { duration: 60, apy: 20.0 },
  { duration: 90, apy: 25.0 },
];
const EARLY_UNSTAKE_PENALTY_PERCENTAGE = 10; // 10% penalty

export interface Stake {
  id: string;
  amount: number;
  startDate: number; // store as timestamp
  plan: {
    duration: number;
    apy: number;
  };
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

  // Actions
  purchaseLipt: (amount: number) => void;
  stakeLipt: (amount: number, plan: { duration: number; apy: number }) => void;
  unstakeLipt: (stakeId: string) => void;
  claimRewards: () => void;
  addLiquidity: (liptAmount: number, usdtAmount: number) => void;
  removeLiquidity: (lpAmount: number) => void;
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

  // Update stakedBalance whenever stakes change
  useEffect(() => {
    const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0);
    setStakedBalance(totalStaked);
  }, [stakes]);


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
    }, 5000); // run every 5 seconds
    return () => clearInterval(interval);
  }, [stakes]);

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
    }
  };
  
  const unstakeLipt = (stakeId: string) => {
    const stake = stakes.find(s => s.id === stakeId);
    if (!stake) return;

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
          const poolLipt = stakes.reduce((acc, s) => acc + s.amount, 0) * 0.5;
          const removedLipt = (lpAmount / lpTokens) * poolLipt; 
          const removedUsdt = (lpAmount / lpTokens) * poolLipt * liptPrice;
          
          setLpTokens(prev => prev - lpAmount);
          setLiptBalance(prev => prev + removedLipt);
          setUsdtBalance(prev => prev + removedUsdt);
          
          const removedValue = (removedLipt * liptPrice) + removedUsdt;
          setTotalValueLocked(prev => prev - removedValue);
          setPoolShare(prev => Math.max(0, prev - 0.01));
      }
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
    purchaseLipt,
    stakeLipt,
    unstakeLipt,
    claimRewards,
    addLiquidity,
    removeLiquidity
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
