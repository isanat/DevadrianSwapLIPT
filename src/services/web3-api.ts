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

// --- FUNÇÕES DE LIQUIDEZ ---

export async function getLiquidityPoolData(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    const swapContract = getContract({
      address: SWAP_ADDRESS,
      abi: CONTRACT_ABIS.swapPool,
      client: publicClient,
    });

    // Buscar reservas da pool
    const reserves = await swapContract.read.getReserves();
    const totalSupply = await swapContract.read.totalSupply();
    const userLpBalance = await swapContract.read.balanceOf([userAddress]);

    // Calcular pool share do usuário
    const poolShare = totalSupply > 0n ? (Number(userLpBalance) / Number(totalSupply)) * 100 : 0;

    return {
      reserveLipt: reserves[0],
      reserveUsdt: reserves[1],
      totalSupply,
      userLpBalance,
      poolShare,
    };
  } catch (error) {
    console.error('Error getting liquidity pool data:', error);
    return null;
  }
}

export async function addLiquidity(userAddress: Address, liptAmount: bigint, usdtAmount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  // 1. Aprovar LIPT
  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request: approveLiptRequest } = await liptContract.simulate.approve([SWAP_ADDRESS, liptAmount], { account: userAddress });
  await walletClient.writeContract(approveLiptRequest);

  // 2. Aprovar USDT
  const usdtContract = getContract({
    address: USDT_ADDRESS,
    abi: CONTRACT_ABIS.mockUsdt,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request: approveUsdtRequest } = await usdtContract.simulate.approve([SWAP_ADDRESS, usdtAmount], { account: userAddress });
  await walletClient.writeContract(approveUsdtRequest);

  // 3. Adicionar liquidez
  const swapContract = getContract({
    address: SWAP_ADDRESS,
    abi: CONTRACT_ABIS.swapPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await swapContract.simulate.addLiquidity([liptAmount, usdtAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function removeLiquidity(userAddress: Address, lpTokenAmount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const swapContract = getContract({
    address: SWAP_ADDRESS,
    abi: CONTRACT_ABIS.swapPool,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await swapContract.simulate.removeLiquidity([lpTokenAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

// --- FUNÇÕES VIEW ADICIONAIS ---

export async function getSwapFee() {
  const { publicClient } = getClients();
  if (!publicClient) return 30; // Default 0.3% (30 basis points)

  try {
    const swapContract = getContract({
      address: SWAP_ADDRESS,
      abi: CONTRACT_ABIS.swapPool,
      client: publicClient,
    });

    const feeBasisPoints = await swapContract.read.swapFeeBasisPoints();
    return Number(feeBasisPoints);
  } catch (error) {
    console.error('Error getting swap fee:', error);
    return 30; // Fallback
  }
}

export async function getCommissionRates() {
  const { publicClient } = getClients();
  if (!publicClient) return [10, 5, 3]; // Default rates

  try {
    const referralContract = getContract({
      address: CONTRACT_ADDRESSES.referralProgram as Address,
      abi: CONTRACT_ABIS.referralProgram,
      client: publicClient,
    });

    // Buscar taxas de comissão para cada nível
    const level1 = await referralContract.read.commissionRates([0]);
    const level2 = await referralContract.read.commissionRates([1]);
    const level3 = await referralContract.read.commissionRates([2]);

    return [Number(level1), Number(level2), Number(level3)];
  } catch (error) {
    console.error('Error getting commission rates:', error);
    return [10, 5, 3]; // Fallback
  }
}

export async function getHouseEdge(gameType: 'wheel' | 'rocket') {
  const { publicClient } = getClients();
  if (!publicClient) return 200; // Default 2% (200 basis points)

  try {
    const contractAddress = gameType === 'wheel' 
      ? CONTRACT_ADDRESSES.wheelOfFortune 
      : CONTRACT_ADDRESSES.rocketGame;
    
    const contractAbi = gameType === 'wheel'
      ? CONTRACT_ABIS.wheelOfFortune
      : CONTRACT_ABIS.rocketGame;

    const gameContract = getContract({
      address: contractAddress as Address,
      abi: contractAbi,
      client: publicClient,
    });

    const houseEdgeBasisPoints = await gameContract.read.houseEdgeBasisPoints();
    return Number(houseEdgeBasisPoints);
  } catch (error) {
    console.error(`Error getting house edge for ${gameType}:`, error);
    return 200; // Fallback
  }
}

export async function getLotteryViewData() {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    const lotteryContract = getContract({
      address: CONTRACT_ADDRESSES.lottery as Address,
      abi: CONTRACT_ABIS.lottery,
      client: publicClient,
    });

    const currentDrawId = await lotteryContract.read.currentDrawId();
    const ticketPrice = await lotteryContract.read.ticketPrice();
    const prizePool = await lotteryContract.read.prizePool();
    const drawTime = await lotteryContract.read.drawTime();

    return {
      currentDrawId: Number(currentDrawId),
      ticketPrice: Number(ticketPrice),
      prizePool: Number(prizePool),
      drawTime: Number(drawTime),
    };
  } catch (error) {
    console.error('Error getting lottery data:', error);
    return null;
  }
}

export async function getReferralViewData(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    const referralContract = getContract({
      address: CONTRACT_ADDRESSES.referralProgram as Address,
      abi: CONTRACT_ABIS.referralProgram,
      client: publicClient,
    });

    const referrer = await referralContract.read.getReferrer([userAddress]);
    const totalCommissions = await referralContract.read.getTotalCommissions([userAddress]);
    const referralCount = await referralContract.read.getReferralCount([userAddress]);

    return {
      referrer: referrer as string,
      totalCommissions: Number(totalCommissions),
      referralCount: Number(referralCount),
    };
  } catch (error) {
    console.error('Error getting referral data:', error);
    return null;
  }
}
