# 📋 Tarefas Pendentes do Projeto DevAdrian Swap

**Data:** 14 de Novembro de 2025  
**Última Atualização do Repositório:** Commit `37591b58`

---

## ✅ Status Geral das Fases

| Fase | Status | Progresso | Descrição |
|------|--------|-----------|-----------|
| **Fase 1** | ✅ **CONCLUÍDA** | 100% | Integração do endereço da carteira conectada |
| **Fase 2** | 🔄 **EM PROGRESSO** | ~60% | Integração com dados on-chain dos contratos |
| **Fase 3.1** | ✅ **CONCLUÍDA** | 100% | Substituição de textos hardcoded por i18n |
| **Fase 3.2-3.4** | ⏳ **PENDENTE** | 0% | Backend off-chain e listener de eventos |

---

## 🔄 Fase 2: Integração com Dados On-Chain (~60% Concluída)

### ✅ O que JÁ foi feito:

1. **Funções View Implementadas:**
   - ✅ `getTokenDecimals()` - Busca decimais dos tokens
   - ✅ `getMiningPlans()` - Busca planos de mineração
   - ✅ `getEarlyUnstakePenalty()` - Busca penalidade de unstake
   - ✅ `getUserStakes()` - Busca stakes do usuário
   - ✅ `getUserMiners()` - Busca miners do usuário

2. **Conexões Estabelecidas (mock-api.ts ↔ web3-api.ts):**
   - ✅ `getWalletData()` → `getWalletBalances()` + `getTokenDecimals()`
   - ✅ `getStakingData()` → `getUserStakes()` + `getStakingPlans()` + `getEarlyUnstakePenalty()`
   - ✅ `getMiningData()` → `getUserMiners()` + `getMiningPlans()`

3. **Funções de Ação Conectadas:**
   - ✅ `purchaseLipt()` → `web3PurchaseLipt()`
   - ✅ `stakeLipt()` → `web3StakeLipt()`
   - ✅ `unstakeLipt()` → `web3UnstakeLipt()`
   - ✅ `claimStakingRewards()` → `web3ClaimStakingRewards()`
   - ✅ `activateMiner()` → `web3ActivateMiner()`
   - ✅ `claimMinedRewards()` → `web3ClaimMinedRewards()`

4. **Componentes Atualizados:**
   - ✅ `staking-pool.tsx` - Usa planos do contrato
   - ✅ `mining-pool.tsx` - Usa planos do contrato

5. **Configuração:**
   - ✅ RPC movido para variável de ambiente
   - ✅ Decimais dinâmicos implementados

---

### ⏳ O que FALTA fazer na Fase 2:

#### 🔴 **Prioridade ALTA:**

1. **Funções View Faltantes:**
   - ⏳ `getWheelSegments()` - Buscar segmentos da Wheel of Fortune do contrato
   - ⏳ `getLiquidityPoolData()` - Buscar dados da pool de liquidez

2. **Refatoração de Jogos (CRÍTICO):**
   - ⏳ **Wheel of Fortune:**
     - Implementar `getWheelSegments()` no web3-api.ts
     - Remover `segments` hardcoded do `wheel-of-fortune.tsx`
     - Remover `getWeightedRandomSegment()` do frontend
     - Refatorar `spinWheel()` para usar contrato + aguardar eventos
   
   - ⏳ **LIPT Rocket:**
     - Remover `generateCrashPoint()` do frontend (`lipt-rocket.tsx` linha 96)
     - Remover cálculo de multiplicador do frontend
     - Refatorar `placeRocketBet()` para usar contrato + aguardar eventos
     - Refatorar `cashOutRocket()` para usar contrato

3. **Conexões Faltantes (mock-api.ts ↔ web3-api.ts):**
   - ⏳ `getLiquidityData()` → Conectar com `getLiquidityPoolData()`
   - ⏳ `addLiquidity()` → Implementar no web3-api.ts
   - ⏳ `removeLiquidity()` → Implementar no web3-api.ts

#### 🟡 **Prioridade MÉDIA:**

4. **Funções View Adicionais:**
   - ⏳ `getSwapFee()` - Buscar taxa de swap
   - ⏳ `getCommissionRates()` - Buscar taxas de comissão do referral
   - ⏳ `getHouseEdge()` - Buscar house edge dos jogos
   - ⏳ `getLotteryData()` - Buscar dados da loteria (view)
   - ⏳ `getReferralData()` - Buscar dados de referral (view)

