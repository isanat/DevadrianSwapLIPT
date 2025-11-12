// This file mocks a backend API.
// In a real application, this would be making network requests to a real server.

export const STAKING_PLANS = [
  { duration: 20, apy: 12.5 },
  { duration: 30, apy: 15.0 },
  { duration: 60, apy: 20.0 },
  { duration: 90, apy: 25.0 },
];
const EARLY_UNSTAKE_PENALTY_PERCENTAGE = 10;

export const MINING_PLANS = [
  { name: 'Basic', cost: 1000, power: 0.5, duration: 30 },
  { name: 'Advanced', cost: 5000, power: 3.0, duration: 60 },
  { name: 'Professional', cost: 10000, power: 7.5, duration: 90 },
];

export interface Stake {
  id: string;
  amount: number;
  startDate: number;
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
    power: number;
    duration: number;
  };
  minedAmount: number;
}

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
  userTickets: number[];
  totalTickets: number;
}


// --- UTILS ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};


// --- INITIAL MOCK DATA ---
const initialWallet = {
  liptBalance: 10500,
  usdtBalance: 5000,
};

const initialStats = {
  liptPrice: 1.25,
  totalValueLocked: 1234567,
  totalInvested: 0,
  totalReturns: 0,
};

const initialStaking = {
  stakes: [],
  stakedBalance: 0,
  unclaimedRewards: 0,
};

const initialMining = {
  miners: [],
  miningPower: 0,
  minedRewards: 0,
};

const initialLiquidity = {
  poolShare: 0.12,
  lpTokens: 45.8,
  feesEarned: 55.75,
};

