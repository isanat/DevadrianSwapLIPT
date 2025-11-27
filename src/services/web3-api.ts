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

    const [stakes, plans] = await Promise.all([
      stakingContract.read.getUserStakes([userAddress]),
      stakingContract.read.getStakingPlans(),
    ]);

    return stakes.map((stake: any, index: number) => {
      const planId = Number(stake.planId);
      const plan = plans[planId] || { duration: 0, apy: 0 };
      return {
        id: index.toString(),
        amount: Number(stake.amount),
        startDate: Number(stake.startDate) * 1000,
        plan: {
          duration: Number(plan.duration),
          apy: Number(plan.apy),
        },
      };
    });
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

    const [miners, plans] = await Promise.all([
      miningContract.read.getUserMiners([userAddress]),
      miningContract.read.getMiningPlans(),
    ]);

    return miners.map((miner: any, index: number) => {
      const planId = Number(miner.planId);
      const plan = plans[planId] || { cost: 0, power: 0, duration: 0, active: false };
      return {
        id: index.toString(),
        startDate: Number(miner.startDate) * 1000,
        plan: {
          name: `Plan ${planId}`,
          cost: Number(plan.cost),
          power: Number(plan.power),
          duration: Number(plan.duration),
        },
        minedAmount: Number(miner.rewardsClaimed || 0),
      };
    });
  } catch (error) {
    console.error('Error fetching user miners:', error);
    return []; // Fallback
  }
}

