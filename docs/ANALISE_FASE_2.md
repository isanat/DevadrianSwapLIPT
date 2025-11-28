# 🔍 Análise Completa da Fase 2 - Integração com Dados On-Chain

## 📋 Resumo Executivo

**Objetivo da Fase 2:** Substituir dados hardcoded e lógica mockada por chamadas reais aos Smart Contracts, implementando funções view para buscar dados dinâmicos e conectando o `mock-api.ts` com o `web3-api.ts`.

**Status Atual:** Fase 1 concluída ✅ | Fase 2 pendente ⏳

---

## 🔍 Estado Atual do Código

### ✅ **O que já está implementado:**

1. **Funções de escrita (mutations) no web3-api.ts:**
   - ✅ `stakeLipt()`, `unstakeLipt()`, `claimStakingRewards()`
   - ✅ `activateMiner()`, `claimMinedRewards()`
   - ✅ `purchaseLipt()` (swap)
   - ✅ `spinWheel()`, `playRocket()`, `cashOutRocket()`
   - ✅ `buyLotteryTickets()`, `claimLotteryPrize()`

2. **Funções view existentes:**
   - ✅ `getWalletBalances()` - Busca saldos dos tokens
   - ✅ `getStakingPlans()` - Busca planos de staking do contrato

3. **Integração wagmi:**
   - ✅ Todos os componentes usando `useAccount()`
   - ✅ `userAddress` sendo passado para todas as funções

### ❌ **O que ainda precisa ser feito:**

1. **Funções view faltantes no web3-api.ts:**
   - ❌ `getMiningPlans()` - Buscar planos de mineração
   - ❌ `getEarlyUnstakePenalty()` - Buscar penalidade de unstake
   - ❌ `getWheelSegments()` - Buscar segmentos da roda
   - ❌ `getSwapFee()` - Buscar taxa de swap
   - ❌ `getCommissionRates()` - Buscar taxas de comissão
   - ❌ `getHouseEdge()` - Buscar house edge dos jogos
   - ❌ `getTokenDecimals()` - Buscar decimais dos tokens
   - ❌ `getUserStakes()` - Buscar stakes do usuário
   - ❌ `getUserMiners()` - Buscar miners do usuário
   - ❌ `getLiquidityPoolData()` - Buscar dados da pool de liquidez
   - ❌ `getLotteryData()` - Buscar dados da loteria
   - ❌ `getReferralData()` - Buscar dados de referral

2. **Conexão mock-api.ts ↔ web3-api.ts:**
   - ❌ `getWalletData()` ainda usa localStorage
   - ❌ `getStakingData()` ainda usa localStorage
   - ❌ `getMiningData()` ainda usa localStorage
   - ❌ `getLiquidityData()` ainda usa localStorage
   - ❌ `getLotteryData()` ainda usa localStorage
   - ❌ `getReferralData()` ainda usa localStorage
   - ❌ Todas as funções de ação ainda usam localStorage

3. **Dados hardcoded que precisam ser dinâmicos:**
   - ❌ `STAKING_PLANS` - Ainda hardcoded (já existe `getStakingPlans()` mas não está sendo usado)
   - ❌ `MINING_PLANS` - Hardcoded no mock-api.ts
   - ❌ `segments` - Hardcoded no wheel-of-fortune.tsx
   - ❌ `EARLY_UNSTAKE_PENALTY_PERCENTAGE` - Hardcoded (10%)
   - ❌ Decimais hardcoded (`10**18`) em várias funções
   - ❌ RPC hardcoded (`https://polygon-rpc.com`)

4. **Lógica de jogos que precisa ser refatorada:**
   - ❌ `generateCrashPoint()` - Calcula crash point no frontend (lipt-rocket.tsx linha 96)
   - ❌ `getWeightedRandomSegment()` - Calcula resultado no frontend (wheel-of-fortune.tsx linha 45)
   - ❌ Multiplicador calculado no frontend (lipt-rocket.tsx linha 318)
   - ❌ Frontend não aguarda eventos do contrato

---

## 📊 Tabela de Mapeamento: O que precisa ser feito

### **Categoria 1: Funções View (GETTERS) - Prioridade ALTA**

