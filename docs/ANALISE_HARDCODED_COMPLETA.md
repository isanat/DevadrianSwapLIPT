# 🔍 ANÁLISE COMPLETA: DADOS HARDCODED E FALLBACKS

## 📋 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Função Duplicada (CORRIGIDO)**
- ✅ `getLiquidityPoolData` estava duplicada no `web3-api.ts`
- ✅ Removida a versão duplicada

---

## 🚨 TRECHOS HARDCODED QUE PRECISAM SER SUBSTITUÍDOS

### 2. **Wheel of Fortune - Segmentos Hardcoded**
**Arquivo:** `src/components/dashboard/wheel-of-fortune.tsx`
**Linhas:** 18-27

```typescript
const defaultSegments = [
    { value: 1.5, label: '1.5x', color: '#6366f1', weight: 8 },
    { value: 0,   label: '0x',   color: '#ef4444', weight: 25 },
    // ... mais 6 segmentos
];
```

**Status:** ❌ HARDCODED
**Problema:** Segmentos devem vir do contrato `WheelOfFortune`
**Solução:** Já existe `getWheelSegments()` no web3-api.ts, mas o componente usa fallback hardcoded
**Ação:** Remover `defaultSegments` e garantir que sempre busca do contrato

---

### 3. **Rocket Game - Crash Point Hardcoded**
**Arquivo:** `src/components/dashboard/lipt-rocket.tsx`
**Linha:** 409

```typescript
// TODO: Obter crash point do evento RocketPlayed
crashPointRef.current = 2.0; // Valor temporário para animação
```

**Status:** ❌ HARDCODED
**Problema:** Crash point deve vir do evento emitido pelo contrato
**Solução:** Escutar evento `RocketPlayed` do contrato para obter o crash point real
**Ação:** Implementar listener de eventos para obter crash point do blockchain

---

### 4. **Mock Data em localStorage**
**Arquivo:** `src/services/mock-api.ts`
**Múltiplas linhas**

**Status:** ⚠️ FALLBACK AINDA ATIVO
**Problema:** Todas as funções ainda usam `getFromStorage()` como fallback
**Ações necessárias:**
- ❌ Remover todos os `getFromStorage()` e `saveToStorage()`
- ❌ Garantir que apenas smart contracts são usados
- ❌ Remover `initialWallet`, `initialStaking`, etc.

---

### 5. **Valores Hardcoded em Fallbacks**

#### 5.1. Comissão de Referral
**Arquivo:** `src/services/web3-api.ts`
**Linha:** 711

```typescript
return [10, 5, 3]; // Fallback
```

**Status:** ⚠️ FALLBACK HARDCODED
**Problema:** Deveria retornar array vazio ou null em caso de erro
**Ação:** Mudar para retornar `[]` ou `null`

#### 5.2. House Edge
**Arquivo:** `src/services/web3-api.ts`
**Linha:** 717, 738

```typescript
if (!publicClient) return 200; // Default 2% (200 basis points)
return 200; // Fallback
```

**Status:** ⚠️ FALLBACK HARDCODED
**Problema:** Valores padrão podem não refletir o contrato
**Ação:** Retornar `null` ou `0` e tratar no frontend

#### 5.3. Decimais Assumidos
**Arquivo:** `src/services/web3-api.ts`
**Múltiplas funções**

**Status:** ✅ JÁ CORRIGIDO
**Observação:** Já existe `getTokenDecimals()` que busca do contrato

---

### 6. **Volume 24h e Fees Hardcoded**
**Arquivo:** `src/services/web3-api.ts`
**Linhas:** 283, 288

```typescript
volume24h: 0, // TODO: Implementar histórico de volume (requer eventos)
feesEarned: 0, // TODO: Implementar cálculo de fees (requer eventos)
```

**Status:** ⚠️ TODO
**Problema:** Valores zerados, devem vir de eventos históricos
**Ação:** Implementar sistema de indexação de eventos

---

### 7. **Referral Network Mock**
**Arquivo:** `src/services/mock-api.ts`
**Linhas:** 146-156

```typescript
const initialReferralData = {
    totalReferrals: 12,
    totalRewards: 1530.75,
    network: [
        { id: 1, level: 1, members: 5, commission: 850.50 },
        // ... mais níveis hardcoded
    ]
};
```

**Status:** ❌ HARDCODED
**Problema:** Network de referidos deve vir do contrato
**Ação:** Implementar função para buscar árvore de referidos do contrato

---

### 8. **Lottery End Time Hardcoded**
**Arquivo:** `src/services/web3-api.ts`
**Linha:** 356

```typescript
endTime: Date.now() + 24 * 60 * 60 * 1000, // TODO: Buscar do contrato se houver
```

**Status:** ⚠️ TODO
**Problema:** End time deve vir do contrato
**Ação:** Buscar do contrato `currentDraw.endTime` se existir

---

## ✅ CORREÇÕES JÁ IMPLEMENTADAS

1. ✅ Link de afiliado dinâmico (domínio do Vercel)
2. ✅ Funções view básicas implementadas
3. ✅ Integração mock-api com web3-api
4. ✅ Função duplicada removida

---

## 🎯 PLANO DE AÇÃO PRIORITIZADO

### **FASE 1: Remover Fallbacks Hardcoded (URGENTE)**

1. **Remover segmentos hardcoded da Wheel**
   - Remover `defaultSegments`
   - Garantir que `getWheelSegments()` sempre retorna dados válidos
   - Adicionar loading state enquanto busca

2. **Implementar crash point do contrato**
   - Escutar evento `RocketPlayed` após transação
   - Obter crash point do evento
   - Atualizar animação com valor real

3. **Remover localStorage completamente**
   - Remover todas as chamadas `getFromStorage()` e `saveToStorage()`
   - Remover constantes `initial*`
   - Garantir que apenas smart contracts são a fonte de verdade

### **FASE 2: Corrigir Fallbacks (IMPORTANTE)**

4. **Corrigir fallbacks de valores**
   - Comissão: retornar `[]` ou `null`
   - House Edge: retornar `null` e tratar no frontend
   - Decimais: já corrigido ✅

5. **Implementar histórico de eventos**
   - Volume 24h: indexar eventos de swap
   - Fees earned: calcular de eventos
   - Lottery history: indexar sorteios anteriores

### **FASE 3: Melhorias (OPCIONAL)**

6. **Buscar network de referidos do contrato**
   - Implementar função recursiva para buscar árvore
   - Ou criar evento indexer para manter árvore no banco

7. **Buscar end time da loteria do contrato**
   - Verificar se contrato tem `endTime`
   - Se não tiver, calcular baseado em `startTime + duration`

---

## 📝 NOTAS

- Todos os valores hardcoded devem ser substituídos por dados do smart contract
- Fallbacks devem retornar valores seguros (0, [], null) não mockados
- Sistema deve funcionar mesmo sem conexão blockchain (com valores zerados, não mockados)

**Última atualização:** 2025-11-26

