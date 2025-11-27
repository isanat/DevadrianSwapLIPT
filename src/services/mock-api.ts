// This file mocks a backend API.
// In a real application, this would be making network requests to a real server.

import { CONTRACT_ADDRESSES } from '../config/contracts';

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
  minerId?: number; // ID numérico para usar no contrato (opcional para compatibilidade)
  startDate: number;
  plan: {
    name: string;
    cost: number;
    power: number;
    duration: number;
  };
  minedAmount: number;
  rewardsClaimed?: number; // Total já claimado (opcional)
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

const FIXED_NOW = 1700000000000; // evita variação SSR/CSR

const initialStaking: { stakes: Stake[], stakedBalance: number, unclaimedRewards: number } = {
  stakes: [
    { id: 'stake_1', amount: 5000, plan: STAKING_PLANS[2], startDate: FIXED_NOW - 10 * 24 * 60 * 60 * 1000 },
    { id: 'stake_2', amount: 2500, plan: STAKING_PLANS[1], startDate: FIXED_NOW - 25 * 24 * 60 * 60 * 1000 },
  ],
  stakedBalance: 7500,
  unclaimedRewards: 88.54,
};

const initialMining: { miners: Miner[], miningPower: number, minedRewards: number } = {
  miners: [
      { id: 'miner_1', plan: MINING_PLANS[0], startDate: FIXED_NOW - 5 * 24 * 60 * 60 * 1000, minedAmount: 60 },
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
// Deterministic price history to avoid hydration mismatches
export const priceHistory = Array.from({ length: 20 }, (_, i) => ({
  time: `T-${20 - i}`,
  price: 1.25 + i * 0.01,
}));


// --- API FUNCTIONS ---

// GETTERS
export const getWalletData = async (userAddress: string) => {
  if (!userAddress) {
    // Se não há endereço, retornar valores zerados
    return {
      liptBalance: 0,
      usdtBalance: 0,
    };
  }

  try {
    // Importar funções do web3-api
    const { getWalletBalances, getTokenDecimals } = await import('./web3-api');
    const { CONTRACT_ADDRESSES } = await import('../config/contracts');
    
    const balances = await getWalletBalances(userAddress as any);
    const [liptDecimals, usdtDecimals] = await Promise.all([
      getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any),
      getTokenDecimals(CONTRACT_ADDRESSES.mockUsdt as any),
    ]);
    
    return {
      liptBalance: parseFloat(balances.liptBalance) / (10 ** liptDecimals),
      usdtBalance: parseFloat(balances.usdtBalance) / (10 ** usdtDecimals),
    };
  } catch (error) {
    console.error('Error fetching wallet data from contract:', error);
    // Retornar valores zerados em caso de erro
    return {
      liptBalance: 0,
      usdtBalance: 0,
    };
  }
};

export const getDashboardStats = async (userAddress: string) => {
  try {
    // Buscar dados do pool de liquidez para calcular o preço do LIPT
    const { getLiquidityPoolData } = await import('./web3-api');
    const liquidityData = await getLiquidityPoolData(userAddress as any);
    
    // O preço do LIPT é calculado automaticamente baseado na proporção dos tokens no pool
    // Preço = totalUSDT / totalLIPT
    // Se o pool estiver vazio, o preço será 0
    const liptPrice = liquidityData.liptPrice || 0;
    
    // TVL (Total Value Locked) = valor total dos tokens no pool
    // Fórmula robusta que funciona em todos os casos:
    // - Pool válido: totalUsdt + (totalLipt * liptPrice) = 2 * totalUsdt (correto)
    // - Pool vazio: 0 + 0 = 0 (correto)
    // - Pool desbalanceado (só USDT): totalUsdt + 0 = totalUsdt (correto)
    // - Pool desbalanceado (só LIPT): 0 + (totalLipt * 0) = 0 (correto, pois liptPrice = 0)
    const totalValueLocked = liquidityData.totalUsdt + (liquidityData.totalLipt * liptPrice);
    
    return {
      liptPrice,
      totalValueLocked,
      totalVolume: 0, // TODO: Implementar histórico de volume
      totalUsers: 0, // TODO: Implementar contagem de usuários
      protocolRevenue: 0, // TODO: Implementar receita do protocolo
      totalInvested: 0, // TODO: Implementar total investido
      totalReturns: 0, // TODO: Implementar retornos totais
    };
  } catch (error) {
    console.error('Error fetching dashboard stats from contracts:', error);
    // Retornar valores zerados em caso de erro
    return {
      liptPrice: 0,
      totalValueLocked: 0,
      totalVolume: 0,
      totalUsers: 0,
      protocolRevenue: 0,
      totalInvested: 0,
      totalReturns: 0,
    };
  }
};

export const getStakingData = async (userAddress: string) => {
  if (!userAddress) {
    // Se não há endereço, retornar estrutura vazia
    return {
      stakes: [],
      plans: [],
      stakedBalance: 0,
      unclaimedRewards: 0,
      earlyUnstakePenalty: 0,
    };
  }

  try {
    // Importar funções do web3-api
    const { getUserStakes, getStakingPlans, getEarlyUnstakePenalty } = await import('./web3-api');
    
    const [stakes, plans, penalty] = await Promise.all([
      getUserStakes(userAddress as any),
      getStakingPlans(),
      getEarlyUnstakePenalty(),
    ]);
    
    // Calcular recompensas não reivindicadas
    const now = Date.now();
    const unclaimedRewards = stakes.reduce((total, stake) => {
      const elapsed = (now - stake.startDate) / (1000 * 60 * 60 * 24); // dias
      const dailyReward = (stake.amount * stake.plan.apy / 100) / stake.plan.duration;
      return total + (dailyReward * elapsed);
    }, 0);
    
    return {
      stakes,
      plans,
      stakedBalance: stakes.reduce((sum, s) => sum + s.amount, 0),
      unclaimedRewards: Math.max(0, unclaimedRewards),
      earlyUnstakePenalty: penalty || 0,
    };
  } catch (error) {
    console.error('Error fetching staking data from contract:', error);
    // Retornar estrutura vazia em caso de erro
    return {
      stakes: [],
      plans: [],
      stakedBalance: 0,
      unclaimedRewards: 0,
      earlyUnstakePenalty: 0,
    };
  }
};

export const getMiningData = async (userAddress: string) => {
  if (!userAddress) {
    // Se não há endereço, retornar estrutura vazia
    return {
      miners: [],
      plans: [],
      miningPower: 0,
      minedRewards: 0,
    };
  }

  try {
    // Importar funções do web3-api
    const { getUserMiners, getMiningPlans } = await import('./web3-api');
    
    const [miners, plans] = await Promise.all([
      getUserMiners(userAddress as any),
      getMiningPlans(),
    ]);
    
    // Calcular poder total de mineração e recompensas
    // Usar os rewards já calculados pelo getUserMiners (que busca do contrato)
    const miningPower = miners.reduce((total, miner) => total + miner.plan.power, 0);
    const minedRewards = miners.reduce((total, miner) => {
      // minedAmount já vem calculado corretamente do getUserMiners
      return total + (miner.minedAmount || 0);
    }, 0);
    
    return {
      miners,
      plans: plans.length > 0 ? plans : [], // Não usar fallback hardcoded
      miningPower,
      minedRewards: Math.max(0, minedRewards),
    };
  } catch (error) {
    console.error('Error fetching mining data from contract:', error);
    // Retornar estrutura vazia em caso de erro
    return {
      miners: [],
      plans: [],
      miningPower: 0,
      minedRewards: 0,
    };
  }
};

export const getLiquidityData = async (userAddress: string) => {
  if (!userAddress) {
    // Se não há endereço, retornar valores zerados
    return {
      totalLipt: 0,
      totalUsdt: 0,
      totalLpTokens: 0,
      volume24h: 0,
      userPoolShare: 0,
      userLpTokens: 0,
      lpTokens: 0,
      userLpBalance: 0,
      feesEarned: 0,
      poolShare: 0,
    };
  }

  try {
    // Importar funções do web3-api
    const { getLiquidityPoolData } = await import('./web3-api');
    const poolData = await getLiquidityPoolData(userAddress as any);
    
    if (poolData) {
      return {
        totalLipt: poolData.totalLipt || 0,
        totalUsdt: poolData.totalUsdt || 0,
        totalLpTokens: poolData.totalLpTokens || 0,
        volume24h: poolData.volume24h || 0,
        userPoolShare: poolData.userPoolShare || 0,
        userLpTokens: poolData.userLpTokens || 0,
        lpTokens: poolData.lpTokens || 0,
        userLpBalance: poolData.userLpBalance || 0,
        feesEarned: poolData.feesEarned || 0,
        poolShare: poolData.poolShare || 0,
      };
    }
  } catch (error) {
    console.error('Error fetching liquidity data from contract:', error);
  }
  
  // Retornar valores zerados em caso de erro
  return {
    totalLipt: 0,
    totalUsdt: 0,
    totalLpTokens: 0,
    volume24h: 0,
    userPoolShare: 0,
    userLpTokens: 0,
    lpTokens: 0,
    userLpBalance: 0,
    feesEarned: 0,
    poolShare: 0,
  };
};

export const getLotteryData = async (userAddress: string) => {
    if (!userAddress) {
        // Se não há endereço, retornar estrutura vazia
        return {
            ticketPrice: 0,
            totalTickets: 0,
            userTickets: [],
            currentDraw: {
                id: 0,
                prizePool: 0,
                endTime: 0,
                status: 'OPEN' as const,
            },
            previousDraws: [],
        };
    }

    try {
        // Importar funções do web3-api
        const { getLotteryData: getLotteryDataFromContract } = await import('./web3-api');
        const lotteryData = await getLotteryDataFromContract(userAddress as any);
        
        if (lotteryData) {
            return lotteryData;
        }
    } catch (error) {
        console.error('Error fetching lottery data from contract:', error);
    }
    
    // Retornar estrutura vazia em caso de erro
    return {
        ticketPrice: 0,
        totalTickets: 0,
        userTickets: [],
        currentDraw: {
            id: 0,
            prizePool: 0,
            endTime: 0,
            status: 'OPEN' as const,
        },
        previousDraws: [],
    };
};

export const getReferralData = async (userAddress: string) => {
    if (!userAddress) {
        // Se não há endereço, retornar estrutura vazia
        return {
            referrer: '0x0000000000000000000000000000000000000000',
            referralCount: 0,
            totalCommissions: 0,
            referralLink: '',
            totalReferrals: 0,
            totalRewards: 0,
            network: [],
            referrals: [],
        };
    }

    // Tentar usar o contrato real
    try {
        const { getReferralViewData, getTokenDecimals } = await import('./web3-api');
        const { getReferralLink } = await import('../lib/utils');
        const { CONTRACT_ADDRESSES } = await import('../config/contracts');
        const referralData = await getReferralViewData(userAddress as any);
        
        if (referralData) {
            const decimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
            
            return {
                referrer: referralData.referrer || '0x0000000000000000000000000000000000000000',
                referralCount: referralData.referralCount || 0,
                totalCommissions: (referralData.totalCommissions || 0) / 10**decimals,
                referralLink: getReferralLink(userAddress),
                totalReferrals: referralData.referralCount || 0,
                totalRewards: (referralData.totalCommissions || 0) / 10**decimals,
                network: [], // TODO: Buscar network do backend
                referrals: [], // TODO: Buscar lista de referidos do contrato
            };
        }
    } catch (error) {
        console.error('Error getting referral data from contract:', error);
    }
    
    // Retornar estrutura vazia em caso de erro
    const { getReferralLink } = await import('../lib/utils');
    return {
        referrer: '0x0000000000000000000000000000000000000000',
        referralCount: 0,
        totalCommissions: 0,
        referralLink: getReferralLink(userAddress),
        totalReferrals: 0,
        totalRewards: 0,
        network: [],
        referrals: [],
    };
};

export const getLeaderboardData = async (userAddress: string) => {
    // Leaderboard deve vir de backend/indexação de eventos
    // Por enquanto, retornar array vazio com estrutura correta
    // O componente espera objetos com: rank, name, avatar, commission
    return [];
}

// --- ACTIONS (MUTATIONS) ---

export const purchaseLipt = async (userAddress: string, amount: number) => {
  if (!userAddress) {
    // Fallback para mock se não há endereço
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
  }

  try {
    // Importar funções do web3-api
    const { purchaseLipt: web3PurchaseLipt, getTokenDecimals } = await import('./web3-api');
    const { CONTRACT_ADDRESSES } = await import('../config/contracts');
    
    const usdtDecimals = await getTokenDecimals(CONTRACT_ADDRESSES.mockUsdt as any);
    const usdtAmountBigInt = BigInt(amount * (10 ** usdtDecimals));
    
    const hash = await web3PurchaseLipt(userAddress as any, usdtAmountBigInt);
    return { hash }; // Retorna o hash da transação
  } catch (error) {
    console.error('Error purchasing LIPT from contract, using fallback:', error);
    // Fallback para mock
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
  }
};

export const stakeLipt = async (userAddress: string, amount: number, plan: { duration: number; apy: number }) => {
    if (!userAddress) {
        // Fallback para mock se não há endereço
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
    }

    try {
        // Importar funções do web3-api
        const { stakeLipt: web3StakeLipt, getStakingPlans, getTokenDecimals } = await import('./web3-api');
        const { CONTRACT_ADDRESSES } = await import('../config/contracts');
        
        // Buscar planId correspondente ao plan selecionado
        const plans = await getStakingPlans();
        const planIndex = plans.findIndex(p => p.duration === plan.duration && p.apy === plan.apy);
        if (planIndex === -1) {
            throw new Error('Staking plan not found');
        }
        
        const liptDecimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
        const amountBigInt = BigInt(amount * (10 ** liptDecimals));
        
        const hash = await web3StakeLipt(userAddress as any, amountBigInt, planIndex);
        return { hash }; // Retorna o hash da transação
    } catch (error) {
        console.error('Error staking LIPT from contract, using fallback:', error);
        // Fallback para mock
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
    }
};

export const unstakeLipt = async (userAddress: string, stakeId: string) => {
    if (!userAddress) {
        // Fallback para mock se não há endereço
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
    }

    try {
        // Importar função do web3-api
        const { unstakeLipt: web3UnstakeLipt } = await import('./web3-api');
        
        // Converter stakeId string para number
        const stakeIdNum = parseInt(stakeId);
        if (isNaN(stakeIdNum)) {
            throw new Error('Invalid stake ID');
        }
        
        const hash = await web3UnstakeLipt(userAddress as any, stakeIdNum);
        return { hash }; // Retorna o hash da transação
    } catch (error) {
        console.error('Error unstaking LIPT from contract, using fallback:', error);
        // Fallback para mock
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
    }
};

export const claimStakingRewards = async (userAddress: string) => {
    if (!userAddress) {
        // Fallback para mock se não há endereço
        await wait(800);
        const wallet = getFromStorage('wallet', initialWallet);
        const staking = getFromStorage('staking', initialStaking);

        wallet.liptBalance += staking.unclaimedRewards;
        staking.unclaimedRewards = 0;

        saveToStorage('wallet', wallet);
        saveToStorage('staking', staking);
        return { wallet, staking };
    }

    try {
        // Importar função do web3-api
        const { claimStakingRewards: web3ClaimStakingRewards, getUserStakes } = await import('./web3-api');
        
        // Buscar stakes do usuário para obter stakeId
        const stakes = await getUserStakes(userAddress as any);
        if (stakes.length === 0) {
            throw new Error('No stakes found');
        }
        
        // Por enquanto, claim do primeiro stake. Idealmente deveria ter uma UI para selecionar qual stake
        const stakeId = parseInt(stakes[0].id);
        const hash = await web3ClaimStakingRewards(userAddress as any, stakeId);
        return { hash }; // Retorna o hash da transação
    } catch (error) {
        console.error('Error claiming staking rewards from contract, using fallback:', error);
        // Fallback para mock
        await wait(800);
        const wallet = getFromStorage('wallet', initialWallet);
        const staking = getFromStorage('staking', initialStaking);

        wallet.liptBalance += staking.unclaimedRewards;
        staking.unclaimedRewards = 0;

        saveToStorage('wallet', wallet);
        saveToStorage('staking', staking);
        return { wallet, staking };
    }
};

export const addLiquidity = async (userAddress: string, liptAmount: number, usdtAmount: number) => {
    // Tentar usar o contrato real
    try {
        const { addLiquidity: web3AddLiquidity, getTokenDecimals } = await import('./web3-api');
        const liptDecimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
        const usdtDecimals = await getTokenDecimals(CONTRACT_ADDRESSES.mockUsdt as any);
        
        const liptAmountBigInt = BigInt(Math.floor(liptAmount * 10**liptDecimals));
        const usdtAmountBigInt = BigInt(Math.floor(usdtAmount * 10**usdtDecimals));
        
        const hash = await web3AddLiquidity(userAddress as any, liptAmountBigInt, usdtAmountBigInt);
        return { success: true, hash };
    } catch (error) {
        console.error('Error calling addLiquidity contract:', error);
        // Fallback para mock
        await wait(1800);
        const wallet = getFromStorage('wallet', initialWallet);
        if (wallet.liptBalance < liptAmount || wallet.usdtBalance < usdtAmount) {
            throw new Error('Insufficient balance');
        }
        wallet.liptBalance -= liptAmount;
        wallet.usdtBalance -= usdtAmount;
        const liquidity = getFromStorage('liquidity', initialLiquidity);
        liquidity.userLpTokens += (liptAmount + usdtAmount) / 100;
        saveToStorage('wallet', wallet);
        saveToStorage('liquidity', liquidity);
        return { success: true };
    }
};

export const removeLiquidity = async (userAddress: string, lpAmount: number) => {
    // Tentar usar o contrato real
    try {
        const { removeLiquidity: web3RemoveLiquidity } = await import('./web3-api');
        
        // LP tokens geralmente têm 18 decimais
        const lpAmountBigInt = BigInt(Math.floor(lpAmount * 10**18));
        
        const hash = await web3RemoveLiquidity(userAddress as any, lpAmountBigInt);
        return { success: true, hash };
    } catch (error) {
        console.error('Error calling removeLiquidity contract:', error);
        // Fallback para mock
        await wait(1600);
        const wallet = getFromStorage('wallet', initialWallet);
        const liquidity = getFromStorage('liquidity', initialLiquidity);
        if (liquidity.userLpTokens < lpAmount) {
            throw new Error('Insufficient LP tokens');
        }
        liquidity.userLpTokens -= lpAmount;
        wallet.liptBalance += lpAmount * 50;
        wallet.usdtBalance += lpAmount * 60;
        saveToStorage('wallet', wallet);
        saveToStorage('liquidity', liquidity);
        return { success: true };
    }
};

export const activateMiner = async (userAddress: string, planId: number) => {
    try {
        // Importar função do web3-api
        const { activateMiner: web3ActivateMiner, getMiningPlans } = await import('./web3-api');
        
        // Verificar se o planId é válido antes de ativar
        const plans = await getMiningPlans();
        if (planId < 0 || planId >= plans.length) {
            throw new Error('Invalid plan ID');
        }
        
        const hash = await web3ActivateMiner(userAddress as any, planId);
        return { hash }; // Retorna o hash da transação
    } catch (error) {
        console.error('Error activating miner from contract, using fallback:', error);
        // Fallback para mock (deprecated - usar apenas para desenvolvimento)
        await wait(1300);
        const wallet = getFromStorage('wallet', initialWallet);
        const mining = getFromStorage('mining', initialMining);
        
        // Buscar plan por planId
        const plan = mining.plans[planId];
        if (!plan) {
            throw new Error('Plan not found');
        }
        
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
    }
};

export const claimMinedRewards = async (userAddress: string, minerId: number) => {
    try {
        // Importar função do web3-api
        const { claimMinedRewards: web3ClaimMinedRewards } = await import('./web3-api');
        
        const hash = await web3ClaimMinedRewards(userAddress as any, minerId);
        return { hash }; // Retorna o hash da transação
    } catch (error) {
        console.error('Error claiming mined rewards from contract, using fallback:', error);
        // Fallback para mock (deprecated - usar apenas para desenvolvimento)
        await wait(900);
        const wallet = getFromStorage('wallet', initialWallet);
        const mining = getFromStorage('mining', initialMining);

        // Claimar rewards do miner específico
        if (minerId < 0 || minerId >= mining.miners.length) {
            throw new Error('Invalid miner ID');
        }

        const miner = mining.miners[minerId];
        if (miner.minedAmount > 0) {
            wallet.liptBalance += miner.minedAmount;
            miner.minedAmount = 0;
            saveToStorage('wallet', wallet);
            saveToStorage('mining', mining);
        }

        return { success: true };
    }
};

// Game Actions
export const spinWheel = async (userAddress: string, bet: number) => {
    // Tentar usar o contrato real
    try {
        const web3Api = await import('./web3-api');
        const decimals = await web3Api.getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
        const betAmount = BigInt(Math.floor(bet * 10**decimals));
        
        // Chamar o contrato (ele decide o resultado)
        const hash = await web3Api.spinWheel(userAddress as any, betAmount);
        
        // Aguardar a transação ser minerada
        // TODO: Escutar evento WheelSpun para obter o resultado real
        // Por enquanto, retornar hash da transação
        return { hash, winnings: 0, multiplier: 0 }; // O frontend deve aguardar o evento
    } catch (error) {
        console.error('Error calling spinWheel contract:', error);
        // Fallback para mock se o contrato falhar
        await wait(500);
        const wallet = getFromStorage('wallet', initialWallet);
        if (wallet.liptBalance < bet) {
            throw new Error('Insufficient LIPT balance for bet');
        }
        // Mock: resultado aleatório
        const mockMultipliers = [0, 0.5, 1, 1.5, 2, 3];
        const multiplier = mockMultipliers[Math.floor(Math.random() * mockMultipliers.length)];
        const winnings = bet * multiplier;
        wallet.liptBalance = wallet.liptBalance - bet + winnings;
        saveToStorage('wallet', wallet);
        return { winnings, multiplier };
    }
}

export const placeRocketBet = async (userAddress: string, bet: number) => {
    // Tentar usar o contrato real
    try {
        const { getTokenDecimals, playRocket } = await import('./web3-api');
        const decimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
        const betAmount = BigInt(Math.floor(bet * 10**decimals));
        
        // Chamar o contrato (ele decide o crash point)
        const hash = await playRocket(userAddress as any, betAmount);
        
        // TODO: Escutar evento RocketPlayed para obter o betIndex
        return { success: true, hash };
    } catch (error) {
        console.error('Error calling playRocket contract:', error);
        // Fallback para mock
        await wait(400);
        const wallet = getFromStorage('wallet', initialWallet);
        if (wallet.liptBalance < bet) {
            throw new Error('Insufficient LIPT balance for bet');
        }
        wallet.liptBalance -= bet;
        saveToStorage('wallet', wallet);
        return { success: true };
    }
}

export const cashOutRocket = async (userAddress: string, bet: number, multiplier: number) => {
    // Tentar usar o contrato real
    try {
        const { cashOutRocket: web3CashOut } = await import('./web3-api');
        
        // TODO: Obter betIndex correto do evento RocketPlayed
        const betIndex = 0; // Mock por enquanto
        const multiplierBasisPoints = Math.floor(multiplier * 100); // Converter para basis points
        
        const hash = await web3CashOut(userAddress as any, betIndex, multiplierBasisPoints);
        
        // Calcular winnings
        const winnings = bet * multiplier;
        return { winnings, hash };
    } catch (error) {
        console.error('Error calling cashOutRocket contract:', error);
        // Fallback para mock
        await wait(200);
        const wallet = getFromStorage('wallet', initialWallet);
        const winnings = bet * multiplier;
        wallet.liptBalance += winnings;
        saveToStorage('wallet', wallet);
        return { winnings };
    }
}

export const buyLotteryTickets = async (userAddress: string, quantity: number) => {
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

export const claimLotteryPrize = async (userAddress: string) => {
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
