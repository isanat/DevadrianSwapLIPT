'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  stakedBalance: number;
  unclaimedRewards: number;
  stakingApy: number;
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
  stakeLipt: (amount: number) => void;
  unstakeLipt: (amount: number) => void;
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
  const [stakedBalance, setStakedBalance] = useState(5000);
  const [unclaimedRewards, setUnclaimedRewards] = useState(125.7);
  const [stakingApy] = useState(12.5);
  const [totalStakers, setTotalStakers] = useState(2345);
  const [poolShare, setPoolShare] = useState(0.12);
  const [lpTokens, setLpTokens] = useState(45.8);
  const [feesEarned, setFeesEarned] = useState(55.75);
  const [referrals, setReferrals] = useState(15);
  const [referralRewards, setReferralRewards] = useState(350);

  // Simulate reward accumulation
  useEffect(() => {
    const interval = setInterval(() => {
        if (stakedBalance > 0) {
            const newRewards = (stakedBalance * (stakingApy / 100)) / (365 * 24 * 60 * 60 / 5); // APY accrual every 5 secs
            setUnclaimedRewards(prev => prev + newRewards);
        }
    }, 5000); // run every 5 seconds
    return () => clearInterval(interval);
  }, [stakedBalance, stakingApy]);

  // ======== ACTIONS ========
  const purchaseLipt = (amount: number) => {
    const cost = amount * liptPrice;
    if (usdtBalance >= cost) {
      setLiptBalance(prev => prev + amount);
      setUsdtBalance(prev => prev - cost);
    }
  };
  
  const stakeLipt = (amount: number) => {
    if (liptBalance >= amount) {
      setLiptBalance(prev => prev - amount);
      setStakedBalance(prev => prev + amount);
      setTotalValueLocked(prev => prev + (amount * liptPrice));
    }
  };
  
  const unstakeLipt = (amount: number) => {
    if (stakedBalance >= amount) {
      setStakedBalance(prev => prev - amount);
      setLiptBalance(prev => prev + amount);
      setTotalValueLocked(prev => prev - (amount * liptPrice));
    }
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
          const removedLipt = (lpAmount / lpTokens) * stakedBalance * 0.5; 
          const removedUsdt = (lpAmount / lpTokens) * stakedBalance * 0.5 * liptPrice;
          
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
    stakedBalance,
    unclaimedRewards,
    stakingApy,
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
