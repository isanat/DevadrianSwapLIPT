// This file mocks a backend API.
// In a real application, this would be making network requests to a real server.

// Most of the logic has been commented out to prepare for real blockchain integration.
// Components will now show their loading/empty states instead of using this mock data.

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
  // const stored = localStorage.getItem(key);
  // return stored ? JSON.parse(stored) : defaultValue;
  return defaultValue; // Always return default to ensure no mock data is used
};

const saveToStorage = <T>(key: string, value: T) => {
  // if (typeof window === 'undefined') return;
  // localStorage.setItem(key, JSON.stringify(value));
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
  // await wait(300);
  // return getFromStorage('wallet', initialWallet);
  return undefined;
};

export const getDashboardStats = async () => {
  // await wait(500);
  // return getFromStorage('stats', initialStats);
  return undefined;
};

export const getStakingData = async () => {
  // await wait(600);
  // return getFromStorage('staking', initialStaking);
  return undefined;
};

export const getMiningData = async () => {
  // await wait(700);
  // return getFromStorage('mining', initialMining);
  return undefined;
};

export const getLiquidityData = async () => {
  // await wait(400);
  // return getFromStorage('liquidity', initialLiquidity);
  return undefined;
};

export const getLotteryData = async () => {
    // await wait(500);
    // return getFromStorage('lottery', initialLottery);
    return undefined;
};

export const getReferralData = async () => {
    // await wait(800);
    return undefined;
};

export const getLeaderboardData = async () => {
    // await wait(1200);
    return undefined;
}

// --- ACTIONS (MUTATIONS) ---

export const purchaseLipt = async (amount: number) => {
  await wait(1000);
  console.log("Mock purchaseLipt called. In a real app, this would be a blockchain transaction.");
  // const wallet = getFromStorage('wallet', initialWallet);
  // const stats = getFromStorage('stats', initialStats);
  // const cost = amount * stats.liptPrice;
  // if (wallet.usdtBalance < cost) {
  //   throw new Error('Insufficient USDT balance');
  // }
  // wallet.usdtBalance -= cost;
  // wallet.liptBalance += amount;
  // saveToStorage('wallet', wallet);
  // return wallet;
  return Promise.resolve();
};

export const stakeLipt = async (amount: number, plan: { duration: number; apy: number }) => {
    await wait(1500);
    console.log("Mock stakeLipt called. In a real app, this would be a blockchain transaction.");
    // const wallet = getFromStorage('wallet', initialWallet);
    // const staking = getFromStorage('staking', initialStaking);

    // if (wallet.liptBalance < amount) {
    //     throw new Error('Insufficient LIPT balance');
    // }

    // const newStake: Stake = {
    //     id: `stake_${Date.now()}_${Math.random()}`,
    //     amount,
    //     plan,
    //     startDate: Date.now(),
    // };

    // wallet.liptBalance -= amount;
    // staking.stakes.push(newStake);
    // staking.stakedBalance += amount;

    // saveToStorage('wallet', wallet);
    // saveToStorage('staking', staking);
    // return { wallet, staking };
    return Promise.resolve();
};

export const unstakeLipt = async (stakeId: string) => {
    await wait(1200);
    console.log("Mock unstakeLipt called. In a real app, this would be a blockchain transaction.");
    // const wallet = getFromStorage('wallet', initialWallet);
    // const staking = getFromStorage('staking', initialStaking);

    // const stakeIndex = staking.stakes.findIndex(s => s.id === stakeId);
    // if (stakeIndex === -1) {
    //     throw new Error('Stake not found');
    // }

    // const stake = staking.stakes[stakeIndex];
    // const now = Date.now();
    // const stakeAgeInDays = (now - stake.startDate) / (1000 * 60 * 60 * 24);
    
    // let amountToReturn = stake.amount;
    // let penalty = 0;

    // if (stakeAgeInDays < stake.plan.duration) {
    //   penalty = (stake.amount * EARLY_UNSTAKE_PENALTY_PERCENTAGE) / 100;
    //   amountToReturn = stake.amount - penalty;
    // }

    // wallet.liptBalance += amountToReturn;
    // staking.stakedBalance -= stake.amount;
    // staking.stakes.splice(stakeIndex, 1);
    
    // saveToStorage('wallet', wallet);
    // saveToStorage('staking', staking);
    return { penalty: 0 };
};

export const claimStakingRewards = async () => {
    await wait(800);
    console.log("Mock claimStakingRewards called. In a real app, this would be a blockchain transaction.");
    // const wallet = getFromStorage('wallet', initialWallet);
    // const staking = getFromStorage('staking', initialStaking);

    // wallet.liptBalance += staking.unclaimedRewards;
    // staking.unclaimedRewards = 0;

    // saveToStorage('wallet', wallet);
    // saveToStorage('staking', staking);
    // return { wallet, staking };
    return Promise.resolve();
};

export const addLiquidity = async (liptAmount: number, usdtAmount: number) => {
    await wait(1800);
    console.log("Mock addLiquidity called. In a real app, this would be a blockchain transaction.");
    return Promise.resolve();
};

export const removeLiquidity = async (lpAmount: number) => {
    await wait(1600);
    console.log("Mock removeLiquidity called. In a real app, this would be a blockchain transaction.");
    return Promise.resolve();
};

export const activateMiner = async (plan: { name: string; cost: number; power: number; duration: number; }) => {
    await wait(1300);
    console.log("Mock activateMiner called. In a real app, this would be a blockchain transaction.");
    return Promise.resolve();
};

export const claimMinedRewards = async () => {
    await wait(900);
    console.log("Mock claimMinedRewards called. In a real app, this would be a blockchain transaction.");
    return Promise.resolve();
};

// Game Actions
export const spinWheel = async (bet: number, winningSegment: {value: number}) => {
    await wait(500); // Server-side validation
    console.log("Mock spinWheel called. In a real app, this would be a blockchain transaction.");
    const winnings = bet * winningSegment.value;
    return { winnings, multiplier: winningSegment.value };
}

export const placeRocketBet = async (bet: number) => {
    await wait(400);
    console.log("Mock placeRocketBet called. In a real app, this would be a blockchain transaction.");
    return { success: true };
}

export const cashOutRocket = async (bet: number, multiplier: number) => {
    await wait(200);
    console.log("Mock cashOutRocket called. In a real app, this would be a blockchain transaction.");
    const winnings = bet * multiplier;
    return { winnings };
}

export const buyLotteryTickets = async (quantity: number) => {
    await wait(1000);
    console.log("Mock buyLotteryTickets called. In a real app, this would be a blockchain transaction.");
    return { success: true };
};

export const claimLotteryPrize = async () => {
    await wait(1100);
    console.log("Mock claimLotteryPrize called. In a real app, this would be a blockchain transaction.");
    return { success: true };
};
