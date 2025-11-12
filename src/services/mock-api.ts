// This file mocks a backend API.
// In a real application, this would be making network requests to a real server.

let isDataInitialized = false;

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
  totalVolume: 5678910,
  totalUsers: 1432,
  protocolRevenue: 12345,
  totalInvested: 8500,
  totalReturns: 125.50,
};

const initialStaking: { stakes: Stake[], stakedBalance: number, unclaimedRewards: number } = {
  stakes: [
    { id: 'stake_1', amount: 5000, plan: STAKING_PLANS[2], startDate: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { id: 'stake_2', amount: 2500, plan: STAKING_PLANS[1], startDate: Date.now() - 25 * 24 * 60 * 60 * 1000 },
  ],
  stakedBalance: 7500,
  unclaimedRewards: 88.54,
};

const initialMining: { miners: Miner[], miningPower: number, minedRewards: number } = {
  miners: [
      { id: 'miner_1', plan: MINING_PLANS[0], startDate: Date.now() - 5 * 24 * 60 * 60 * 1000, minedAmount: 60 },
  ],
  miningPower: 0.5,
  minedRewards: 60,
};

const initialLiquidity = {
  totalLipt: 500000,
  totalUsdt: 625000,
  totalLpTokens: 10000,
  volume24h: 125000,
  userPoolShare: 0.12,
  userLpTokens: 45.8,
  userFeesEarned: 55.75,
};

const initialLottery: LotteryState = {
    ticketPrice: 10,
    totalTickets: 1250,
    userTickets: [101, 256, 812],
    currentDraw: {
      id: 2,
      prizePool: 12500,
      endTime: Date.now() + 24 * 60 * 60 * 1000, 
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

const initialReferralData = {
    totalReferrals: 12,
    totalRewards: 1530.75,
    network: [
        { id: 1, level: 1, members: 5, commission: 850.50 },
        { id: 2, level: 2, members: 23, commission: 450.25 },
        { id: 3, level: 3, members: 58, commission: 180.00 },
        { id: 4, level: 4, members: 112, commission: 50.00 },
        { id: 5, level: 5, members: 250, commission: 0.00 },
    ]
};

const initialLeaderboardData = [
  { rank: 1, avatar: '123', name: 'CryptoKing', commission: 5432.10 },
  { rank: 2, avatar: '456', name: 'DeFiQueen', commission: 4876.54 },
  { rank: 3, avatar: '789', name: 'SatoshiJr', commission: 4210.98 },
  { rank: 4, avatar: '101', name: 'LamboMoon', commission: 3567.12 },
  { rank: 5, avatar: '112', name: 'ETHDev', commission: 3123.45 },
];


const initializeMockData = () => {
    if (typeof window !== 'undefined' && !isDataInitialized) {
        if (!localStorage.getItem('wallet')) saveToStorage('wallet', initialWallet);
        if (!localStorage.getItem('stats')) saveToStorage('stats', initialStats);
        if (!localStorage.getItem('staking')) saveToStorage('staking', initialStaking);
        if (!localStorage.getItem('mining')) saveToStorage('mining', initialMining);
        if (!localStorage.getItem('liquidity')) saveToStorage('liquidity', initialLiquidity);
        if (!localStorage.getItem('lottery')) saveToStorage('lottery', initialLottery);
        if (!localStorage.getItem('referral')) saveToStorage('referral', initialReferralData);
        if (!localStorage.getItem('leaderboard')) saveToStorage('leaderboard', initialLeaderboardData);
        isDataInitialized = true;
    }
}
initializeMockData();

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
  return getFromStorage('stats', initialStats);
};

export const getStakingData = async () => {
  await wait(600);
  // Simulate rewards accumulation
  const staking = getFromStorage('staking', initialStaking);
  staking.unclaimedRewards += Math.random() * 0.1;
  saveToStorage('staking', staking);
  return staking;
};

export const getMiningData = async () => {
  await wait(700);
  const mining = getFromStorage('mining', initialMining);
  mining.minedRewards += mining.miningPower / (60 * 12); // Simulate 5 sec interval
  mining.miners = mining.miners.map(m => ({ ...m, minedAmount: m.minedAmount + m.plan.power / (60*12) }))
  saveToStorage('mining', mining);
  return mining;
};

export const getLiquidityData = async () => {
  await wait(400);
  const liquidity = getFromStorage('liquidity', initialLiquidity);
  liquidity.userFeesEarned += Math.random() * 0.01;
  saveToStorage('liquidity', liquidity);
  return liquidity;
};

export const getLotteryData = async () => {
    await wait(500);
    return getFromStorage('lottery', initialLottery);
};

export const getReferralData = async () => {
    await wait(800);
    return getFromStorage('referral', initialReferralData);
};

export const getLeaderboardData = async () => {
    await wait(1200);
    return getFromStorage('leaderboard', initialLeaderboardData);
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
    if (wallet.liptBalance < liptAmount || wallet.usdtBalance < usdtAmount) {
        throw new Error('Insufficient balance');
    }
    wallet.liptBalance -= liptAmount;
    wallet.usdtBalance -= usdtAmount;
    const liquidity = getFromStorage('liquidity', initialLiquidity);
    // Dummy calculation for new LP tokens
    liquidity.userLpTokens += (liptAmount + usdtAmount) / 100;
    saveToStorage('wallet', wallet);
    saveToStorage('liquidity', liquidity);
    return { success: true };
};

export const removeLiquidity = async (lpAmount: number) => {
    await wait(1600);
    const wallet = getFromStorage('wallet', initialWallet);
    const liquidity = getFromStorage('liquidity', initialLiquidity);
    if (liquidity.userLpTokens < lpAmount) {
        throw new Error('Insufficient LP tokens');
    }
    liquidity.userLpTokens -= lpAmount;
    // Dummy calculation for returned assets
    wallet.liptBalance += lpAmount * 50;
    wallet.usdtBalance += lpAmount * 60;
    saveToStorage('wallet', wallet);
    saveToStorage('liquidity', liquidity);
    return { success: true };
};

export const activateMiner = async (plan: { name: string; cost: number; power: number; duration: number; }) => {
    await wait(1300);
    const wallet = getFromStorage('wallet', initialWallet);
    const mining = getFromStorage('mining', initialMining);
    if (wallet.liptBalance < plan.cost) {
        throw new Error('Insufficient LIPT balance');
    }
    wallet.liptBalance -= plan.cost;
    const newMiner: Miner = {
        id: `miner_${Date.now()}`,
        plan,
        startDate: Date.now(),
        minedAmount: 0,
    };
    mining.miners.push(newMiner);
    mining.miningPower += plan.power;
    saveToStorage('wallet', wallet);
    saveToStorage('mining', mining);
    return { success: true };
};

export const claimMinedRewards = async () => {
    await wait(900);
    const wallet = getFromStorage('wallet', initialWallet);
    const mining = getFromStorage('mining', initialMining);

    wallet.liptBalance += mining.minedRewards;
    mining.minedRewards = 0;
    mining.miners = mining.miners.map(m => ({ ...m, minedAmount: 0 }));

    saveToStorage('wallet', wallet);
    saveToStorage('mining', mining);
    return { success: true };
};

// Game Actions
export const spinWheel = async (bet: number, winningSegment: {value: number}) => {
    await wait(500); // Server-side validation
    const wallet = getFromStorage('wallet', initialWallet);
    if (wallet.liptBalance < bet) {
        throw new Error('Insufficient LIPT balance for bet');
    }
    const winnings = bet * winningSegment.value;
    wallet.liptBalance = wallet.liptBalance - bet + winnings;
    saveToStorage('wallet', wallet);
    return { winnings, multiplier: winningSegment.value };
}

export const placeRocketBet = async (bet: number) => {
    await wait(400);
    const wallet = getFromStorage('wallet', initialWallet);
    if (wallet.liptBalance < bet) {
        throw new Error('Insufficient LIPT balance for bet');
    }
    // Bet is "removed" from balance until cashout or crash
    wallet.liptBalance -= bet;
    saveToStorage('wallet', wallet);
    return { success: true };
}

export const cashOutRocket = async (bet: number, multiplier: number) => {
    await wait(200);
    const wallet = getFromStorage('wallet', initialWallet);
    const winnings = bet * multiplier;
    wallet.liptBalance += winnings; // Return winnings to balance
    saveToStorage('wallet', wallet);

    return { winnings };
}

export const buyLotteryTickets = async (quantity: number) => {
    await wait(1000);
    const wallet = getFromStorage('wallet', initialWallet);
    const lottery = getFromStorage('lottery', initialLottery);
    const cost = quantity * lottery.ticketPrice;
    if (wallet.liptBalance < cost) {
        throw new Error("Insufficient LIPT balance");
    }
    wallet.liptBalance -= cost;
    
    let newTickets = [];
    for(let i = 0; i < quantity; i++) {
        newTickets.push(lottery.totalTickets + i + 1);
    }
    lottery.userTickets.push(...newTickets);
    lottery.totalTickets += quantity;
    lottery.currentDraw.prizePool += cost;

    saveToStorage('wallet', wallet);
    saveToStorage('lottery', lottery);
    return { success: true };
};

export const claimLotteryPrize = async () => {
    await wait(1100);
    const wallet = getFromStorage('wallet', initialWallet);
    const lottery = getFromStorage('lottery', initialLottery);
    
    if (lottery.currentDraw.status === 'CLOSED' && lottery.currentDraw.winnerAddress === 'user123' && !lottery.currentDraw.prizeClaimed) {
        wallet.liptBalance += lottery.currentDraw.prizePool;
        lottery.currentDraw.prizeClaimed = true;
        saveToStorage('wallet', wallet);
        saveToStorage('lottery', lottery);
        return { success: true };
    }
    throw new Error("Not a winner or prize already claimed");
};