// Buscar dados da pool de liquidez
export async function getLiquidityPoolData(userAddress?: Address) {
  const { publicClient } = getClients();
  if (!publicClient) {
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
    const swapContract = getContract({
      address: SWAP_ADDRESS,
      abi: CONTRACT_ABIS.swapPool,
      client: publicClient,
    });

    // Buscar reserves e total supply
    const [reserves, totalSupply, lpDecimals] = await Promise.all([
      swapContract.read.getReserves(),
      swapContract.read.totalSupply(),
      getTokenDecimals(SWAP_ADDRESS as Address),
    ]);

    const reserveLipt = Number(reserves[0]);
    const reserveUsdt = Number(reserves[1]);
    const totalLpTokens = Number(totalSupply) / 10 ** lpDecimals;

    // Se houver endereço de usuário, buscar saldo de LP tokens
    let userLpBalance = 0;
    let userPoolShare = 0;
    if (userAddress) {
      const balance = await swapContract.read.balanceOf([userAddress]);
      userLpBalance = Number(balance) / 10 ** lpDecimals;
      
      if (totalLpTokens > 0) {
        userPoolShare = (userLpBalance / totalLpTokens) * 100;
      }
    }

    // Buscar decimais dos tokens para converter corretamente
    const [liptDecimals, usdtDecimals] = await Promise.all([
      getTokenDecimals(LIPT_ADDRESS),
      getTokenDecimals(USDT_ADDRESS),
    ]);

    return {
      totalLipt: reserveLipt / 10 ** liptDecimals,
      totalUsdt: reserveUsdt / 10 ** usdtDecimals,
      totalLpTokens,
      volume24h: 0, // TODO: Implementar histórico de volume (requer eventos)
      userPoolShare,
      userLpTokens: userLpBalance,
      lpTokens: userLpBalance,
      userLpBalance,
      feesEarned: 0, // TODO: Implementar cálculo de fees (requer eventos)
      poolShare: userPoolShare,
    };
  } catch (error) {
    console.error('Error fetching liquidity pool data:', error);
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
}

// Buscar dados da loteria
export async function getLotteryData(userAddress?: Address) {
  const { publicClient } = getClients();
  if (!publicClient) {
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
    const lotteryContract = getContract({
      address: CONTRACT_ADDRESSES.lottery as Address,
      abi: CONTRACT_ABIS.lottery,
      client: publicClient,
    });

    // Buscar dados do sorteio atual
    const currentDraw = await lotteryContract.read.currentDraw();
    const ticketPrice = await lotteryContract.read.ticketPrice();
    
    const liptDecimals = await getTokenDecimals(LIPT_ADDRESS);
    const prizePool = (Number(currentDraw.totalTickets) * Number(ticketPrice)) / 10 ** liptDecimals;

    // Buscar tickets do usuário se fornecido
    let userTickets: number[] = [];
    if (userAddress) {
      const ticketsBought = await lotteryContract.read.ticketsBought([userAddress]);
      const numTickets = Number(ticketsBought);
      // Gerar array de números de tickets do usuário (simplificado)
      userTickets = Array.from({ length: numTickets }, (_, i) => i);
    }

    return {
      ticketPrice: Number(ticketPrice) / 10 ** liptDecimals,
      totalTickets: Number(currentDraw.totalTickets),
      userTickets,
      currentDraw: {
        id: Number(currentDraw.drawId),
        prizePool,
        endTime: Date.now() + 24 * 60 * 60 * 1000, // TODO: Buscar do contrato se houver
        status: (currentDraw.drawn ? 'CLOSED' : 'OPEN') as 'OPEN' | 'CLOSED',
        winningTicket: currentDraw.drawn ? Number(currentDraw.totalTickets) : undefined,
        winnerAddress: currentDraw.drawn ? currentDraw.winner : undefined,
        prizeClaimed: false, // TODO: Implementar verificação
      },
      previousDraws: [], // TODO: Implementar histórico de sorteios (requer eventos)
    };
  } catch (error) {
    console.error('Error fetching lottery data:', error);
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

    // O contrato WheelOfFortune tem segments(uint256) que retorna um Segment
    // Não há função para obter o tamanho, então iteramos até obter erro
    const segments: any[] = [];
    let index = 0;
    const maxSegments = 100; // Limite de segurança para evitar loop infinito

    while (index < maxSegments) {
      try {
        const segment = await wheelContract.read.segments([index]);
        if (segment && (segment.multiplier !== undefined || segment.weight !== undefined)) {
          segments.push(segment);
          index++;
        } else {
          break; // Segmento inválido, parar iteração
        }
      } catch {
        // Erro ao buscar segmento no índice, assumir que não há mais segmentos
        break;
      }
    }

    if (segments.length === 0) {
      console.warn('No wheel segments found in contract');
      return [];
    }

    // Cores padrão baseadas no índice
    const defaultColors = [
      '#6366f1', // Indigo
      '#ef4444', // Red
      '#22c55e', // Green
      '#8b5cf6', // Purple
      '#f97316', // Orange
      '#3b82f6', // Blue
      '#ec4899', // Pink
      '#14b8a6', // Teal
    ];

    return segments.map((seg: any, index: number) => {
      const multiplier = Number(seg.multiplier || 0);
      // O multiplier no contrato está em basis points (ex: 150 = 1.5x), converter para decimal
      const value = multiplier / 100;
      
      return {
        value,
        label: `${value}x`,
        color: defaultColors[index % defaultColors.length],
        weight: Number(seg.weight || 1),
      };
    });
  } catch (error) {
    console.error('Error fetching wheel segments:', error);
    return []; // Retornar array vazio - componente não renderiza se não houver segmentos
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

// Buscar dados da rodada atual do Rocket Game
export async function getRocketCurrentRound() {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    const rocketContract = getContract({
      address: CONTRACT_ADDRESSES.rocketGame as Address,
      abi: CONTRACT_ABIS.rocketGame,
      client: publicClient,
    });

    const round = await rocketContract.read.currentRound();
    
    // O crashPoint está em basis points (ex: 200 = 2.00x), converter para decimal
    return {
      crashPoint: Number(round[0]) / 100, // crashPoint em basis points -> decimal
      startTime: Number(round[1]) * 1000, // timestamp em segundos -> milissegundos
      active: round[2] as boolean,
    };
  } catch (error) {
    console.error('Error fetching rocket current round:', error);
    return null;
  }
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
  
  // Aguardar confirmação e obter o crash point da rodada atual
  if (publicClient) {
    await publicClient.waitForTransactionReceipt({ hash });
  }
  
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

  // Multiplicador deve estar em basis points (ex: 150 = 1.5x)
  const multiplierBasisPoints = Math.round(multiplier * 100);
  
  const { request } = await rocketContract.simulate.cashOutRocket([betIndex, multiplierBasisPoints], { account: userAddress });
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
  if (!publicClient) return null;

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
    return null;
  }
}

export async function getCommissionRates() {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    const referralContract = getContract({
      address: CONTRACT_ADDRESSES.referralProgram as Address,
      abi: CONTRACT_ABIS.referralProgram,
      client: publicClient,
    });

    const rates = await referralContract.read.getCommissionRates();
    return rates.map((r: any) => Number(r));
  } catch (error) {
    console.error('Error getting commission rates:', error);
    return null;
  }
}

