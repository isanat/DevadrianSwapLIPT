# 🔍 RELATÓRIO: DADOS MOCKADOS E HARDCODED

## 📋 SUMÁRIO
Este documento lista todos os dados mockados, hardcoded e valores fixos encontrados no código que precisam ser substituídos por dados dinâmicos do banco de dados ou smart contracts.

---

## 🚨 CRÍTICO - DADOS QUE PRECISAM SER SUBSTITUÍDOS

### 1. **MOCK-API.TS** (`src/services/mock-api.ts`)

#### 1.1. Endereço de Usuário Mockado
```typescript
// Linha 36
const MOCK_USER_ADDRESS = "0x0000000000000000000000000000000000000001";
```
**Problema:** Endereço hardcoded que deve ser obtido via Wallet Connect
**Solução:** Obter do contexto de wallet conectado

#### 1.2. Planos de Staking Hardcoded
```typescript
// Linhas 15-20
export const STAKING_PLANS = [
  { duration: 20, apy: 12.5 },
  { duration: 30, apy: 15.0 },
  { duration: 60, apy: 20.0 },
  { duration: 90, apy: 25.0 },
];
```
**Problema:** Valores hardcoded que devem vir do Smart Contract
**Status:** Já está sendo obtido via `getStakingPlans()` do web3-api, mas ainda exportado como constante

#### 1.3. Planos de Mineração Hardcoded
```typescript
// Linhas 23-27
export const MINING_PLANS = [
  { name: 'Basic', cost: 1000, power: 0.5, duration: 30 },
  { name: 'Advanced', cost: 5000, power: 3.0, duration: 60 },
  { name: 'Professional', cost: 10000, power: 7.5, duration: 90 },
];
```
**Problema:** Valores hardcoded que devem vir do Smart Contract ou banco de dados
**Solução:** Criar tabela no banco ou obter do Smart Contract

#### 1.4. Penalidade de Unstake Hardcoded
```typescript
// Linha 21
const EARLY_UNSTAKE_PENALTY_PERCENTAGE = 10;
```
**Problema:** Valor hardcoded que deve vir do Smart Contract
**Solução:** Obter do Smart Contract

#### 1.5. Plan ID Mockado
```typescript
// Linha 77
const planId = 0; // MOCK
```
**Problema:** Sempre usa planId 0, deve mapear corretamente
**Solução:** Criar função para mapear duration/apy para planId do Smart Contract

#### 1.6. Hash Mockado
```typescript
// Linha 91
return { hash: "0xmockhash" };
```
**Problema:** Hash de transação fake
**Solução:** Implementar chamada real ao Smart Contract

#### 1.7. Decimais Hardcoded
```typescript
// Linhas 68, 75
const amountBigInt = BigInt(amount * 10**18); // Assumindo 18 decimais
```
**Problema:** Assume sempre 18 decimais
**Solução:** Obter decimais do token do Smart Contract

#### 1.8. Funções Faltantes (Mencionadas mas não implementadas) ⚠️ **ARQUIVO INCOMPLETO**

**🚨 PROBLEMA CRÍTICO:** O arquivo `mock-api.ts` está incompleto. As seguintes funções são importadas e usadas nos componentes, mas **NÃO ESTÃO DEFINIDAS** no arquivo:

**Funções de Jogos:**
- `placeRocketBet` - **FALTANDO** - Usado em `lipt-rocket.tsx` linha 12
- `cashOutRocket` - **FALTANDO** - Usado em `lipt-rocket.tsx` linha 12
- `spinWheel` - **FALTANDO** - Usado em `wheel-of-fortune.tsx` linha 11

**Funções de Mineração:**
- `getMiningData` - **FALTANDO** - Usado em `mining-pool.tsx` linha 15
- `activateMiner` - **FALTANDO** - Usado em `mining-pool.tsx` linha 15
- `claimMinedRewards` - **FALTANDO** - Usado em `mining-pool.tsx` linha 15

**Funções de Liquidez:**
- `getLiquidityData` - **FALTANDO** - Usado em `liquidity-pool.tsx` linha 15
- `addLiquidity` - **FALTANDO** - Usado em `liquidity-pool.tsx` linha 15
- `removeLiquidity` - **FALTANDO** - Usado em `liquidity-pool.tsx` linha 15

**Funções de Loteria:**
- `getLotteryData` - **FALTANDO** - Usado em `daily-lottery.tsx` linha 13
- `buyLotteryTickets` - **FALTANDO** - Usado em `daily-lottery.tsx` linha 13
- `claimLotteryPrize` - **FALTANDO** - Usado em `daily-lottery.tsx` linha 13