| Função Necessária | Contrato | Função do Contrato | Status | Prioridade |
|---|---|---|---|---|
| `getMiningPlans()` | `MiningPool.sol` | `plans(uint256)` ou `getMiningPlans()` | ❌ Faltando | 🔴 ALTA |
| `getEarlyUnstakePenalty()` | `StakingPool.sol` | `earlyUnstakePenaltyBasisPoints()` | ❌ Faltando | 🔴 ALTA |
| `getWheelSegments()` | `WheelOfFortune.sol` | `segments(uint256)` ou `getSegments()` | ❌ Faltando | 🔴 ALTA |
| `getSwapFee()` | `DevAdrianSwapPool.sol` | `swapFeeBasisPoints()` | ❌ Faltando | 🟡 MÉDIA |
| `getCommissionRates()` | `ReferralProgram.sol` | `commissionRates(uint256)` | ❌ Faltando | 🟡 MÉDIA |
| `getHouseEdge()` | `RocketGame.sol`<br>`WheelOfFortune.sol` | `houseEdgeBasisPoints()` | ❌ Faltando | 🟡 MÉDIA |
| `getTokenDecimals()` | `LIPTToken.sol`<br>`MockUSDT.sol` | `decimals()` | ❌ Faltando | 🔴 ALTA |
| `getUserStakes()` | `StakingPool.sol` | `getUserStakes(address)` ou eventos | ❌ Faltando | 🔴 ALTA |
| `getUserMiners()` | `MiningPool.sol` | `getUserMiners(address)` ou eventos | ❌ Faltando | 🔴 ALTA |
| `getLiquidityPoolData()` | `DevAdrianSwapPool.sol` | `getReserves()`, `totalSupply()` | ❌ Faltando | 🟡 MÉDIA |
| `getLotteryData()` | `Lottery.sol` | `currentDraw()`, `ticketPrice()` | ❌ Faltando | 🟡 MÉDIA |
| `getReferralData()` | `ReferralProgram.sol` | `getReferrer(address)`, `getCommissions(address)` | ❌ Faltando | 🟡 MÉDIA |

### **Categoria 2: Conexão mock-api.ts → web3-api.ts - Prioridade ALTA**

| Função no mock-api.ts | Deve chamar | Status | Prioridade |
|---|---|---|---|
| `getWalletData()` | `getWalletBalances()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `getStakingData()` | `getUserStakes()` + `getStakingPlans()` | ❌ Ainda usa localStorage | 🔴 ALTA |
| `getMiningData()` | `getUserMiners()` + `getMiningPlans()` | ❌ Ainda usa localStorage | 🔴 ALTA |
| `getLiquidityData()` | `getLiquidityPoolData()` | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `getLotteryData()` | `getLotteryData()` do web3-api.ts | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `getReferralData()` | `getReferralData()` do web3-api.ts | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `purchaseLipt()` | `purchaseLipt()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `stakeLipt()` | `stakeLipt()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `unstakeLipt()` | `unstakeLipt()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `claimStakingRewards()` | `claimStakingRewards()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `activateMiner()` | `activateMiner()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `claimMinedRewards()` | `claimMinedRewards()` do web3-api.ts | ❌ Ainda usa localStorage | 🔴 ALTA |
| `addLiquidity()` | Função do web3-api.ts (faltando) | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `removeLiquidity()` | Função do web3-api.ts (faltando) | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `spinWheel()` | `spinWheel()` do web3-api.ts + aguardar evento | ❌ Ainda calcula no frontend | 🔴 ALTA |
| `placeRocketBet()` | `playRocket()` do web3-api.ts + aguardar evento | ❌ Ainda calcula no frontend | 🔴 ALTA |
| `cashOutRocket()` | `cashOutRocket()` do web3-api.ts | ❌ Ainda calcula no frontend | 🔴 ALTA |
| `buyLotteryTickets()` | `buyLotteryTickets()` do web3-api.ts | ❌ Ainda usa localStorage | 🟡 MÉDIA |
| `claimLotteryPrize()` | `claimLotteryPrize()` do web3-api.ts | ❌ Ainda usa localStorage | 🟡 MÉDIA |

### **Categoria 3: Correções de Configuração - Prioridade MÉDIA**

| Problema | Solução | Status | Prioridade |
|---|---|---|---|
| RPC hardcoded | Mover para `NEXT_PUBLIC_RPC_URL` | ❌ Ainda hardcoded | 🟡 MÉDIA |
| Decimais hardcoded | Usar `getTokenDecimals()` | ❌ Ainda hardcoded | 🔴 ALTA |
| Chain hardcoded | Usar variável de ambiente | ✅ Já usa env var | ✅ OK |

---

## 🎯 Plano de Ação Detalhado da Fase 2

### **Etapa 1: Implementar Funções View Faltantes (Prioridade ALTA)**

#### 1.1. Funções de Configuração (Dados Estáticos)

