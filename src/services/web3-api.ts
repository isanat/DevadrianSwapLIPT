import { Address, createPublicClient, createWalletClient, custom, getContract, http } from 'viem';
import { polygon } from 'viem/chains';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

// Lazy initialization para evitar "window is not defined" durante SSR
let publicClient: any = null;
let walletClient: any = null;

function getClients() {
  if (typeof window === 'undefined') {
    // Se estamos no servidor, retornar clientes mock ou null
    return { publicClient: null, walletClient: null };
  }

  if (!publicClient) {
    publicClient = createPublicClient({
      chain: polygon,
      transport: http('https://polygon-rpc.com'),
    });
  }

  if (!walletClient && window.ethereum) {
    walletClient = createWalletClient({
      chain: polygon,
      transport: custom(window.ethereum),
    });
  }

  return { publicClient, walletClient };
}

// Endereços
const LIPT_ADDRESS = CONTRACT_ADDRESSES.liptToken as Address;
const USDT_ADDRESS = CONTRACT_ADDRESSES.mockUsdt as Address;
const STAKING_ADDRESS = CONTRACT_ADDRESSES.stakingPool as Address;
const SWAP_ADDRESS = CONTRACT_ADDRESSES.swapPool as Address;

// --- FUNÇÕES DE LEITURA (GETTERS) ---

export async function getWalletBalances(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return { liptBalance: '0', usdtBalance: '0' };

  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: publicClient,
  });

  const usdtContract = getContract({
    address: USDT_ADDRESS,
    abi: CONTRACT_ABIS.mockUsdt,
    client: publicClient,
  });

  const liptBalance = await liptContract.read.balanceOf([userAddress]);
  const usdtBalance = await usdtContract.read.balanceOf([userAddress]);

  return {
    liptBalance: liptBalance.toString(),
    usdtBalance: usdtBalance.toString(),
  };
}

export async function getStakingPlans() {
  const { publicClient } = getClients();
  if (!publicClient) return [];

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: publicClient,
  });

  const plans = await stakingContract.read.getStakingPlans();
  return plans.map((plan: any) => ({
    duration: Number(plan.duration),
    apy: Number(plan.apy),
    cost: Number(plan.cost),
  }));
}

// --- FUNÇÕES DE AÇÃO (MUTATIONS) ---

export async function stakeLipt(userAddress: Address, amount: bigint, planId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: { public: publicClient, wallet: walletClient },
  });

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // 1. Aprovar
  const { request: approveRequest } = await liptContract.simulate.approve([STAKING_ADDRESS, amount], { account: userAddress });
  await walletClient.writeContract(approveRequest);

  // 2. Stake
  const { request: stakeRequest } = await stakingContract.simulate.stake([amount, planId], { account: userAddress });
  const hash = await walletClient.writeContract(stakeRequest);
  return hash;
}

export async function unstakeLipt(userAddress: Address, stakeId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await stakingContract.simulate.unstake([stakeId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function purchaseLipt(userAddress: Address, usdtAmount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const usdtContract = getContract({
    address: USDT_ADDRESS,
    abi: CONTRACT_ABIS.mockUsdt,
    client: { public: publicClient, wallet: walletClient },
  });

  const swapContract = getContract({
    address: SWAP_ADDRESS,
    abi: CONTRACT_ABIS.swapPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // 1. Aprovar
  const { request: approveRequest } = await usdtContract.simulate.approve([SWAP_ADDRESS, usdtAmount], { account: userAddress });
  await walletClient.writeContract(approveRequest);

  // 2. Swap
  const { request: swapRequest } = await swapContract.simulate.swap([USDT_ADDRESS, usdtAmount], { account: userAddress });
  const hash = await walletClient.writeContract(swapRequest);
  return hash;
}

// --- FUNÇÕES DE AÇÃO (MUTATIONS) - CONTINUAÇÃO ---

export async function claimStakingRewards(userAddress: Address, stakeId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await stakingContract.simulate.claimRewards([stakeId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function activateMiner(userAddress: Address, planId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const miningContract = getContract({
    address: CONTRACT_ADDRESSES.miningPool as Address,
    abi: CONTRACT_ABIS.miningPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await miningContract.simulate.activateMiner([planId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function claimMinedRewards(userAddress: Address, minerId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const miningContract = getContract({
    address: CONTRACT_ADDRESSES.miningPool as Address,
    abi: CONTRACT_ABIS.miningPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await miningContract.simulate.claimMinedRewards([minerId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function spinWheel(userAddress: Address, betAmount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const wheelContract = getContract({
    address: CONTRACT_ADDRESSES.wheelOfFortune as Address,
    abi: CONTRACT_ABIS.wheelOfFortune,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await wheelContract.simulate.spinWheel([betAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function playRocket(userAddress: Address, betAmount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const rocketContract = getContract({
    address: CONTRACT_ADDRESSES.rocketGame as Address,
    abi: CONTRACT_ABIS.rocketGame,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await rocketContract.simulate.playRocket([betAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function cashOutRocket(userAddress: Address, betIndex: number, multiplier: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const rocketContract = getContract({
    address: CONTRACT_ADDRESSES.rocketGame as Address,
    abi: CONTRACT_ABIS.rocketGame,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await rocketContract.simulate.cashOutRocket([betIndex, multiplier], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function buyLotteryTickets(userAddress: Address, ticketQuantity: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const lotteryContract = getContract({
    address: CONTRACT_ADDRESSES.lottery as Address,
    abi: CONTRACT_ABIS.lottery,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await lotteryContract.simulate.buyTickets([ticketQuantity], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function claimLotteryPrize(userAddress: Address, drawId: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const lotteryContract = getContract({
    address: CONTRACT_ADDRESSES.lottery as Address,
    abi: CONTRACT_ABIS.lottery,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await lotteryContract.simulate.claimLotteryPrize([drawId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}