**Funções Mencionadas em Comentários:**
- `getReferralData` - **FALTANDO** - Mencionado na linha 62
- `getLeaderboardData` - **FALTANDO** - Mencionado na linha 62

**Funções Utilitárias Não Definidas:**
- `wait` - **FALTANDO** - Usado nas linhas 50, 90
- `getFromStorage` - **FALTANDO** - Usado nas linhas 51, 58
- `saveToStorage` - **FALTANDO** - Mencionado na linha 30
- `initialStats` - **FALTANDO** - Usado na linha 51
- `initialStaking` - **FALTANDO** - Usado na linha 58

**Interfaces/Tipos Não Definidos:**
- `Stake` - **FALTANDO** - Mencionado na linha 29, usado em `staking-pool.tsx`
- `Miner` - **FALTANDO** - Mencionado na linha 29, usado em `mining-pool.tsx`
- `LotteryDraw` - **FALTANDO** - Mencionado na linha 29
- `LotteryState` - **FALTANDO** - Mencionado na linha 29, usado em `daily-lottery.tsx`

**⚠️ IMPACTO:** O código atual **NÃO COMPILA** ou **FALHA EM RUNTIME** porque essas funções são importadas mas não existem. Isso é um problema crítico que impede o funcionamento da aplicação.

---

## 🎨 DADOS HARDCODED NOS COMPONENTES

### 2. **LIPT-ROCKET.TSX** (`src/components/dashboard/lipt-rocket.tsx`)

#### 2.1. Cores das Estrelas Hardcoded
```typescript
// Linha 31
const colors = [0xfef08a, 0xfcd34d, 0xfbb41c, 0xa9d3f5, 0xffffff];
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 2.2. Configuração de Estrelas Hardcoded
```typescript
// Linhas 34-35
const layerCount = layer === 0 ? 40 : layer === 1 ? 60 : 80;
const baseSpeed = layer === 0 ? 0.8 : layer === 1 ? 3 : 8;
```
**Status:** OK - Configuração visual pode ser hardcoded

#### 2.3. Cores do Foguete Hardcoded
```typescript
// Linhas 73-78
const body = new PIXI.Graphics().roundRect(-12, -30, 24, 45, 5).fill(0xe2e8f0);
const tip = new PIXI.Graphics()...fill(0xef4444);
const leftWing = new PIXI.Graphics()...fill(0xdc2626);
const rightWing = new PIXI.Graphics()...fill(0xdc2626);
const windowFrame = new PIXI.Graphics().circle(0, -15, 8).fill(0x94a3b8);
const windowGlass = new PIXI.Graphics().circle(0, -15, 6).fill(0x38bdf8);
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 2.4. Cores da Chama Hardcoded
```typescript
// Linhas 81-82
const flame = new PIXI.Graphics().ellipse(0, 30, 10, 20).fill({ color: 0xf97316, alpha: 0.8 });
const flameCore = new PIXI.Graphics().ellipse(0, 28, 5, 15).fill({ color: 0xfef08a, alpha: 1 });
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 2.5. Valores de Crash Point Hardcoded
```typescript
// Linhas 100, 102
return Math.max(1.01, Math.floor(100 / (1 - r)) / 100);
return Math.max(1.01, 1 + Math.random() * 10);
```
**Problema:** Lógica de crash point deve vir do Smart Contract para ser verificável
**Solução:** Obter seed/hash do Smart Contract

#### 2.6. Cores de Explosão Hardcoded
```typescript
// Linhas 114, 120, 130
.fill({ color: 0xffffff, alpha: 0.7 });
.stroke({ color: 0xffffff, width: 10, alpha: 0.8 });
.fill(Math.random() > 0.3 ? 0xf97316 : 0xfef08a);
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 2.7. Valores de Animação Hardcoded
```typescript
// Linhas 124, 128, 134, 146, 152, 161, 170
let shakeAmount = 12;
for (let i = 0; i < 40; i++) {
const speed = Math.random() * 10 + 3;
flash.alpha -= 0.05 * dt;
shockwave.scale.set(shockwave.scale.x + 0.3 * dt);
p.vy += 0.1 * dt; // Gravidade leve
shakeAmount -= 0.8 * dt;
```
**Status:** OK - Valores de animação podem ser hardcoded