export async function getHouseEdge(gameType: 'wheel' | 'rocket') {
  const { publicClient } = getClients();
  if (!publicClient) return null;

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
    return null;
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

// Registrar referrer no programa de afiliados
export async function registerReferrer(userAddress: Address, referrerAddress: Address) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  try {
    const referralContract = getContract({
      address: CONTRACT_ADDRESSES.referralProgram as Address,
      abi: CONTRACT_ABIS.referralProgram,
      client: { public: publicClient, wallet: walletClient },
    });

    const { request } = await referralContract.simulate.register([referrerAddress], {
      account: userAddress,
    });

    const hash = await walletClient.writeContract(request);
    
    // Aguardar confirmação
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash });
    }

    return { hash };
  } catch (error: any) {
    console.error('Error registering referrer:', error);
    throw new Error(error.message || 'Failed to register referrer');
  }
}

// --- FUNÇÕES DE ADMINISTRAÇÃO DE TOKENS ---

/**
 * Mintar MockUSDT para um endereço
 * Nota: A função mint() do MockUSDT é pública, qualquer pessoa pode mintar
 */
export async function mintMockUSDT(userAddress: Address, toAddress: Address, amount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const mockUsdtContract = getContract({
    address: USDT_ADDRESS,
    abi: CONTRACT_ABIS.mockUsdt,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await mockUsdtContract.simulate.mint([toAddress, amount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

/**
 * Transferir LIPT de um endereço para outro
 * Nota: Requer que o userAddress tenha aprovação ou seja o owner
 */
export async function transferLIPT(userAddress: Address, toAddress: Address, amount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await liptContract.simulate.transfer([toAddress, amount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

/**
 * Mintar LIPT (função owner-only)
 */
export async function mintLIPT(userAddress: Address, toAddress: Address, amount: bigint) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await liptContract.simulate.mint([toAddress, amount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

/**
 * Verificar se um endereço é owner de um contrato
 */
export async function checkContractOwner(contractAddress: Address, userAddress: Address): Promise<boolean> {
  const { publicClient } = getClients();
  if (!publicClient) return false;

  try {
    // Para o LIPT Token, usar o ABI completo
    let abi: any;
    if (contractAddress.toLowerCase() === LIPT_ADDRESS.toLowerCase()) {
      abi = CONTRACT_ABIS.liptToken;
    } else {
      // Para outros contratos, usar ABI mínimo com função owner
      abi = [{ 
        inputs: [], 
        name: 'owner', 
        outputs: [{ internalType: 'address', name: '', type: 'address' }], 
        stateMutability: 'view', 
        type: 'function' 
      }];
    }

    const contract = getContract({
      address: contractAddress,
      abi,
      client: publicClient,
    });

    const owner = await contract.read.owner();
    return owner.toLowerCase() === userAddress.toLowerCase();
  } catch (error) {
    console.error('Error checking contract owner:', error);
    return false;
  }
}

/**
 * Verificar se um endereço é owner do LIPT Token
 */
export async function isLIPTOwner(userAddress: Address): Promise<boolean> {
  const { publicClient } = getClients();
  if (!publicClient) {
    console.error('isLIPTOwner: publicClient não disponível');
    return false;
  }

  try {
    // Usar o ABI completo do LIPT Token que já inclui a função owner()
    const liptContract = getContract({
      address: LIPT_ADDRESS,
      abi: CONTRACT_ABIS.liptToken,
      client: publicClient,
    });

    const owner = await liptContract.read.owner();
    const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
    
    console.log('isLIPTOwner check:', {
      contractAddress: LIPT_ADDRESS,
      userAddress,
      ownerAddress: owner,
      isOwner,
    });
    
    return isOwner;
  } catch (error) {
    console.error('Error checking LIPT owner:', error);
    return false;
  }
}

/**
 * Buscar o endereço do owner de um contrato
 */
export async function getContractOwnerAddress(contractAddress: Address): Promise<string | null> {
  const { publicClient } = getClients();
  if (!publicClient) return null;

  try {
    // Para o LIPT Token, usar o ABI completo
    let abi: any;
    if (contractAddress.toLowerCase() === LIPT_ADDRESS.toLowerCase()) {
      abi = CONTRACT_ABIS.liptToken;
    } else {
      // Para outros contratos, usar ABI mínimo com função owner
      abi = [{ 
        inputs: [], 
        name: 'owner', 
        outputs: [{ internalType: 'address', name: '', type: 'address' }], 
        stateMutability: 'view', 
        type: 'function' 
      }];
    }

    const contract = getContract({
      address: contractAddress,
      abi,
      client: publicClient,
    });

    const owner = await contract.read.owner();
    return owner as string;
  } catch (error) {
    console.error('Error getting contract owner address:', error);
    return null;
  }
}

/**
 * Buscar o endereço do owner do LIPT Token
 */
export async function getLIPTOwnerAddress(): Promise<string | null> {
  return getContractOwnerAddress(LIPT_ADDRESS);
}
