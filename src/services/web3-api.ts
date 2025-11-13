import { Address, createPublicClient, createWalletClient, custom, getContract, PublicClient, WalletClient } from 'viem';
import { polygonMumbai } from 'viem/chains';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

// Configuração do cliente Web3 (usando viem)
// O cliente público é usado para chamadas de leitura (view functions)
const publicClient: PublicClient = createPublicClient({
  chain: polygonMumbai,
  transport: custom(window.ethereum), // Assume que o window.ethereum (MetaMask) está disponível
});

// O cliente de carteira é usado para transações (write functions)
const walletClient: WalletClient = createWalletClient({
  chain: polygonMumbai,
  transport: custom(window.ethereum),
});

// Endereços e ABIs
const LIPT_ADDRESS = CONTRACT_ADDRESSES.LIPTToken as Address;
const USDT_ADDRESS = CONTRACT_ADDRESSES.MockUSDT as Address;
const STAKING_ADDRESS = CONTRACT_ADDRESSES.StakingPool as Address;
const SWAP_ADDRESS = CONTRACT_ADDRESSES.DevAdrianSwapPool as Address;
const MINING_ADDRESS = CONTRACT_ADDRESSES.MiningPool as Address;
const REFERRAL_ADDRESS = CONTRACT_ADDRESSES.ReferralProgram as Address;
const TAX_HANDLER_ADDRESS = CONTRACT_ADDRESSES.TaxHandler as Address;
const LOTTERY_ADDRESS = CONTRACT_ADDRESSES.Lottery as Address;
const ROCKET_ADDRESS = CONTRACT_ADDRESSES.RocketGame as Address;
const WHEEL_ADDRESS = CONTRACT_ADDRESSES.WheelOfFortune as Address;

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

const stakingContract = getContract({
  address: STAKING_ADDRESS,
  abi: CONTRACT_ABIS.stakingPool,
  client: { public: publicClient, wallet: walletClient },
});

const swapContract = getContract({
  address: SWAP_ADDRESS,
  abi: CONTRACT_ABIS.swapPool,
  client: { public: publicClient, wallet: walletClient },
});

const miningContract = getContract({
  address: MINING_ADDRESS,
  abi: CONTRACT_ABIS.miningPool,
  client: { public: publicClient, wallet: walletClient },
});

const referralContract = getContract({
  address: REFERRAL_ADDRESS,
  abi: CONTRACT_ABIS.referralProgram,
  client: { public: publicClient, wallet: walletClient },
});

const taxHandlerContract = getContract({
  address: TAX_HANDLER_ADDRESS,
  abi: CONTRACT_ABIS.taxHandler,
  client: { public: publicClient, wallet: walletClient },
});

const lotteryContract = getContract({
  address: LOTTERY_ADDRESS,
  abi: CONTRACT_ABIS.lottery,
  client: { public: publicClient, wallet: walletClient },
});

const rocketContract = getContract({
  address: ROCKET_ADDRESS,
  abi: CONTRACT_ABIS.rocketGame,
  client: { public: publicClient, wallet: walletClient },
});

const wheelContract = getContract({
  address: WHEEL_ADDRESS,
  abi: CONTRACT_ABIS.wheelOfFortune,
  client: { public: publicClient, wallet: walletClient },
});

// --- FUNÇÕES DE LEITURA (GETTERS) ---

export async function getWalletBalances(userAddress: Address) {
  const liptBalance = await liptContract.read.balanceOf([userAddress]);
  const usdtBalance = await usdtContract.read.balanceOf([userAddress]);

  return {
    liptBalance: liptBalance.toString(),
    usdtBalance: usdtBalance.toString(),
  };
}

export async function getStakingPlans() {
  // A função getStakingPlans retorna um array de structs
  const plans = await stakingContract.read.getStakingPlans();
  return plans.map((plan: any) => ({
    duration: Number(plan.duration),
    apy: Number(plan.apy),
    cost: Number(plan.cost),
  }));
}

// --- FUNÇÕES DE AÇÃO (MUTATIONS) ---

/**
 * @dev Realiza o staking de LIPT.
 * @param userAddress Endereço do usuário.
 * @param amount Quantidade de LIPT a ser stakada.
 * @param planId ID do plano de staking.
 */
export async function stakeLipt(userAddress: Address, amount: bigint, planId: number) {
  // 1. Aprovar o StakingPool para gastar o LIPT
  const { request: approveRequest } = await liptContract.simulate.approve([STAKING_ADDRESS, amount], { account: userAddress });
  await walletClient.writeContract(approveRequest);

  // 2. Chamar a função stake
  const { request: stakeRequest } = await stakingContract.simulate.stake([amount, planId], { account: userAddress });
  const hash = await walletClient.writeContract(stakeRequest);
  return hash;
}

/**
 * @dev Realiza o unstake de LIPT.
 * @param userAddress Endereço do usuário.
 * @param stakeId ID do stake.
 */
export async function unstakeLipt(userAddress: Address, stakeId: number) {
  const { request } = await stakingContract.simulate.unstake([stakeId], { account: userAddress });
  const hash = await walletClient.writeContract(request);
  return hash;
}

/**
 * @dev Realiza a compra de LIPT com USDT (Swap).
 * @param userAddress Endereço do usuário.
 * @param usdtAmount Quantidade de USDT a ser gasta.
 */
export async function purchaseLipt(userAddress: Address, usdtAmount: bigint) {
  // 1. Aprovar o SwapPool para gastar o USDT
  const { request: approveRequest } = await usdtContract.simulate.approve([SWAP_ADDRESS, usdtAmount], { account: userAddress });
  await walletClient.writeContract(approveRequest);

  // 2. Chamar a função swap (USDT -> LIPT)
  // O tokenIn é o endereço do USDT
  const { request: swapRequest } = await swapContract.simulate.swap([USDT_ADDRESS, usdtAmount], { account: userAddress });
  const hash = await walletClient.writeContract(swapRequest);
  return hash;
}

// TODO: Implementar as demais funções de ação (Mining, Liquidity, Games, etc.)
// A lógica de substituição no mock-api.ts será feita no próximo passo.