#### 2.8. Cores do Gradiente Hardcoded
```typescript
// Linhas 248-250
gradient.addColorStop(0, '#0c0c1d'); // Topo (espaço profundo)
gradient.addColorStop(0.7, '#0f172a'); // Meio (cor original)
gradient.addColorStop(1, '#1e293b'); // Base (mais clara, perto da UI)
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 2.9. Valores de Multiplicador Hardcoded
```typescript
// Linhas 284, 318, 323, 324
multiplierRef.current = 1.01;
multiplierRef.current += 0.001 + 0.0008 * currentMultiplier;
const maxRocketY = app.screen.height * 0.2;
const verticalProgress = Math.min(1, (currentMultiplier - 1) / 3);
```
**Problema:** Lógica de multiplicador deve ser validada pelo Smart Contract
**Solução:** Validar com o Smart Contract

#### 2.10. Valores de Fumaça Hardcoded
```typescript
// Linhas 346, 348, 353-357, 365-366
const emitRate = currentMultiplier > 1.1 ? Math.min(3, Math.floor((currentMultiplier - 1) * 6)) : 0;
if (smoke.length > 60) {
p.circle(0, 0, Math.random() * 3 + 2).fill({ color: 0xdddddd, alpha: 0.8 });
p.x = rocket.x + (Math.random() - 0.5) * 18;
p.y = rocket.y + 30;
p.vx = (Math.random() - 0.5) * 2;
p.vy = 1.5 + Math.random();
p.vy += 0.06;
p.alpha -= 0.02;
```
**Status:** OK - Valores de animação podem ser hardcoded

#### 2.11. Delay de Início Hardcoded
```typescript
// Linha 395
const timer = setTimeout(startGame, 3000);
```
**Status:** OK - Delay pode ser configurável, mas não crítico

#### 2.12. Mensagem de Erro Hardcoded
```typescript
// Linha 404
toast({ variant: 'destructive', title: 'Aposta inválida' });
```
**Problema:** Texto hardcoded em português
**Solução:** Usar tradução `t('gameZone.rocket.toast.invalidBet.title')`

#### 2.13. Mensagens Hardcoded
```typescript
// Linhas 499, 505
{isLoadingAction ? "Placing Bet..." : t('gameZone.rocket.placeBet')}
{isLoadingAction ? 'Cashing out...' : ...}
```
**Problema:** "Placing Bet..." e "Cashing out..." hardcoded em inglês
**Solução:** Usar tradução

---

### 3. **WHEEL-OF-FORTUNE.TSX** (`src/components/dashboard/wheel-of-fortune.tsx`)

#### 3.1. Segmentos da Roda Hardcoded
```typescript
// Linhas 16-25
const segments = [
    { value: 1.5, label: '1.5x', color: '#6366f1', weight: 8 },
    { value: 0,   label: '0x',   color: '#ef4444', weight: 25 },
    { value: 1,   label: '1x',   color: '#22c55e', weight: 10 },
    { value: 3,   label: '3x',   color: '#8b5cf6', weight: 2 },
    { value: 0.5, label: '0.5x', color: '#f97316', weight: 20 },
    { value: 2,   label: '2x',   color: '#3b82f6', weight: 5 },
    { value: 0,   label: '0x',   color: '#ef4444', weight: 20 },
    { value: 1,   label: '1x',   color: '#16a34a', weight: 10 },
];
```
**Problema:** Segmentos, valores e pesos hardcoded que devem vir do Smart Contract
**Solução:** Obter do Smart Contract ou banco de dados

#### 3.2. Duração da Animação Hardcoded
```typescript
// Linha 58
? { transition: 'transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)' }
```
**Status:** OK - Duração de animação pode ser hardcoded

#### 3.3. Tamanhos da Roda Hardcoded
```typescript
// Linha 62
<div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto my-8 flex items-center justify-center">
```
**Status:** OK - Tamanhos visuais podem ser hardcoded

#### 3.4. Cores e Estilos Hardcoded
```typescript
// Linhas 64, 70, 79, 115-116
border-cyan-400/50
bg-cyan-200/50
border-t-yellow-400
bg-gray-800 border-4 border-yellow-400
bg-blue-500
```
**Status:** OK - Cores visuais podem ser hardcoded

#### 3.5. Número de Marcadores Hardcoded
```typescript
// Linha 67
{Array.from({ length: 60 }).map((_, i) => (
```
**Status:** OK - Número de marcadores pode ser hardcoded

#### 3.6. Valores de Rotação Hardcoded
```typescript
// Linhas 174-175
const randomSpins = Math.floor(Math.random() * 4) + 8;
const finalRotation = (randomSpins * 360) - targetAngle;
```
**Status:** OK - Valores de animação podem ser hardcoded

#### 3.7. Delay Hardcoded
```typescript
// Linha 208
}, 8000);
```
**Status:** OK - Delay de animação pode ser hardcoded

#### 3.8. Mensagem de Erro Hardcoded
```typescript
// Linha 210
toast({ variant: 'destructive', title: "Spin failed", description: e.message });
```
**Problema:** "Spin failed" hardcoded em inglês
**Solução:** Usar tradução

---

### 4. **CONFIG/CONTRACTS.TS** (`src/config/contracts.ts`)

#### 4.1. Endereços de Contratos Hardcoded
```typescript
// Linhas 30-40
mainnet: {
  liptToken: '0x3113026cDdfE9145905003f5065A2BF815B82F91',
  mockUsdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  protocolController: '0x6B99297aCc06a5b19387844864D0FbA79C3066a9',
  // ... outros endereços
}
```
**Status:** OK - Endereços de contratos devem ser hardcoded, mas devem vir de variáveis de ambiente

#### 4.2. Endereços de Teste Vazios
```typescript
// Linhas 44-54
amoy: {
  liptToken: '0x...', // Preencher após implantação na Amoy
  // ... outros endereços vazios
}
```
**Problema:** Endereços de teste não preenchidos
**Solução:** Preencher após deploy ou usar variáveis de ambiente

---

### 5. **WEB3-API.TS** (`src/services/web3-api.ts`)

#### 5.1. RPC Endpoint Hardcoded
```typescript
// Linha 18
transport: http('https://polygon-rpc.com'),
```
**Problema:** RPC endpoint hardcoded
**Solução:** Usar variável de ambiente `NEXT_PUBLIC_RPC_URL`

#### 5.2. Chain Hardcoded
```typescript
// Linha 2, 17, 24
import { polygon } from 'viem/chains';
chain: polygon,
```
**Status:** OK - Chain pode ser hardcoded, mas idealmente vir de variável de ambiente

---

## 📊 RESUMO POR PRIORIDADE

### 🔴 **CRÍTICO - DEVE SER CORRIGIDO IMEDIATAMENTE**
1. `MOCK_USER_ADDRESS` - Endereço mockado
2. Funções faltantes no `mock-api.ts` (placeRocketBet, cashOutRocket, spinWheel, etc.)
3. `planId = 0` - Sempre usa planId 0
4. `hash: "0xmockhash"` - Hash fake
5. Segmentos da roda hardcoded (wheel-of-fortune.tsx)
6. Lógica de crash point deve validar com Smart Contract
7. Mensagens hardcoded em inglês/português

### 🟡 **IMPORTANTE - DEVE SER CORRIGIDO EM BREVE**
1. `STAKING_PLANS` - Ainda exportado como constante (já obtém do SC)
2. `MINING_PLANS` - Deve vir do Smart Contract ou banco
3. `EARLY_UNSTAKE_PENALTY_PERCENTAGE` - Deve vir do Smart Contract
4. Decimais hardcoded (assume sempre 18)
5. RPC endpoint hardcoded
6. Endereços de teste não preenchidos

### 🟢 **BAIXA PRIORIDADE - PODE FICAR HARDCODED**
1. Cores visuais (estrelas, foguete, roda)
2. Valores de animação
3. Tamanhos de UI
4. Delays de animação
5. Endereços de contratos (mas devem vir de env vars)

---

## ✅ RECOMENDAÇÕES

1. **Criar tabelas no banco de dados** para:
   - Planos de staking (se não vier do SC)
   - Planos de mineração
   - Configurações de jogos (segmentos da roda, etc.)

2. **Implementar todas as funções faltantes** no `mock-api.ts`:
   - Integrar com Smart Contracts
   - Ou criar endpoints de API real

3. **Substituir MOCK_USER_ADDRESS** por:
   - Contexto de wallet conectado
   - Hook personalizado para obter endereço

4. **Mover valores hardcoded para variáveis de ambiente**:
   - RPC endpoints
   - Endereços de contratos (já parcialmente feito)

5. **Criar sistema de tradução completo**:
   - Substituir todas as strings hardcoded
   - Usar chaves de tradução consistentes

6. **Validar lógica de jogos com Smart Contracts**:
   - Crash point deve ser verificável
   - Multiplicadores devem ser validados
   - Resultados devem ser on-chain

---

**Data da Inspeção:** 2024
**Arquivos Analisados:** 
- `src/services/mock-api.ts`
- `src/services/web3-api.ts`
- `src/components/dashboard/lipt-rocket.tsx`
- `src/components/dashboard/wheel-of-fortune.tsx`
- `src/config/contracts.ts`