const initialLottery = {
    ticketPrice: 10,
    totalTickets: 1250,
    userTickets: [],
    currentDraw: {
      id: 2,
      prizePool: 12500,
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
};

// Price history for chart
export const priceHistory = Array.from({ length: 20 }, (_, i) => ({
  time: `T-${20 - i}`,
  price: 1.25 + (Math.random() - 0.5) * 0.2 + i * 0.01,
}));


// --- API FUNCTIONS ---

// GETTERS
export const getWalletData = async () => {
  await wait(300);
  return getFromStorage('wallet', initialWallet);
};

export const getDashboardStats = async () => {
  await wait(500);
  let stats = getFromStorage('stats', initialStats);
  // Simulate price fluctuation
  stats.liptPrice = stats.liptPrice + (Math.random() - 0.5) * 0.01;
  saveToStorage('stats', stats);
  return stats;
};

export const getStakingData = async () => {
  await wait(600);
  return getFromStorage('staking', initialStaking);
};

export const getMiningData = async () => {
  await wait(700);
  return getFromStorage('mining', initialMining);
};

export const getLiquidityData = async () => {
  await wait(400);
  return getFromStorage('liquidity', initialLiquidity);
};

export const getLotteryData = async () => {
    await wait(500);
    const lottery = getFromStorage('lottery', initialLottery);

    // Check if the current draw has ended
    if (lottery.currentDraw.status === 'OPEN' && Date.now() >= lottery.currentDraw.endTime) {
        const winningTicket = Math.floor(Math.random() * lottery.totalTickets) + 1;
        const isUserWinner = lottery.userTickets.includes(winningTicket);

        const closedDraw: LotteryDraw = {
            ...lottery.currentDraw,
            status: 'CLOSED',
            winningTicket,
            winnerAddress: isUserWinner ? 'user123' : `0x${[...Array(10)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
            prizeClaimed: !isUserWinner,
        };

        const newDraw: LotteryDraw = {
            id: lottery.currentDraw.id + 1,
            prizePool: 1000,
            endTime: Date.now() + 24 * 60 * 60 * 1000,
            status: 'OPEN',
        };

        const updatedLotteryState: LotteryState = {
            ...lottery,
            userTickets: [],
            totalTickets: 0,
            currentDraw: newDraw,
            previousDraws: [closedDraw, ...lottery.previousDraws].slice(0, 5),
        };
        
        saveToStorage('lottery', updatedLotteryState);
        return updatedLotteryState;
    }
    
    return lottery;
};

export const getReferralData = async () => {
    await wait(800);
    return {
        totalReferrals: 15,
        totalRewards: 350,
        network: [
            { id: 1, level: 1, members: 5, commission: 120.50 },
            { id: 2, level: 2, members: 12, commission: 250.75 },
            { id: 3, level: 3, members: 25, commission: 480.00 },
            { id: 4, level: 4, members: 40, commission: 750.20 },
            { id: 5, level: 5, members: 60, commission: 1100.00 },
        ]
    };
};

export const getLeaderboardData = async () => {
    await wait(1200);
    return [
      { rank: 1, name: 'CryptoKing', commission: 2500.75, avatar: '1' },
      { rank: 2, name: 'DiamondHands', commission: 2210.50, avatar: '2' },
      { rank: 3, name: 'SatoshiJr', commission: 1980.20, avatar: '3' },
      { rank: 4, name: 'MoonLambo', commission: 1850.00, avatar: '4' },
      { rank: 5, name: 'ShibaInuFan', commission: 1600.90, avatar: '5' },
    ].sort((a, b) => b.commission - a.commission);
}

// --- ACTIONS (MUTATIONS) ---

export const purchaseLipt = async (amount: number) => {
  await wait(1000);
  const wallet = getFromStorage('wallet', initialWallet);
  const stats = getFromStorage('stats', initialStats);
  const cost = amount * stats.liptPrice;
  if (wallet.usdtBalance < cost) {
    throw new Error('Insufficient USDT balance');
  }
  wallet.usdtBalance -= cost;
  wallet.liptBalance += amount;
  saveToStorage('wallet', wallet);
  return wallet;
};

export const stakeLipt = async (amount: number, plan: { duration: number; apy: number }) => {
    await wait(1500);
    const wallet = getFromStorage('wallet', initialWallet);
    const staking = getFromStorage('staking', initialStaking);

    if (wallet.liptBalance < amount) {
        throw new Error('Insufficient LIPT balance');
    }

    const newStake: Stake = {
        id: `stake_${Date.now()}_${Math.random()}`,
        amount,
        plan,
        startDate: Date.now(),
    };

    wallet.liptBalance -= amount;
    staking.stakes.push(newStake);
    staking.stakedBalance += amount;

    saveToStorage('wallet', wallet);
    saveToStorage('staking', staking);
    return { wallet, staking };
};

export const unstakeLipt = async (stakeId: string) => {
    await wait(1200);
    const wallet = getFromStorage('wallet', initialWallet);
    const staking = getFromStorage('staking', initialStaking);

    const stakeIndex = staking.stakes.findIndex(s => s.id === stakeId);
    if (stakeIndex === -1) {
        throw new Error('Stake not found');
    }

    const stake = staking.stakes[stakeIndex];
    const now = Date.now();
    const stakeAgeInDays = (now - stake.startDate) / (1000 * 60 * 60 * 24);
    
    let amountToReturn = stake.amount;
    let penalty = 0;

    if (stakeAgeInDays < stake.plan.duration) {
      penalty = (stake.amount * EARLY_UNSTAKE_PENALTY_PERCENTAGE) / 100;
      amountToReturn = stake.amount - penalty;
    }

    wallet.liptBalance += amountToReturn;
    staking.stakedBalance -= stake.amount;
    staking.stakes.splice(stakeIndex, 1);
    
    saveToStorage('wallet', wallet);
    saveToStorage('staking', staking);
    return { penalty };
};

export const claimStakingRewards = async () => {
    await wait(800);
    const wallet = getFromStorage('wallet', initialWallet);
    const staking = getFromStorage('staking', initialStaking);

    wallet.liptBalance += staking.unclaimedRewards;
    staking.unclaimedRewards = 0;

    saveToStorage('wallet', wallet);
    saveToStorage('staking', staking);
    return { wallet, staking };
};

export const addLiquidity = async (liptAmount: number, usdtAmount: number) => {
    await wait(1800);
    const wallet = getFromStorage('wallet', initialWallet);
    const liquidity = getFromStorage('liquidity', initialLiquidity);

    if (wallet.liptBalance < liptAmount || wallet.usdtBalance < usdtAmount) {
        throw new Error('Insufficient balance');
    }

    wallet.liptBalance -= liptAmount;
    wallet.usdtBalance -= usdtAmount;
    
    const newLpTokens = Math.sqrt(liptAmount * usdtAmount) / 10;
    liquidity.lpTokens += newLpTokens;
    liquidity.poolShare += 0.01; // Mock share increase

    saveToStorage('wallet', wallet);
    saveToStorage('liquidity', liquidity);
    return { wallet, liquidity };
};

export const removeLiquidity = async (lpAmount: number) => {
    await wait(1600);
    const wallet = getFromStorage('wallet', initialWallet);
    const liquidity = getFromStorage('liquidity', initialLiquidity);
    const stats = getFromStorage('stats', initialStats);

    if (liquidity.lpTokens < lpAmount) {
        throw new Error('Insufficient LP tokens');
    }

    const totalLPLiquidity = (stats.totalValueLocked * 0.2); 
    const userShareValue = (lpAmount / liquidity.lpTokens) * totalLPLiquidity;
    const removedLipt = (userShareValue / 2) / stats.liptPrice;
    const removedUsdt = userShareValue / 2;

    liquidity.lpTokens -= lpAmount;
    wallet.liptBalance += removedLipt;
    wallet.usdtBalance += removedUsdt;

    saveToStorage('wallet', wallet);
    saveToStorage('liquidity', liquidity);
    return { wallet, liquidity };
};

export const activateMiner = async (plan: { name: string; cost: number; power: number; duration: number; }) => {
    await wait(1300);
    const wallet = getFromStorage('wallet', initialWallet);
    const mining = getFromStorage('mining', initialMining);

    if (wallet.liptBalance < plan.cost) {
        throw new Error('Insufficient LIPT to activate miner');
    }

    const newMiner: Miner = {
        id: `miner_${Date.now()}_${Math.random()}`,
        plan,
        startDate: Date.now(),
        minedAmount: 0,
    };

    wallet.liptBalance -= plan.cost;
    mining.miners.push(newMiner);
    mining.miningPower += plan.power;
    
    saveToStorage('wallet', wallet);
    saveToStorage('mining', mining);
    return { wallet, mining };
};

export const claimMinedRewards = async () => {
    await wait(900);
    const wallet = getFromStorage('wallet', initialWallet);
    const mining = getFromStorage('mining', initialMining);

    wallet.liptBalance += mining.minedRewards;
    mining.minedRewards = 0;

    saveToStorage('wallet', wallet);
    saveToStorage('mining', mining);
    return { wallet, mining };
};

// Game Actions
export const spinWheel = async (bet: number, winningSegment: {value: number}) => {
    await wait(500); // Server-side validation
    const wallet = getFromStorage('wallet', initialWallet);
    if (wallet.liptBalance < bet) {
        throw new Error('Insufficient balance for this bet.');
    }
    wallet.liptBalance -= bet;
    const winnings = bet * winningSegment.value;
    wallet.liptBalance += winnings;

    saveToStorage('wallet', wallet);
    return { winnings, multiplier: winningSegment.value };
}

export const placeRocketBet = async (bet: number) => {
    await wait(400);
    const wallet = getFromStorage('wallet', initialWallet);
    if (wallet.liptBalance < bet) {
        throw new Error('Insufficient balance for this bet.');
    }
    wallet.liptBalance -= bet;
    saveToStorage('wallet', wallet);
    return { success: true };
}

export const cashOutRocket = async (bet: number, multiplier: number) => {
    await wait(200);
    const wallet = getFromStorage('wallet', initialWallet);
    const winnings = bet * multiplier;
    wallet.liptBalance += winnings;
    saveToStorage('wallet', wallet);
    return { winnings };
}

export const buyLotteryTickets = async (quantity: number) => {
    await wait(1000);
    const wallet = getFromStorage('wallet', initialWallet);
    const lottery = getFromStorage('lottery', initialLottery);
    const cost = quantity * lottery.ticketPrice;
    
    if (wallet.liptBalance < cost) {
      throw new Error('Insufficient LIPT balance');
    }

    wallet.liptBalance -= cost;
    const newTicketNumbers = Array.from({length: quantity}, (_, i) => lottery.totalTickets + i + 1);
    lottery.totalTickets += quantity;
    lottery.userTickets.push(...newTicketNumbers);
    lottery.currentDraw.prizePool += cost;

    saveToStorage('wallet', wallet);
    saveToStorage('lottery', lottery);
    return { success: true };
};

export const claimLotteryPrize = async () => {
    await wait(1100);
    const wallet = getFromStorage('wallet', initialWallet);
    const lottery = getFromStorage('lottery', initialLottery);

    if (lottery.currentDraw.status !== 'CLOSED' || lottery.currentDraw.prizeClaimed || lottery.currentDraw.winnerAddress !== 'user123') {
        throw new Error('Not eligible to claim prize');
    }

    wallet.liptBalance += lottery.currentDraw.prizePool;
    lottery.currentDraw.prizeClaimed = true;

    saveToStorage('wallet', wallet);
    saveToStorage('lottery', lottery);
    return { success: true };
};


// Simulate reward accumulation in the background
if (typeof window !== 'undefined') {
    setInterval(() => {
        const staking = getFromStorage('staking', initialStaking);
        if (staking.stakes.length > 0) {
            let newRewards = 0;
            staking.stakes.forEach(stake => {
                const secondsInYear = 365 * 24 * 60 * 60;
                const rewardPerSecond = (stake.amount * (stake.plan.apy / 100)) / secondsInYear;
                newRewards += rewardPerSecond * 5; 
            });
            staking.unclaimedRewards += newRewards;
            saveToStorage('staking', staking);
        }

        const mining = getFromStorage('mining', initialMining);
        if (mining.miners.length > 0) {
          let newMined = 0;
          let totalPower = 0;
          mining.miners.forEach(miner => {
            const isExpired = Date.now() > miner.startDate + miner.plan.duration * 24 * 60 * 60 * 1000;
            if (!isExpired) {
              const rewardPerSecond = miner.plan.power / 3600;
              const generated = rewardPerSecond * 5;
              newMined += generated;
              miner.minedAmount += generated;
              totalPower += miner.plan.power;
            }
          });
          mining.minedRewards += newMined;
          mining.miningPower = totalPower;
          saveToStorage('mining', mining);
        }
    }, 5000);
}
