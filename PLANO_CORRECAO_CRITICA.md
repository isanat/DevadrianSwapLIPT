# 🚨 PLANO DE CORREÇÃO CRÍTICA - Sistema Hardcoded

## 📋 DIAGNÓSTICO ATUAL

### ❌ **PROBLEMAS CRÍTICOS IDENTIFICADOS:**

1. **Sistema usa localStorage em vez de blockchain**
   - Todas as funções ainda usam `localStorage` para salvar dados
   - Não há integração real com os Smart Contracts
   - Dados são mockados e não persistem

2. **Funções faltando integração:**
   - `getWalletData()` - Usa localStorage
   - `getStakingData()` - Usa localStorage  
   - `getMiningData()` - Usa localStorage
   - `getLiquidityData()` - Usa localStorage
   - `getLotteryData()` - Usa localStorage
   - `getReferralData()` - Usa localStorage

3. **Lógica de jogos no frontend (INSEGURO):**
   - Crash point calculado no frontend (manipulável)
   - Multiplicadores calculados no frontend
   - Segmentos da roda hardcoded no frontend

4. **Funções view faltando:**
   - `getMiningPlans()` - Não busca do contrato
   - `getWheelSegments()` - Não busca do contrato
   - `getLiquidityPoolData()` - Não busca do contrato
   - `getUserStakes()` - Não busca do contrato
   - `getUserMiners()` - Não busca do contrato

---

## 🎯 PLANO DE AÇÃO PRIORITIZADO

### **FASE 1: CORREÇÕES URGENTES (1-2 dias)**

#### 1.1. Conectar `getWalletData()` com blockchain
- ❌ **Status Atual:** Usa localStorage
- ✅ **Ação:** Substituir por chamada ao `getWalletBalances()` do web3-api
- 📁 **Arquivo:** `src/services/mock-api.ts`

#### 1.2. Conectar `getStakingData()` com blockchain
- ❌ **Status Atual:** Usa localStorage
- ✅ **Ação:** Criar `getUserStakes()` no web3-api e conectar
- 📁 **Arquivos:** `src/services/web3-api.ts`, `src/services/mock-api.ts`

#### 1.3. Implementar funções view básicas faltantes
- `getMiningPlans()` - Buscar do contrato MiningPool
- `getUserStakes()` - Buscar stakes do usuário
- `getUserMiners()` - Buscar miners do usuário

---

### **FASE 2: INTEGRAÇÃO DE JOGOS (2-3 dias)**

#### 2.1. Refatorar Wheel of Fortune
- Remover `segments` hardcoded
- Implementar `getWheelSegments()` no web3-api
- Conectar `spinWheel()` com eventos do contrato
- Remover lógica de cálculo no frontend

#### 2.2. Refatorar LIPT Rocket
- Remover `generateCrashPoint()` do frontend
- Conectar `playRocket()` com eventos do contrato
- Aguardar resultado do contrato (não calcular localmente)
- Remover cálculo de multiplicador do frontend

---

### **FASE 3: LIQUIDEZ E POOLS (1-2 dias)**

#### 3.1. Implementar funções de liquidez
- `getLiquidityPoolData()` - Buscar dados da pool
- `addLiquidity()` - Adicionar liquidez (já existe parcialmente)
- `removeLiquidity()` - Remover liquidez (já existe parcialmente)
- Conectar com o contrato `DevAdrianSwapPool`

---

### **FASE 4: LOTERIA E REFERRAL (1-2 dias)**

#### 4.1. Conectar loteria
- `getLotteryData()` - Buscar dados do contrato
- Conectar com eventos da loteria

#### 4.2. Conectar referral
- `getReferralData()` - Buscar dados do contrato
- Buscar estrutura de referidos

---

## ⚡ AÇÕES IMEDIATAS RECOMENDADAS

### **Opção A: Correção Gradual (Recomendado)**
1. Começar pela Fase 1 (funções view básicas)
2. Conectar uma funcionalidade de cada vez
3. Testar após cada correção

### **Opção B: Correção Completa**
1. Refatorar todo o `mock-api.ts` de uma vez
2. Substituir todas as chamadas localStorage
3. Conectar tudo com web3-api.ts

---

## 📝 NOTAS IMPORTANTES

⚠️ **Atenção:** Algumas funcionalidades requerem eventos da blockchain:
- Jogos precisam aguardar eventos dos contratos
- Staking precisa escutar eventos de Stake/Unstake
- Mineração precisa escutar eventos de MinerActivated

💡 **Solução Temporária:**
- Usar polling para buscar dados do contrato
- Implementar event listener no futuro

---

**Última Atualização:** 2025-11-26
**Prioridade:** 🔴 CRÍTICA