```typescript
// web3-api.ts

// 1. Buscar planos de mineração
export async function getMiningPlans() {
  const { publicClient } = getClients();
  if (!publicClient) return [];
  
  const miningContract = getContract({
    address: CONTRACT_ADDRESSES.miningPool as Address,
    abi: CONTRACT_ABIS.miningPool,
    client: publicClient,
  });
  
  // Assumindo que o contrato tem getMiningPlans() ou precisa iterar
  const plans = await miningContract.read.getMiningPlans();
  return plans.map((plan: any) => ({
    name: plan.name,
    cost: Number(plan.cost),
    power: Number(plan.power),
    duration: Number(plan.duration),
  }));
}

// 2. Buscar penalidade de unstake
export async function getEarlyUnstakePenalty() {
  const { publicClient } = getClients();
  if (!publicClient) return 10; // Fallback
  
  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: publicClient,
  });
  
  const penalty = await stakingContract.read.earlyUnstakePenaltyBasisPoints();
  return Number(penalty) / 100; // Converter de basis points para porcentagem
}

// 3. Buscar segmentos da roda
export async function getWheelSegments() {
  const { publicClient } = getClients();
  if (!publicClient) return [];
  
  const wheelContract = getContract({
    address: CONTRACT_ADDRESSES.wheelOfFortune as Address,
    abi: CONTRACT_ABIS.wheelOfFortune,
    client: publicClient,
  });
  
  // Assumindo que o contrato tem getSegments() ou precisa iterar
  const segments = await wheelContract.read.getSegments();
  return segments.map((seg: any) => ({
    value: Number(seg.value),
    label: `${seg.value}x`,
    color: seg.color || '#6366f1',
    weight: Number(seg.weight),
  }));
}

// 4. Buscar decimais dos tokens
export async function getTokenDecimals(tokenAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return 18; // Fallback padrão
  
  const tokenContract = getContract({
    address: tokenAddress,
    abi: CONTRACT_ABIS.liptToken, // Assumindo que ambos têm decimals()
    client: publicClient,
  });
  
  const decimals = await tokenContract.read.decimals();
  return Number(decimals);
}

// 5. Buscar taxa de swap
export async function getSwapFee() {
  const { publicClient } = getClients();
  if (!publicClient) return 0;
  
  const swapContract = getContract({
    address: SWAP_ADDRESS,
    abi: CONTRACT_ABIS.swapPool,
    client: publicClient,
  });
  
  const fee = await swapContract.read.swapFeeBasisPoints();
  return Number(fee) / 10000; // Converter de basis points para decimal
}

// 6. Buscar house edge dos jogos
export async function getHouseEdge(game: 'rocket' | 'wheel') {
  const { publicClient } = getClients();
  if (!publicClient) return 0;
  
  const contractAddress = game === 'rocket' 
    ? CONTRACT_ADDRESSES.rocketGame 
    : CONTRACT_ADDRESSES.wheelOfFortune;
  const abi = game === 'rocket'
    ? CONTRACT_ABIS.rocketGame
    : CONTRACT_ABIS.wheelOfFortune;
  
  const gameContract = getContract({
    address: contractAddress as Address,
    abi,
    client: publicClient,
  });
  
  const houseEdge = await gameContract.read.houseEdgeBasisPoints();
  return Number(houseEdge) / 10000;
}
```

#### 1.2. Funções de Dados do Usuário (Dados Dinâmicos)

