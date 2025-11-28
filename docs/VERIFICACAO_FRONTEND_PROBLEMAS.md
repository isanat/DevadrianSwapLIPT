# 🔍 Verificação do Frontend - Problemas Encontrados

**Data:** Dezembro 2025  
**Status:** ❌ Vários problemas identificados

---

## 📋 Resumo dos Cards do Dashboard

1. ✅ **StatsGroup** - Estatísticas e Saldos
2. ✅ **StakingPool** - Pool de Staking  
3. ❌ **MiningPool** - Pool de Mineração (PROBLEMAS)
4. ✅ **LiquidityPool** - Pool de Liquidez
5. ✅ **TokenPurchase** - Compra de Tokens
6. ✅ **ReferralDashboard** - Programa de Afiliados
7. ✅ **GameZone** - Área de Jogos
8. ✅ **Leaderboard** - Ranking

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. ❌ MiningPool - `activateMiner` - Parâmetro Incorreto

**Arquivo:** `src/components/dashboard/mining-pool.tsx:125`

**Problema:**
- Componente passa objeto `selectedPlan` (com `name`, `cost`, `power`, `duration`)
- Função `web3-api.ts:activateMiner` espera apenas `planId: number`
- `mock-api.ts` também espera objeto `plan`, mas não está usando `web3-api.ts`

**Código Atual:**
```typescript
// Componente
await activateMiner(userAddress!, selectedPlan);

// web3-api.ts espera
activateMiner(userAddress: Address, planId: number)
```

**Solução:**
- Encontrar `planId` do `selectedPlan` comparando com `miningData.plans`
- Passar `planId` para `activateMiner`
- Atualizar `mock-api.ts` para buscar planId também

---

### 2. ❌ MiningPool - `claimMinedRewards` - Falta `minerId`

**Arquivo:** `src/components/dashboard/mining-pool.tsx:144`

**Problema:**
- Componente chama `claimMinedRewards(userAddress!)` sem `minerId`
- Contrato requer `claimMinedRewards(uint256 minerId)` por miner individual
- Não há função para claimar todos os rewards de uma vez

**Código Atual:**
```typescript
// Componente tenta claimar tudo
await claimMinedRewards(userAddress!);

// Contrato requer minerId específico
claimMinedRewards(uint256 minerId)
```

**Solução:**
- Adicionar botão "Claim" individual em cada `ActiveMiner`
- Ou criar função que faz múltiplos claims (um por miner)
- Atualizar UI para mostrar rewards por miner

---

### 3. ⚠️ MiningPool - `getMiningData` - Pode estar incompleto

**Arquivo:** `src/services/mock-api.ts`

**Verificar:**
- Se está calculando `minedRewards` corretamente por miner
- Se está somando todos os rewards disponíveis
- Se está mostrando `minedAmount` por miner individual

---

### 4. ⚠️ TokenPurchase - `purchaseLipt` - Parâmetro pode estar incorreto

**Arquivo:** `src/components/dashboard/token-purchase.tsx:51`

**Verificar:**
- Se está passando `usdtAmount` (valor correto)
- Se `web3-api.ts:purchaseLipt` espera `usdtAmount` ou `liptAmount`

---

### 5. ✅ StatsGroup - Parece OK
- Busca `getWalletData` e `getDashboardStats` corretamente
- Mostra saldos de LIPT e USDT
- Mostra estatísticas do dashboard

---

### 6. ✅ StakingPool - Parece OK
- Busca `getStakingData` corretamente
- Permite stake/unstake por stakeId individual
- Claim rewards por stakeId individual (correto)

---

### 7. ✅ LiquidityPool - Parece OK
- Busca `getLiquidityData` corretamente
- Permite adicionar/remover liquidez
- Validações corretas

---

### 8. ✅ GameZone - Parece OK
- Integrado com Wheel of Fortune e Rocket Game
- Busca dados dos contratos

---

## 📝 AÇÕES NECESSÁRIAS

1. ✅ Corrigir `activateMiner` para usar `planId` em vez de objeto
2. ✅ Corrigir `claimMinedRewards` para permitir claim por miner individual
3. ✅ Verificar cálculo de rewards por miner
4. ✅ Verificar se TokenPurchase está correto
5. ✅ Testar todos os fluxos após correções

