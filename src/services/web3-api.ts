import { Address, createPublicClient, createWalletClient, custom, getContract, http, parseAbiItem, decodeEventLog } from 'viem';
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
const MINING_ADDRESS = CONTRACT_ADDRESSES.miningPool as Address;
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

  try {
  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: publicClient,
  });

  const plans = await stakingContract.read.getStakingPlans();
    
    // Converter planos do contrato para o formato esperado pelo frontend
  return plans.map((plan: any) => ({
      duration: Number(plan.duration) / (24 * 60 * 60), // Converter segundos para dias
      apy: Number(plan.apy) / 100, // Converter basis points para porcentagem
      cost: Number(plan.cost || 0),
    }));
  } catch (error) {
    console.error('Error fetching staking plans from contract:', error);
    return []; // Retornar array vazio, o fallback será usado no mock-api
  }
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

    const plans = await miningContract.read.getMiningPlans();
    
    // Buscar decimais do LIPT para converter cost corretamente
    const liptDecimals = await getTokenDecimals(LIPT_ADDRESS);
    
    // Converter planos do contrato para o formato esperado pelo frontend
    return plans.map((plan: any, index: number) => ({
      name: `Plan ${index + 1}`, // O contrato não tem name, gerar baseado no índice
      cost: Number(plan.cost) / 10 ** liptDecimals, // Converter de wei para tokens
      power: Number(plan.power) / 10 ** liptDecimals, // Power usa os mesmos decimais do token
      duration: Number(plan.duration) / (24 * 60 * 60), // Converter segundos para dias
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

// Calcular rewards disponíveis para um stake específico
export async function calculateStakingRewards(userAddress: Address, stakeId: number) {
  const { publicClient } = getClients();
  if (!publicClient) return 0n;

  try {
    const stakingContract = getContract({
      address: STAKING_ADDRESS,
      abi: CONTRACT_ABIS.stakingPool,
      client: publicClient,
    });

    const rewards = await stakingContract.read.calculateRewards([stakeId], {
      account: userAddress,
    });
    return rewards;
  } catch (error) {
    console.error('Error calculating staking rewards:', error);
    return 0n;
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

    // Buscar rewards disponíveis para cada stake
    const stakesWithRewards = await Promise.all(
      stakes.map(async (stake: any, index: number) => {
      const planId = Number(stake.planId);
      const plan = plans[planId] || { duration: 0, apy: 0 };
        
        // Calcular rewards disponíveis
        let availableRewards = 0n;
        try {
          availableRewards = await stakingContract.read.calculateRewards([index], {
            account: userAddress,
          });
        } catch (error) {
          console.error(`Error calculating rewards for stake ${index}:`, error);
        }

        // Buscar decimais do LIPT para converter corretamente
        const liptDecimals = await getTokenDecimals(LIPT_ADDRESS);
        
      return {
        id: index.toString(),
          stakeId: index, // ID numérico para usar no claim
          amount: Number(stake.amount) / 10 ** liptDecimals,
        startDate: Number(stake.startDate) * 1000,
        plan: {
            duration: Number(plan.duration) / (24 * 60 * 60), // Converter segundos para dias
            apy: Number(plan.apy) / 100, // Converter basis points para porcentagem
        },
          availableRewards: Number(availableRewards) / 10 ** liptDecimals, // Rewards disponíveis
          rewardsClaimed: Number(stake.rewardsClaimed || 0) / 10 ** liptDecimals, // Total já claimado
      };
      })
    );

    return stakesWithRewards;
  } catch (error) {
    console.error('Error fetching user stakes:', error);
    return []; // Fallback
  }
}

// Calcular rewards disponíveis para um miner específico
export async function calculateMinedRewards(userAddress: Address, minerId: number) {
  const { publicClient } = getClients();
  if (!publicClient) return 0n;

  try {
    const miningContract = getContract({
      address: CONTRACT_ADDRESSES.miningPool as Address,
      abi: CONTRACT_ABIS.miningPool,
      client: publicClient,
    });

    const rewards = await miningContract.read.calculateMinedRewards([minerId], {
      account: userAddress,
    });
    return rewards;
  } catch (error) {
    console.error('Error calculating mined rewards:', error);
    return 0n;
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

    // Buscar rewards disponíveis para cada miner
    const minersWithRewards = await Promise.all(
      miners.map(async (miner: any, index: number) => {
      const planId = Number(miner.planId);
      const plan = plans[planId] || { cost: 0, power: 0, duration: 0, active: false };
        
        // Calcular rewards disponíveis
        let availableRewards = 0n;
        try {
          availableRewards = await miningContract.read.calculateMinedRewards([index], {
            account: userAddress,
          });
        } catch (error) {
          console.error(`Error calculating rewards for miner ${index}:`, error);
        }

      return {
        id: index.toString(),
          minerId: index, // ID numérico para usar no claim
        startDate: Number(miner.startDate) * 1000,
        plan: {
          name: `Plan ${planId}`,
          cost: Number(plan.cost),
          power: Number(plan.power),
          duration: Number(plan.duration),
        },
          minedAmount: Number(availableRewards), // Rewards disponíveis (não os já claimados)
          rewardsClaimed: Number(miner.rewardsClaimed || 0), // Total já claimado
      };
      })
    );

    return minersWithRewards;
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
      liptPrice: 0, // Preço zero quando não há conexão
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

    // Calcular preço do LIPT baseado na proporção dos reserves
    // Preço = totalUSDT / totalLIPT
    const totalLiptFormatted = reserveLipt / 10 ** liptDecimals;
    const totalUsdtFormatted = reserveUsdt / 10 ** usdtDecimals;
    const liptPrice = totalLiptFormatted > 0 ? totalUsdtFormatted / totalLiptFormatted : 0;

    return {
      totalLipt: totalLiptFormatted,
      totalUsdt: totalUsdtFormatted,
      totalLpTokens,
      volume24h: 0, // TODO: Implementar histórico de volume (requer eventos)
      userPoolShare,
      userLpTokens: userLpBalance,
      lpTokens: userLpBalance,
      userLpBalance,
      feesEarned: 0, // TODO: Implementar cálculo de fees (requer eventos)
      poolShare: userPoolShare,
      liptPrice, // Preço calculado do LIPT baseado no pool
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
      liptPrice: 0, // Preço zero quando pool está vazio ou erro
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
      // Não logar warning múltiplas vezes - usar um log único por sessão
      if (!(window as any).__wheelSegmentsWarningLogged) {
        console.warn('No wheel segments found in contract. The administrator needs to configure wheel segments using setWheelSegments.');
        (window as any).__wheelSegmentsWarningLogged = true;
      }
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
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

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

  // Verificar allowance atual
  const currentAllowance = await liptContract.read.allowance([userAddress, STAKING_ADDRESS]);
  
  // 1. Aprovar se necessário (adicionar 10% de margem)
  if (currentAllowance < amount) {
    const approveAmount = amount + (amount * BigInt(10) / BigInt(100)); // +10% margem
    console.log(`Aprovando LIPT para staking: ${approveAmount.toString()} (necessário: ${amount.toString()}, atual: ${currentAllowance.toString()})`);
    const { request: approveRequest } = await liptContract.simulate.approve([STAKING_ADDRESS, approveAmount], { account: userAddress });
    const approveHash = await walletClient.writeContract(approveRequest);
    console.log(`LIPT approved for staking, hash: ${approveHash}`);
    
    // Aguardar confirmação do approve
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  } else {
    console.log(`LIPT já tem allowance suficiente para staking: ${currentAllowance.toString()}`);
  }

  // 2. Stake
  const { request: stakeRequest } = await stakingContract.simulate.stake([amount, planId], { account: userAddress });
  const hash = await walletClient.writeContract(stakeRequest);
  
  // Aguardar confirmação do stake para garantir que foi gravado no contrato
  await publicClient.waitForTransactionReceipt({ hash });
  
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
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

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

  // Verificar allowance atual
  const currentAllowance = await usdtContract.read.allowance([userAddress, SWAP_ADDRESS]);
  
  // 1. Aprovar se necessário (adicionar 10% de margem)
  if (currentAllowance < usdtAmount) {
    const approveAmount = usdtAmount + (usdtAmount * BigInt(10) / BigInt(100)); // +10% margem
    console.log(`Aprovando USDT: ${approveAmount.toString()} (necessário: ${usdtAmount.toString()}, atual: ${currentAllowance.toString()})`);
    const { request: approveRequest } = await usdtContract.simulate.approve([SWAP_ADDRESS, approveAmount], { account: userAddress });
    const approveHash = await walletClient.writeContract(approveRequest);
    console.log(`USDT approved, hash: ${approveHash}`);
    
    // Aguardar confirmação do approve antes de fazer o swap
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  } else {
    console.log(`USDT já tem allowance suficiente: ${currentAllowance.toString()}`);
  }

  // 2. Swap
  const { request: swapRequest } = await swapContract.simulate.swap([USDT_ADDRESS, usdtAmount], { account: userAddress });
  const swapHash = await walletClient.writeContract(swapRequest);
  
  // Aguardar confirmação do swap antes de retornar
  await publicClient.waitForTransactionReceipt({ hash: swapHash });
  
  return swapHash;
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
  
  // Aguardar confirmação da transação
  if (publicClient) {
    await publicClient.waitForTransactionReceipt({ hash });
  }
  
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
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const wheelContract = getContract({
    address: CONTRACT_ADDRESSES.wheelOfFortune as Address,
    abi: CONTRACT_ABIS.wheelOfFortune,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await wheelContract.simulate.spinWheel([betAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar o receipt para obter o evento WheelSpun
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // Extrair o evento WheelSpun do receipt
  const wheelSpunEvent = parseAbiItem('event WheelSpun(address indexed user, uint256 betAmount, uint256 multiplier, uint256 winnings)');
  
  let multiplier = 0n;
  let winnings = 0n;
  
  // Buscar o evento WheelSpun nos logs do receipt
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: [wheelSpunEvent],
        data: log.data,
        topics: log.topics,
      });
      
      if (decoded.eventName === 'WheelSpun' && decoded.args.user?.toLowerCase() === userAddress.toLowerCase()) {
        multiplier = decoded.args.multiplier || 0n;
        winnings = decoded.args.winnings || 0n;
        break;
      }
    } catch (error) {
      // Log não corresponde ao evento, continuar
      continue;
    }
  }
  
  return { hash, multiplier, winnings };
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
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const rocketContract = getContract({
    address: CONTRACT_ADDRESSES.rocketGame as Address,
    abi: CONTRACT_ABIS.rocketGame,
    client: { public: publicClient, wallet: walletClient },
  });

  const { request } = await rocketContract.simulate.playRocket([betAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação da transação
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // Obter informações da rodada para filtrar eventos desta rodada
  const currentRound = await rocketContract.read.currentRound();
  const roundStartTime = Number(currentRound[1]); // startTime em segundos
  
  // O betIndex é simplesmente o índice do bet no array currentRound.bets[]
  // Como nosso bet foi adicionado com push(), o índice é o número de bets ANTES dele
  // Contamos todos os eventos RocketBetPlaced desta rodada até agora
  let betIndex = 0;
  try {
    const rocketBetPlacedEvent = parseAbiItem('event RocketBetPlaced(address indexed user, uint256 amount)');
    
    // Buscar eventos desde o início da rodada (usar roundStartTime para filtrar)
    // Usar um range de blocos razoável (últimos 1000 blocos) para evitar busca muito lenta
    const receiptBlock = receipt.blockNumber;
    const fromBlock = receiptBlock - 1000n > 0n ? receiptBlock - 1000n : 0n;
    
    const events = await publicClient.getLogs({
      address: CONTRACT_ADDRESSES.rocketGame as Address,
      event: rocketBetPlacedEvent,
      fromBlock,
      toBlock: receiptBlock, // Até o bloco da nossa transação (incluindo ela)
    });
    
    // Contar eventos desta rodada (block timestamp >= roundStartTime)
    // O número total de eventos será o betIndex (0-indexed, então último = total - 1)
    let totalBetsInRound = 0;
    for (const eventLog of events) {
      if (eventLog.blockNumber) {
        try {
          const block = await publicClient.getBlock({ blockNumber: eventLog.blockNumber });
          if (block && block.timestamp >= BigInt(roundStartTime)) {
            totalBetsInRound++;
          }
        } catch {
          continue;
        }
      }
    }
    
    // Nosso bet é o último adicionado, então betIndex = total - 1 (0-indexed)
    // Se totalBetsInRound = 1, nosso betIndex = 0 (primeiro bet)
    betIndex = totalBetsInRound > 0 ? totalBetsInRound - 1 : 0;
    
  } catch (error) {
    console.error('Error counting bets for betIndex:', error);
    // Se falhar, assumir que é o primeiro bet (betIndex = 0)
    betIndex = 0;
  }
  
  return { hash, betIndex };
}

export async function cashOutRocket(userAddress: Address, betIndex: number, multiplier: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const rocketContract = getContract({
    address: CONTRACT_ADDRESSES.rocketGame as Address,
    abi: CONTRACT_ABIS.rocketGame,
    client: { public: publicClient, wallet: walletClient },
  });

  // Multiplicador deve estar em basis points (ex: 150 = 1.5x)
  const multiplierBasisPoints = Math.round(multiplier * 100);
  
  const { request } = await rocketContract.simulate.cashOutRocket([betIndex, multiplierBasisPoints], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação e buscar winnings do evento
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // Extrair winnings do evento RocketCashedOut
  const rocketCashedOutEvent = parseAbiItem('event RocketCashedOut(address indexed user, uint256 amount, uint256 multiplier)');
  
  let winnings = 0n;
  let foundEvent = false;
  
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: [rocketCashedOutEvent],
        data: log.data,
        topics: log.topics,
      });
      
      if (decoded.eventName === 'RocketCashedOut' && decoded.args.user?.toLowerCase() === userAddress.toLowerCase()) {
        winnings = decoded.args.amount || 0n;
        foundEvent = true;
        break;
      }
    } catch (error) {
      // Não é o evento que procuramos, continuar
      continue;
    }
  }
  
  // Se não encontramos o evento, lançar erro em vez de retornar winnings 0
  if (!foundEvent) {
    throw new Error('RocketCashedOut event not found in transaction receipt. The cash out may have failed or the transaction was invalid.');
  }
  
  // Validar que os winnings não são zero
  if (winnings === 0n) {
    throw new Error('Cash out transaction succeeded but winnings are zero. This may indicate an error in the transaction.');
  }
  
  return { hash, winnings };
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
  if (!publicClient) throw new Error('Public client not available');

  // Contratos
  const liptContract = getContract({
    address: LIPT_ADDRESS,
    abi: CONTRACT_ABIS.liptToken,
    client: { public: publicClient, wallet: walletClient },
  });

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

  // Verificar allowances atuais e aprovar apenas se necessário
  const [currentLiptAllowance, currentUsdtAllowance] = await Promise.all([
    liptContract.read.allowance([userAddress, SWAP_ADDRESS]),
    usdtContract.read.allowance([userAddress, SWAP_ADDRESS]),
  ]);

  // Aprovar LIPT se necessário (adicionar 10% de margem de segurança)
  if (currentLiptAllowance < liptAmount) {
    const approveAmount = liptAmount + (liptAmount * BigInt(10) / BigInt(100)); // +10% margem
    console.log(`Aprovando LIPT: ${approveAmount.toString()} (necessário: ${liptAmount.toString()}, atual: ${currentLiptAllowance.toString()})`);
    const { request: approveLiptRequest } = await liptContract.simulate.approve([SWAP_ADDRESS, approveAmount], { account: userAddress });
    const approveLiptHash = await walletClient.writeContract(approveLiptRequest);
    console.log(`LIPT approved, hash: ${approveLiptHash}`);
    
    // Aguardar confirmação da transação de approve
    await publicClient.waitForTransactionReceipt({ hash: approveLiptHash });
  } else {
    console.log(`LIPT já tem allowance suficiente: ${currentLiptAllowance.toString()}`);
  }

  // Aprovar USDT se necessário (adicionar 10% de margem de segurança)
  if (currentUsdtAllowance < usdtAmount) {
    const approveAmount = usdtAmount + (usdtAmount * BigInt(10) / BigInt(100)); // +10% margem
    console.log(`Aprovando USDT: ${approveAmount.toString()} (necessário: ${usdtAmount.toString()}, atual: ${currentUsdtAllowance.toString()})`);
    const { request: approveUsdtRequest } = await usdtContract.simulate.approve([SWAP_ADDRESS, approveAmount], { account: userAddress });
    const approveUsdtHash = await walletClient.writeContract(approveUsdtRequest);
    console.log(`USDT approved, hash: ${approveUsdtHash}`);
    
    // Aguardar confirmação da transação de approve
    await publicClient.waitForTransactionReceipt({ hash: approveUsdtHash });
  } else {
    console.log(`USDT já tem allowance suficiente: ${currentUsdtAllowance.toString()}`);
  }

  // Adicionar liquidez
  console.log(`Adicionando liquidez: LIPT=${liptAmount.toString()}, USDT=${usdtAmount.toString()}`);
  const { request } = await swapContract.simulate.addLiquidity([liptAmount, usdtAmount], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  console.log(`Liquidez adicionada, hash: ${hash}`);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
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
 * NOTA: Após o deploy, a propriedade foi transferida para o ProtocolController.
 * Então verificamos se o usuário é owner do ProtocolController.
 */
export async function isLIPTOwner(userAddress: Address): Promise<boolean> {
  const { publicClient } = getClients();
  if (!publicClient) {
    console.error('isLIPTOwner: publicClient não disponível');
    return false;
  }

  try {
    // Primeiro, verificar se o LIPT Token foi transferido para ProtocolController
    const liptContract = getContract({
      address: LIPT_ADDRESS,
      abi: CONTRACT_ABIS.liptToken,
      client: publicClient,
    });

    const liptOwner = await liptContract.read.owner();
    
    // Se o owner do LIPT Token é o ProtocolController, verificar se o usuário é owner do ProtocolController
    const PROTOCOL_CONTROLLER_ADDRESS = CONTRACT_ADDRESSES.protocolController as Address;
    
    if (liptOwner.toLowerCase() === PROTOCOL_CONTROLLER_ADDRESS.toLowerCase()) {
      // O LIPT Token foi transferido para o ProtocolController
      // Verificar se o usuário é owner do ProtocolController
      const protocolControllerContract = getContract({
        address: PROTOCOL_CONTROLLER_ADDRESS,
        abi: CONTRACT_ABIS.protocolController,
        client: publicClient,
      });

      const protocolControllerOwner = await protocolControllerContract.read.owner();
      const isOwner = protocolControllerOwner.toLowerCase() === userAddress.toLowerCase();
      
      console.log('isLIPTOwner check (via ProtocolController):', {
        liptTokenAddress: LIPT_ADDRESS,
        liptOwner: liptOwner,
        protocolControllerAddress: PROTOCOL_CONTROLLER_ADDRESS,
        protocolControllerOwner: protocolControllerOwner,
        userAddress,
        isOwner,
      });
      
      return isOwner;
    } else {
      // O LIPT Token ainda não foi transferido, verificar diretamente
      const isOwner = liptOwner.toLowerCase() === userAddress.toLowerCase();
      
      console.log('isLIPTOwner check (direct):', {
        contractAddress: LIPT_ADDRESS,
        userAddress,
        ownerAddress: liptOwner,
        isOwner,
      });
      
      return isOwner;
    }
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

/**
 * Buscar informações completas sobre a cadeia de ownership
 * Retorna o owner do LIPT Token e, se for o ProtocolController, também retorna o owner do ProtocolController
 */
export async function getOwnershipChain(): Promise<{
  liptTokenAddress: string;
  liptTokenOwner: string;
  protocolControllerAddress: string;
  protocolControllerOwner: string | null;
  isOwnerTransferredToController: boolean;
  finalOwner: string;
}> {
  const { publicClient } = getClients();
  if (!publicClient) {
    throw new Error('publicClient não disponível');
  }

  try {
    // 1. Buscar owner do LIPT Token
    const liptContract = getContract({
      address: LIPT_ADDRESS,
      abi: CONTRACT_ABIS.liptToken,
      client: publicClient,
    });

    const liptOwner = await liptContract.read.owner();
    const PROTOCOL_CONTROLLER_ADDRESS = CONTRACT_ADDRESSES.protocolController as Address;
    
    const isOwnerTransferredToController = liptOwner.toLowerCase() === PROTOCOL_CONTROLLER_ADDRESS.toLowerCase();
    
    let protocolControllerOwner: string | null = null;
    let finalOwner = liptOwner as string;

    // 2. Se o owner for o ProtocolController, buscar o owner do ProtocolController
    // OU se for outro endereço de contrato, tentar buscar o owner dele também
    if (isOwnerTransferredToController) {
      try {
        const protocolControllerContract = getContract({
          address: PROTOCOL_CONTROLLER_ADDRESS,
          abi: CONTRACT_ABIS.protocolController,
          client: publicClient,
        });

        protocolControllerOwner = await protocolControllerContract.read.owner() as string;
        finalOwner = protocolControllerOwner;
      } catch (error) {
        console.error('Error fetching ProtocolController owner:', error);
      }
    } else {
      // Se o owner NÃO é o ProtocolController, pode ser outro contrato ou uma carteira
      // Tentar verificar se é um contrato que tem função owner()
      try {
        const potentialContract = getContract({
          address: liptOwner as Address,
          abi: [{ 
            inputs: [], 
            name: 'owner', 
            outputs: [{ internalType: 'address', name: '', type: 'address' }], 
            stateMutability: 'view', 
            type: 'function' 
          }],
          client: publicClient,
        });

        const nestedOwner = await potentialContract.read.owner();
        if (nestedOwner && nestedOwner !== liptOwner) {
          // É um contrato com owner, então o owner final é o owner desse contrato
          finalOwner = nestedOwner as string;
        }
      } catch {
        // Não é um contrato ou não tem função owner, então o owner final é o próprio liptOwner
        // (que pode ser uma carteira simples)
      }
    }

    return {
      liptTokenAddress: LIPT_ADDRESS,
      liptTokenOwner: liptOwner as string,
      protocolControllerAddress: PROTOCOL_CONTROLLER_ADDRESS,
      protocolControllerOwner,
      isOwnerTransferredToController,
      finalOwner,
    };
  } catch (error) {
    console.error('Error fetching ownership chain:', error);
    throw error;
  }
}

// --- FUNÇÕES ADMINISTRATIVAS ---

/**
 * Adicionar novo plano de staking (apenas owner)
 * duration: em dias (será convertido para segundos)
 * apy: em porcentagem (será convertido para basis points)
 */
export async function addStakingPlan(userAddress: Address, durationDays: number, apyPercent: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // Converter dias para segundos
  const durationSeconds = BigInt(durationDays * 24 * 60 * 60);
  // Converter porcentagem para basis points (ex: 12.5% = 1250)
  const apyBasisPoints = BigInt(Math.round(apyPercent * 100));

  const { request } = await stakingContract.simulate.addStakingPlan([durationSeconds, apyBasisPoints], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}

/**
 * Modificar plano de staking existente (apenas owner)
 */
export async function modifyStakingPlan(
  userAddress: Address,
  planId: number,
  durationDays: number,
  apyPercent: number,
  active: boolean
) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // Converter dias para segundos
  const durationSeconds = BigInt(durationDays * 24 * 60 * 60);
  // Converter porcentagem para basis points
  const apyBasisPoints = BigInt(Math.round(apyPercent * 100));

  const { request } = await stakingContract.simulate.modifyStakingPlan([planId, durationSeconds, apyBasisPoints, active], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}

/**
 * Adicionar novo plano de mineração (apenas owner)
 * cost: em LIPT (será convertido para wei usando decimais)
 * power: em LIPT por segundo (será convertido para wei por segundo)
 * duration: em dias (será convertido para segundos)
 */
export async function addMiningPlan(userAddress: Address, cost: number, power: number, durationDays: number) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const miningContract = getContract({
    address: MINING_ADDRESS,
    abi: CONTRACT_ABIS.miningPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // Buscar decimais do LIPT para converter corretamente
  const liptDecimals = await getTokenDecimals(LIPT_ADDRESS);
  
  // Converter cost e power para wei usando os mesmos decimais do token
  const costWei = BigInt(Math.floor(cost * (10 ** liptDecimals)));
  const powerWeiPerSecond = BigInt(Math.floor(power * (10 ** liptDecimals))); // Power usa os mesmos decimais do token
  
  // Converter dias para segundos
  const durationSeconds = BigInt(durationDays * 24 * 60 * 60);

  const { request } = await miningContract.simulate.addMiningPlan([costWei, powerWeiPerSecond, durationSeconds], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}

/**
 * Modificar plano de mineração existente (apenas owner)
 */
export async function modifyMiningPlan(
  userAddress: Address,
  planId: number,
  cost: number,
  power: number,
  durationDays: number,
  active: boolean
) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const miningContract = getContract({
    address: MINING_ADDRESS,
    abi: CONTRACT_ABIS.miningPool,
    client: { public: publicClient, wallet: walletClient },
  });

  // Buscar decimais do LIPT para converter corretamente
  const liptDecimals = await getTokenDecimals(LIPT_ADDRESS);
  
  // Converter cost e power para wei usando os mesmos decimais do token
  const costWei = BigInt(Math.floor(cost * (10 ** liptDecimals)));
  const powerWeiPerSecond = BigInt(Math.floor(power * (10 ** liptDecimals))); // Power usa os mesmos decimais do token
  
  // Converter dias para segundos
  const durationSeconds = BigInt(durationDays * 24 * 60 * 60);

  const { request } = await miningContract.simulate.modifyMiningPlan([planId, costWei, powerWeiPerSecond, durationSeconds, active], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}

/**
 * Configurar segmentos da roda da fortuna (apenas owner)
 * multipliers: array de multiplicadores (ex: [150, 200] = 1.5x, 2.0x) em basis points
 * weights: array de pesos para probabilidade
 */
export async function setWheelSegments(userAddress: Address, multipliers: number[], weights: number[]) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient || !publicClient) throw new Error('Wallet not connected');

  const wheelContract = getContract({
    address: CONTRACT_ADDRESSES.wheelOfFortune as Address,
    abi: CONTRACT_ABIS.wheelOfFortune,
    client: { public: publicClient, wallet: walletClient },
  });

  // Converter multipliers de decimal para basis points (ex: 1.5x = 150)
  const multipliersBasisPoints = multipliers.map(m => BigInt(Math.round(m * 100)));
  const weightsBigInt = weights.map(w => BigInt(w));

  const { request } = await wheelContract.simulate.setWheelSegments([multipliersBasisPoints, weightsBigInt], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  
  // Aguardar confirmação
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}