```typescript
// web3-api.ts

// 7. Buscar stakes do usuário
export async function getUserStakes(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return [];
  
  const stakingContract = getContract({
    address: STAKING_ADDRESS,
    abi: CONTRACT_ABIS.stakingPool,
    client: publicClient,
  });
  
  // Assumindo que o contrato tem getUserStakes(address)
  const stakes = await stakingContract.read.getUserStakes([userAddress]);
  return stakes.map((stake: any, index: number) => ({
    id: index.toString(),
    amount: Number(stake.amount),
    startDate: Number(stake.startDate) * 1000, // Converter para ms
    plan: {
      duration: Number(stake.plan.duration),
      apy: Number(stake.plan.apy),
    },
  }));
}

// 8. Buscar miners do usuário
export async function getUserMiners(userAddress: Address) {
  const { publicClient } = getClients();
  if (!publicClient) return [];
  
  const miningContract = getContract({
    address: CONTRACT_ADDRESSES.miningPool as Address,
    abi: CONTRACT_ABIS.miningPool,
    client: publicClient,
  });
  
  const miners = await miningContract.read.getUserMiners([userAddress]);
  return miners.map((miner: any, index: number) => ({
    id: index.toString(),
    startDate: Number(miner.startDate) * 1000,
    plan: {
      name: miner.plan.name,
      cost: Number(miner.plan.cost),
      power: Number(miner.plan.power),
      duration: Number(miner.plan.duration),
    },
    minedAmount: Number(miner.minedAmount),
  }));
}

// 9. Buscar dados da pool de liquidez
export async function getLiquidityPoolData() {
  const { publicClient } = getClients();
  if (!publicClient) return null;
  
  const swapContract = getContract({
    address: SWAP_ADDRESS,
    abi: CONTRACT_ABIS.swapPool,
    client: publicClient,
  });
  
  const [reserves, totalSupply] = await Promise.all([
    swapContract.read.getReserves(),
    swapContract.read.totalSupply(),
  ]);
  
  return {
    totalLipt: Number(reserves[0]),
    totalUsdt: Number(reserves[1]),
    totalLpTokens: Number(totalSupply),
  };
}

// 10. Buscar dados da loteria
export async function getLotteryData() {
  const { publicClient } = getClients();
  if (!publicClient) return null;
  
  const lotteryContract = getContract({
    address: CONTRACT_ADDRESSES.lottery as Address,
    abi: CONTRACT_ABIS.lottery,
    client: publicClient,
  });
  
  const [ticketPrice, currentDraw] = await Promise.all([
    lotteryContract.read.ticketPrice(),
    lotteryContract.read.currentDraw(),
  ]);
  
  return {
    ticketPrice: Number(ticketPrice),
    currentDraw: {
      id: Number(currentDraw.id),
      prizePool: Number(currentDraw.prizePool),
      endTime: Number(currentDraw.endTime) * 1000,
      status: currentDraw.status,
    },
  };
}
```

---

### **Etapa 2: Conectar mock-api.ts com web3-api.ts**

#### 2.1. Atualizar getWalletData()

```typescript
// mock-api.ts

import { getWalletBalances, getTokenDecimals } from './web3-api';
import { LIPT_ADDRESS, USDT_ADDRESS } from '../config/contracts';

export const getWalletData = async (userAddress: string) => {
  if (!userAddress) {
    return getFromStorage('wallet', initialWallet);
  }
  
  try {
    const balances = await getWalletBalances(userAddress as Address);
    const [liptDecimals, usdtDecimals] = await Promise.all([
      getTokenDecimals(LIPT_ADDRESS),
      getTokenDecimals(USDT_ADDRESS),
    ]);
    
    return {
      liptBalance: parseFloat(balances.liptBalance) / (10 ** liptDecimals),
      usdtBalance: parseFloat(balances.usdtBalance) / (10 ** usdtDecimals),
    };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return getFromStorage('wallet', initialWallet); // Fallback
  }
};
```

#### 2.2. Atualizar getStakingData()

```typescript
// mock-api.ts

import { getUserStakes, getStakingPlans, getEarlyUnstakePenalty } from './web3-api';

export const getStakingData = async (userAddress: string) => {
  if (!userAddress) {
    return getFromStorage('staking', initialStaking);
  }
  
  try {
    const [stakes, plans, penalty] = await Promise.all([
      getUserStakes(userAddress as Address),
      getStakingPlans(),
      getEarlyUnstakePenalty(),
    ]);
    
    // Calcular recompensas não reivindicadas
    const unclaimedRewards = stakes.reduce((total, stake) => {
      const now = Date.now();
      const elapsed = (now - stake.startDate) / (1000 * 60 * 60 * 24); // dias
      const dailyReward = (stake.amount * stake.plan.apy / 100) / stake.plan.duration;
      return total + (dailyReward * elapsed);
    }, 0);
    
    return {
      stakes,
      plans,
      stakedBalance: stakes.reduce((sum, s) => sum + s.amount, 0),
      unclaimedRewards,
      earlyUnstakePenalty: penalty,
    };
  } catch (error) {
    console.error('Error fetching staking data:', error);
    return getFromStorage('staking', initialStaking); // Fallback
  }
};
```

---

### **Etapa 3: Refatorar Lógica de Jogos**

#### 3.1. Remover Cálculos do Frontend

**Problema atual:**
- `generateCrashPoint()` calcula no frontend
- `getWeightedRandomSegment()` calcula no frontend
- Multiplicador calculado no frontend

**Solução:**
1. Enviar aposta ao contrato
2. Aguardar evento do contrato com resultado
3. Remover todas as funções de cálculo do frontend
4. Usar apenas para animação visual

#### 3.2. Implementar Aguardo de Eventos