5. **Conexões Adicionais:**
   - ⏳ `getLotteryData()` → Conectar com web3-api.ts
   - ⏳ `getReferralData()` → Conectar com web3-api.ts

#### 🟢 **Prioridade BAIXA (Pode ser feito depois):**

6. **Textos Hardcoded Restantes:**
   - ⏳ `lipt-rocket.tsx` linha 406: "Aposta inválida"
   - ⏳ `liquidity-pool.tsx` linhas 48, 68: "Error"
   - ⏳ `mining-pool.tsx` linhas 118, 130, 149: "Error" e "Please select a mining plan"
   - ⏳ `staking-pool.tsx` linhas 152, 166, 192: "Error" e "Please select a staking plan"

---

## ⏳ Fase 3.2-3.4: Backend Off-Chain (0% Concluída)

### 📋 Tarefas Pendentes:

#### **Fase 3.2: Estrutura Inicial do Backend**

- ⏳ Decidir arquitetura: API Routes do Next.js vs Serviço Backend Separado
- ⏳ Criar estrutura de pastas `src/app/api/`
- ⏳ Implementar endpoints básicos:
  - `GET /api/history` - Histórico de transações
  - `GET /api/history/[userId]` - Histórico do usuário
  - `GET /api/leaderboard` - Ranking de referidos
  - `GET /api/stats` - Estatísticas agregadas

#### **Fase 3.3: Listener de Eventos Blockchain**

- ⏳ Criar serviço `src/services/blockchain-listener.ts`
- ⏳ Implementar escuta de eventos:
  - `Stake`, `Unstake`, `RewardClaimed` (StakingPool)
  - `MinerActivated`, `RewardsClaimed` (MiningPool)
  - `WheelSpun` (WheelOfFortune)
  - `RocketPlayed`, `RocketCashedOut` (RocketGame)
  - `TicketsPurchased`, `PrizeClaimed` (Lottery)
  - `ReferralReward` (ReferralProgram)
- ⏳ Salvar eventos no banco de dados PostgreSQL
- ⏳ Configurar como background job (node-cron)

#### **Fase 3.4: Endpoints de Dados Agregados**

- ⏳ Implementar `GET /api/leaderboard` (top 10 por comissão)
- ⏳ Implementar `GET /api/stats` (TVL, total staking, etc.)
- ⏳ Implementar `GET /api/history/[userId]` com filtros

---

## 🎯 Recomendação de Próximos Passos

### **Opção 1: Completar Fase 2 (Recomendado)**

**Por quê?** A Fase 2 está 60% concluída e as tarefas restantes são críticas para o funcionamento correto dos jogos.

**Próximas ações:**
1. Implementar `getWheelSegments()` e atualizar `wheel-of-fortune.tsx`
2. Refatorar lógica dos jogos (Rocket e Wheel) para usar contratos
3. Implementar funções de liquidez (`addLiquidity`, `removeLiquidity`)
4. Corrigir textos hardcoded restantes

**Tempo estimado:** 4-6 horas

---

### **Opção 2: Iniciar Fase 3.2 (Backend)**

**Por quê?** Se você quer começar a construir o backend para dados agregados.

**Próximas ações:**
1. Decidir arquitetura (API Routes vs Backend Separado)
2. Criar estrutura de endpoints
3. Implementar listener de eventos básico

**Tempo estimado:** 8-12 horas

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| **Contratos Implantados** | 11/11 (100%) |
| **Componentes Atualizados (Fase 1)** | 9/9 (100%) |
| **Funções API Atualizadas (Fase 1)** | 21/21 (100%) |
| **Integração Web3 (Fase 2)** | ~60% |
| **Textos Traduzidos (Fase 3.1)** | ~95% |
| **Backend Off-Chain (Fase 3.2-3.4)** | 0% |

---

## ⚠️ Pontos de Atenção

1. **Lógica de Jogos no Frontend:** Atualmente, o crash point e os resultados da roda são calculados no frontend. Isso é um **risco de segurança** e precisa ser refatorado urgentemente.

2. **Eventos de Contrato:** As funções de jogos ainda não aguardam eventos do contrato para confirmar resultados.

3. **Mapeamento de planId:** As funções `stakeLipt()` e `activateMiner()` fazem mapeamento de plano para planId. Isso pode falhar se os planos não corresponderem.

4. **Textos Hardcoded:** Ainda há alguns textos hardcoded em mensagens de erro que precisam ser traduzidos.

---

**Preparado por:** Manus AI  
**Data:** 14 de Novembro de 2025
