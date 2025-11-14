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
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com';
    publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl),
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

// Buscar decimais de um token
export async function getTokenDecimals(tokenAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return 18; // Fallback padrão para ERC-20

  try {
    const tokenContract = getContract({
      address: tokenAddress,
      abi: CONTRACT_ABIS.liptToken, // Ambos LIPT e USDT devem ter decimals()
      client: publicClient,
    });

    const decimals = await tokenContract.read.decimals();
    return Number(decimals);
  } catch (error) {
    console.error('Error fetching token decimals:', error);
    return 18; // Fallback
  }
}

// Buscar planos de mineração
export async function getMiningPlans() {
  const { publicClient } = getClients();
  if (!publicClient) return [];

  try {
    const miningContract = getContract({
      address: CONTRACT_ADDRESSES.miningPool as Address,
      abi: CONTRACT_ABIS.miningPool,
      client: publicClient,
    });

    // Assumindo que o contrato tem getMiningPlans() similar ao staking
    const plans = await miningContract.read.getMiningPlans();
    return plans.map((plan: any) => ({
      name: plan.name || `Plan ${plan.id}`,
      cost: Number(plan.cost),
      power: Number(plan.power),
      duration: Number(plan.duration),
    }));
  } catch (error) {
    console.error('Error fetching mining plans:', error);
    return []; // Fallback
  }
}

// Buscar penalidade de unstake antecipado
export async function getEarlyUnstakePenalty() {
  const { publicClient } = getClients();
  if (!publicClient) return 10; // Fallback padrão de 10%

  try {
    const stakingContract = getContract({
      address: STAKING_ADDRESS,
      abi: CONTRACT_ABIS.stakingPool,
      client: publicClient,
    });

    // Assumindo que retorna em basis points (10000 = 100%)
    const penaltyBasisPoints = await stakingContract.read.earlyUnstakePenaltyBasisPoints();
    return Number(penaltyBasisPoints) / 100; // Converter para porcentagem
  } catch (error) {
    console.error('Error fetching early unstake penalty:', error);
    return 10; // Fallback de 10%
  }
}

// Buscar stakes do usuário
export async function getUserStakes(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return [];

  try {
    const stakingContract = getContract({
      address: STAKING_ADDRESS,
      abi: CONTRACT_ABIS.stakingPool,
      client: publicClient,
    });

    // Assumindo que o contrato tem getUserStakes(address)
    const stakes = await stakingContract.read.getUserStakes([userAddress]);
    return stakes.map((stake: any, index: number) => ({
      id: stake.id?.toString() || index.toString(),
      amount: Number(stake.amount),
      startDate: Number(stake.startDate) * 1000, // Converter de segundos para ms
      plan: {
        duration: Number(stake.plan?.duration || stake.duration),
        apy: Number(stake.plan?.apy || stake.apy),
      },
    }));
  } catch (error) {
    console.error('Error fetching user stakes:', error);
    return []; // Fallback
  }
}

// Buscar miners do usuário
export async function getUserMiners(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return [];

  try {
    const miningContract = getContract({
      address: CONTRACT_ADDRESSES.miningPool as Address,
      abi: CONTRACT_ABIS.miningPool,
      client: publicClient,
    });

    // Assumindo que o contrato tem getUserMiners(address)
    const miners = await miningContract.read.getUserMiners([userAddress]);
    return miners.map((miner: any, index: number) => ({
      id: miner.id?.toString() || index.toString(),
      startDate: Number(miner.startDate) * 1000, // Converter de segundos para ms
      plan: {
        name: miner.plan?.name || miner.name || `Plan ${index}`,
        cost: Number(miner.plan?.cost || miner.cost),
        power: Number(miner.plan?.power || miner.power),
        duration: Number(miner.plan?.duration || miner.duration),
      },
      minedAmount: Number(miner.minedAmount || 0),
    }));
  } catch (error) {
    console.error('Error fetching user miners:', error);
    return []; // Fallback
  }
}

// Buscar segmentos da roda da fortuna
export async function getWheelSegments() {
  const { publicClient } = getClients();
  if (!publicClient) return [];

  try {
    const wheelContract = getContract({
      address: CONTRACT_ADDRESSES.wheelOfFortune as Address,
      abi: CONTRACT_ABIS.wheelOfFortune,
      client: publicClient,
    });

    // Assumindo que o contrato tem getSegments() ou precisa iterar
    // Se o contrato tem um contador de segmentos, iterar
    let segments: any[] = [];
    try {
      // Tentar buscar todos os segmentos de uma vez
      const allSegments = await wheelContract.read.getSegments();
      segments = Array.isArray(allSegments) ? allSegments : [];
    } catch {
      // Se não tiver getSegments(), tentar iterar
      try {
        const segmentCount = await wheelContract.read.segmentCount();
        const promises = [];
        for (let i = 0; i < Number(segmentCount); i++) {
          promises.push(wheelContract.read.segments([i]));
        }
        segments = await Promise.all(promises);
      } catch {
        // Se falhar, retornar array vazio (fallback será usado)
        return [];
      }
    }

    return segments.map((seg: any, index: number) => ({
      value: Number(seg.value || seg.multiplier || 0),
      label: `${seg.value || seg.multiplier || 0}x`,
      color: seg.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Cor aleatória se não tiver
      weight: Number(seg.weight || seg.probability || 1),
    }));
  } catch (error) {
    console.error('Error fetching wheel segments:', error);
    return []; // Fallback - o componente usará os segmentos hardcoded
  }
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