```typescript
// web3-api.ts

export async function waitForRocketResult(
  userAddress: Address,
  betIndex: number,
  onResult: (result: { multiplier: number; crashed: boolean }) => void
) {
  const { publicClient } = getClients();
  if (!publicClient) return;
  
  const rocketContract = getContract({
    address: CONTRACT_ADDRESSES.rocketGame as Address,
    abi: CONTRACT_ABIS.rocketGame,
    client: publicClient,
  });
  
  // Aguardar evento RocketResult
  const unwatch = rocketContract.watchEvent.RocketResult(
    {
      args: { player: userAddress, betIndex },
    },
    {
      onLogs: (logs) => {
        const log = logs[0];
        onResult({
          multiplier: Number(log.args.multiplier),
          crashed: log.args.crashed,
        });
        unwatch();
      },
    }
  );
}
```

---

### **Etapa 4: Correções de Configuração**

#### 4.1. Mover RPC para Variável de Ambiente

```typescript
// web3-api.ts

function getClients() {
  if (typeof window === 'undefined') {
    return { publicClient: null, walletClient: null };
  }

  if (!publicClient) {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com';
    publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl),
    });
  }
  // ...
}
```

#### 4.2. Usar Decimais Dinâmicos

```typescript
// mock-api.ts

export const purchaseLipt = async (userAddress: string, amount: number) => {
  const decimals = await getTokenDecimals(USDT_ADDRESS);
  const amountBigInt = BigInt(amount * (10 ** decimals));
  
  const hash = await web3PurchaseLipt(userAddress as Address, amountBigInt);
  return { hash };
};
```

---

## 📋 Checklist de Implementação

### **Prioridade ALTA (Fazer Primeiro)**

- [ ] Implementar `getMiningPlans()` no web3-api.ts
- [ ] Implementar `getEarlyUnstakePenalty()` no web3-api.ts
- [ ] Implementar `getWheelSegments()` no web3-api.ts
- [ ] Implementar `getTokenDecimals()` no web3-api.ts
- [ ] Implementar `getUserStakes()` no web3-api.ts
- [ ] Implementar `getUserMiners()` no web3-api.ts
- [ ] Conectar `getWalletData()` com `getWalletBalances()`
- [ ] Conectar `getStakingData()` com funções do web3-api.ts
- [ ] Conectar `getMiningData()` com funções do web3-api.ts
- [ ] Refatorar `spinWheel()` para usar contrato + eventos
- [ ] Refatorar `placeRocketBet()` para usar contrato + eventos
- [ ] Mover RPC para variável de ambiente

### **Prioridade MÉDIA (Fazer Depois)**

- [ ] Implementar `getSwapFee()` no web3-api.ts
- [ ] Implementar `getCommissionRates()` no web3-api.ts
- [ ] Implementar `getHouseEdge()` no web3-api.ts
- [ ] Implementar `getLiquidityPoolData()` no web3-api.ts
- [ ] Implementar `getLotteryData()` no web3-api.ts
- [ ] Implementar `getReferralData()` no web3-api.ts
- [ ] Conectar `getLiquidityData()` com web3-api.ts
- [ ] Conectar `getLotteryData()` com web3-api.ts
- [ ] Conectar `getReferralData()` com web3-api.ts
- [ ] Implementar `addLiquidity()` no web3-api.ts
- [ ] Implementar `removeLiquidity()` no web3-api.ts

---

## ⚠️ Observações Importantes

1. **Verificar ABIs dos Contratos:**
   - Algumas funções podem ter nomes diferentes
   - Alguns contratos podem não ter funções view para todos os dados
   - Pode ser necessário usar eventos em vez de funções view

2. **Fallbacks:**
   - Sempre ter fallback para dados mock quando o contrato falhar
   - Tratar erros graciosamente
   - Logar erros para debug

3. **Performance:**
   - Cachear dados que não mudam frequentemente (planos, taxas)
   - Usar SWR para cache automático
   - Evitar múltiplas chamadas desnecessárias

4. **Testes:**
   - Testar com MetaMask conectado
   - Testar sem wallet conectado (fallback)
   - Testar com contratos na mainnet
   - Verificar se os dados estão corretos

---

## 🎯 Resultado Esperado

Após a Fase 2:
- ✅ Todos os dados vêm dos Smart Contracts
- ✅ Nenhum dado hardcoded (exceto fallbacks)
- ✅ Lógica de jogos validada on-chain
- ✅ Configurações via variáveis de ambiente
- ✅ Aplicação totalmente integrada com blockchain

---

**Data da Análise:** 2024  
**Status:** ⏳ Pronto para implementação

