'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { get } from 'lodash';

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

// --- LOTTERY TYPES ---
export interface LotteryDraw {
  id: number;
  prizePool: number;
  endTime: number;
  status: 'OPEN' | 'CLOSED';
  winningTicket?: number;
  winnerAddress?: string;
  prizeClaimed?: boolean;
}

export interface LotteryState {
  ticketPrice: number;
  currentDraw: LotteryDraw;
  previousDraws: LotteryDraw[];
  userTickets: number[]; // Numbers of tickets bought by the user for the current draw
  totalTickets: number;
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

  // Lottery
  lottery: LotteryState;

  // Actions
  purchaseLipt: (amount: number) => void;
  updateLiptBalance: (amount: number) => void;
  stakeLipt: (amount: number, plan: { duration: number; apy: number }) => void;
  unstakeLipt: (stakeId: string) => { penalty: number };
  claimRewards: () => void;
  addLiquidity: (liptAmount: number, usdtAmount: number) => void;
  removeLiquidity: (lpAmount: number) => void;
  activateMiner: (plan: { name: string; cost: number; power: number; duration: number; }) => void;
  claimMinedRewards: () => void;
  buyLotteryTickets: (quantity: number) => void;
  claimLotteryPrize: () => void;
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

  // Lottery state
  const [lottery, setLottery] = useState<LotteryState>({
    ticketPrice: 10,
    totalTickets: 1250,
    userTickets: [],
    currentDraw: {
      id: 2,
      prizePool: 12500, // 1250 tickets * 10 LIPT
      endTime: Date.now() + 60 * 1000, // 1 minute from now
      status: 'OPEN',
    },
    previousDraws: [
      {
        id: 1,
        prizePool: 11800,
        endTime: Date.now() - 1,
        status: 'CLOSED',
        winningTicket: 345,
        winnerAddress: '0xABC...DEF',
        prizeClaimed: true,
      },
    ],
  });


  // ======== ACTIONS ========
  const purchaseLipt = (amount: number) => {
    const cost = amount * liptPrice;
    if (usdtBalance >= cost) {
      setLiptBalance(prev => prev + amount);
      setUsdtBalance(prev => prev - cost);
    }
  };
  
  const updateLiptBalance = (amount: number) => {
    setLiptBalance(prev => prev + amount);
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

  const buyLotteryTickets = (quantity: number) => {
    const cost = quantity * lottery.ticketPrice;
    if (liptBalance < cost) {
      throw new Error('Insufficient LIPT balance');
    }

    setLiptBalance(prev => prev - cost);
    setLottery(prev => {
      const newTicketNumbers = Array.from({length: quantity}, (_, i) => prev.totalTickets + i + 1);

      return {
        ...prev,
        totalTickets: prev.totalTickets + quantity,
        userTickets: [...prev.userTickets, ...newTicketNumbers],
        currentDraw: {
          ...prev.currentDraw,
          prizePool: prev.currentDraw.prizePool + cost,
        },
      };
    });
  };

  const claimLotteryPrize = () => {
    if (lottery.currentDraw.status === 'CLOSED' && !lottery.currentDraw.prizeClaimed) {
      setLiptBalance(prev => prev + lottery.currentDraw.prizePool);
      setLottery(prev => ({
        ...prev,
        currentDraw: {
          ...prev.currentDraw,
          prizeClaimed: true,
        },
      }));
    }
  };
  
  const _triggerLotteryDraw = () => {
    setLottery(prev => {
      const { currentDraw, totalTickets, userTickets } = prev;
      if (currentDraw.status !== 'OPEN' || Date.now() < currentDraw.endTime) {
        return prev;
      }

      // Simulate drawing a winner
      const winningTicket = Math.floor(Math.random() * totalTickets) + 1;
      const isUserWinner = userTickets.includes(winningTicket);
      
      const closedDraw: LotteryDraw = {
        ...currentDraw,
        status: 'CLOSED',
        winningTicket,
        winnerAddress: isUserWinner ? 'user123' : `0x${[...Array(10)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
        prizeClaimed: !isUserWinner, // If user is not the winner, mark as claimed to not show banner
      };
      
      // Start a new draw after a delay, first show the results
      setTimeout(() => {
        setLottery(currentLotteryState => {
           const newDraw: LotteryDraw = {
            id: currentLotteryState.currentDraw.id + 1,
            prizePool: 1000, // Base prize
            endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            status: 'OPEN',
          };
          
          return {
            ...currentLotteryState,
            userTickets: [],
            totalTickets: 0,
            currentDraw: newDraw,
            previousDraws: [closedDraw, ...currentLotteryState.previousDraws].slice(0, 5),
          }
        });
      }, 10000); // Wait 10 seconds before starting the new draw


      return {
        ...prev,
        currentDraw: closedDraw, // First, update the current draw to be closed
      };
    });
  };

  // --- GLOBAL EFFECTS ---

  // Update derived states
  useEffect(() => {
    const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0);
    setStakedBalance(totalStaked);

    const totalStakedValue = totalStaked * liptPrice;
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
        // Staking rewards
        if (stakes.length > 0) {
            let newRewards = 0;
            stakes.forEach(stake => {
                const secondsInYear = 365 * 24 * 60 * 60;
                const rewardPerSecond = (stake.amount * (stake.plan.apy / 100)) / secondsInYear;
                newRewards += rewardPerSecond * 5; 
            });
            setUnclaimedRewards(prev => prev + newRewards);
        }
        // LP Fees
        setFeesEarned(prev => prev + 0.05 * lpTokens); 

        // Mining rewards
        setMiners(currentMiners => {
          if (currentMiners.length === 0) return [];
    
          let newMined = 0;
          const updatedMiners = currentMiners.map(miner => {
            const isExpired = Date.now() > miner.startDate + miner.plan.duration * 24 * 60 * 60 * 1000;
            if (!isExpired) {
              const rewardPerSecond = miner.plan.power / 3600;
              newMined += rewardPerSecond * 5;
              return { ...miner, minedAmount: miner.minedAmount + rewardPerSecond * 5 };
            }
            return miner;
          });
    
          setMinedRewards(prev => prev + newMined);
          return updatedMiners;
        });
    }, 5000); 
    return () => clearInterval(interval);
  }, [stakes, lpTokens]);

  // Lottery countdown and trigger
  useEffect(() => {
    if (lottery.currentDraw.status === 'OPEN' && Date.now() >= lottery.currentDraw.endTime) {
      _triggerLotteryDraw();
    }
    
    const timer = setInterval(() => {
      if (lottery.currentDraw.status === 'OPEN' && Date.now() >= lottery.currentDraw.endTime) {
        _triggerLotteryDraw();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lottery.currentDraw.endTime, lottery.currentDraw.status]);

  // Simulate real-time LIPT price change
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setLiptPrice(prevPrice => {
        const change = (Math.random() - 0.5) * 0.01; 
        const newPrice = prevPrice + change;
        return newPrice > 0 ? newPrice : 0.01; 
      });
    }, 3000); 

    return () => clearInterval(priceInterval);
  }, []);

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
    lottery,
    purchaseLipt,
    updateLiptBalance,
    stakeLipt,
    unstakeLipt,
    claimRewards,
    addLiquidity,
    removeLiquidity,
    activateMiner,
    claimMinedRewards,
    buyLotteryTickets,
    claimLotteryPrize,
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

    