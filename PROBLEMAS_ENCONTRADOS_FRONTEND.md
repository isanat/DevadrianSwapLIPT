# 🚨 Problemas Encontrados na Verificação do Frontend

**Data:** Dezembro 2025

---

## ✅ CORRIGIDO

### 1. MiningPool
- ✅ `activateMiner` usa `planId` corretamente
- ✅ `claimMinedRewards` permite claim individual por miner
- ✅ Rewards calculados corretamente do contrato

---

## ❌ PROBLEMAS A CORRIGIR

### 2. StakingPool

**Problema:** `claimStakingRewards` requer `stakeId` individual, mas componente tenta claimar todos

**Detalhes:**
- Contrato: `claimRewards(uint256 stakeId)` requer stakeId
- Componente: `claimStakingRewards(userAddress)` sem stakeId
- Linha 187: `await claimStakingRewards(userAddress);` - falta stakeId

**Solução:**
- Adicionar função `calculateStakingRewards(userAddress, stakeId)` em `web3-api.ts`
- Atualizar `getUserStakes` para incluir rewards disponíveis por stake
- Adicionar botão "Claim" individual em cada `StakedPosition`
- Remover/modificar botão geral de claim

---

### 3. TokenPurchase

**Problema:** Parâmetro incorreto - passa LIPT amount mas função espera USDT amount

**Detalhes:**
- Componente linha 51: `await purchaseLipt(userAddress!, amountToBuy);` - `amountToBuy` é LIPT
- `web3-api.ts:541`: `purchaseLipt(userAddress: Address, usdtAmount: bigint)` - espera USDT
- `mock-api.ts:552`: `const usdtAmountBigInt = BigInt(amount * (10 ** usdtDecimals));` - trata `amount` (LIPT) como USDT

**Solução:**
- Componente deve passar `usdtAmount` (valor em USDT)
- Ou converter LIPT amount para USDT antes de passar
- O contrato faz swap de USDT -> LIPT, então precisa de USDT amount

---

## ⏳ PENDENTE VERIFICAÇÃO

### 4. LiquidityPool
- Verificar aprovações funcionam
- Verificar cálculos de LP tokens

### 5. ReferralDashboard
- Verificar geração de links
- Verificar comissões

### 6. GameZone
- Wheel of Fortune
- Rocket Game
- Daily Lottery

### 7. Leaderboard
- Verificar se dados são buscados corretamente

---

## 📝 RESUMO

**Total de problemas encontrados:** 2 (além do MiningPool já corrigido)

**Prioridade:**
1. ❌ StakingPool - Claim individual por stake
2. ❌ TokenPurchase - Corrigir parâmetro USDT vs LIPT

