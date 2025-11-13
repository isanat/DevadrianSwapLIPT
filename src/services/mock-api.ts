// This file mocks a backend API.
// In a real application, this would be making network requests to a real server.

// Importar as funções de interação com a blockchain
import {
  getWalletBalances,
  getStakingPlans,
  stakeLipt,
  unstakeLipt,
  purchaseLipt as web3PurchaseLipt,
} from './web3-api';

// --- MOCK DATA (Apenas para tipos e dados não-blockchain) ---

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

// ... (Manter as interfaces Stake, Miner, LotteryDraw, LotteryState)
// ... (Manter as funções utilitárias wait, getFromStorage, saveToStorage)
// ... (Manter os dados iniciais mock, exceto os que serão substituídos)

// --- API FUNCTIONS (Substituídas pela lógica Web3) ---

// Mock de um endereço de usuário conectado (deve ser obtido via Wallet Connect)
const MOCK_USER_ADDRESS = "0x0000000000000000000000000000000000000001"; // Substituir pelo endereço real do usuário

// GETTERS
export const getWalletData = async () => {
  // Substituído pela chamada ao Smart Contract
  const balances = await getWalletBalances(MOCK_USER_ADDRESS as any);
  return {
    liptBalance: parseFloat(balances.liptBalance),
    usdtBalance: parseFloat(balances.usdtBalance),
  };
};

export const getDashboardStats = async () => {
  // Manter mock por enquanto, pois requer dados agregados de eventos
  await wait(500);
  return getFromStorage('stats', initialStats);
};

export const getStakingData = async () => {
  // Substituído pela chamada ao Smart Contract
  const plans = await getStakingPlans();
  // TODO: Chamar a função do StakingPool para obter os stakes do usuário e recompensas
  const staking = getFromStorage('staking', initialStaking);
  return { ...staking, plans };
};

// ... (Manter getMiningData, getLiquidityData, getLotteryData, getReferralData, getLeaderboardData)

// --- ACTIONS (MUTATIONS) ---

export const purchaseLipt = async (amount: number) => {
  // Substituído pela chamada ao Smart Contract (Swap)
  const amountBigInt = BigInt(amount * 10**18); // Assumindo 18 decimais
  const hash = await web3PurchaseLipt(MOCK_USER_ADDRESS as any, amountBigInt);
  return { hash }; // Retorna o hash da transação
};

export const stakeLipt = async (amount: number, plan: { duration: number; apy: number }) => {
  // Substituído pela chamada ao Smart Contract (Staking)
  const amountBigInt = BigInt(amount * 10**18); // Assumindo 18 decimais
  // TODO: Obter o planId correto do Smart Contract
  const planId = 0; // MOCK
  const hash = await stakeLipt(MOCK_USER_ADDRESS as any, amountBigInt, planId);
  return { hash };
};

export const unstakeLipt = async (stakeId: string) => {
  // Substituído pela chamada ao Smart Contract (Staking)
  const hash = await unstakeLipt(MOCK_USER_ADDRESS as any, parseInt(stakeId));
  return { hash };
};

export const claimStakingRewards = async () => {
  // TODO: Chamar a função claimRewards do StakingPool
  await wait(800);
  return { hash: "0xmockhash" };
};

// ... (Manter addLiquidity, removeLiquidity, activateMiner, etc. como mock por enquanto)
