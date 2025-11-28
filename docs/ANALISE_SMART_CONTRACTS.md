# Análise dos Smart Contracts e Correções Necessárias

## 1. StakingPool

### Estrutura do Contrato:
- **Plans Array**: `StakingPlan[] public plans`
  - `duration`: segundos
  - `apy`: basis points (ex: 1250 = 12.5%)
  - `active`: bool

### Funções Admin:
- `addStakingPlan(uint256 _duration, uint256 _apy)` - Adiciona novo plano
- `modifyStakingPlan(uint256 planId, uint256 _duration, uint256 _apy, bool _active)` - Modifica plano existente

### Funções Usuário:
- `stake(uint256 amount, uint256 planId)` - planId é o **índice do array plans**
- `getStakingPlans()` - Retorna array completo de planos

### Problema Identificado:
O código está usando fallback STAKING_PLANS quando o contrato não retorna planos, mas isso faz com que o planIndex não corresponda ao índice real do contrato.

### Solução:
- **NUNCA** usar fallback de planos - se o contrato não tem planos, o admin precisa criar
- Usar apenas planos retornados por `getStakingPlans()` do contrato
- O planId deve ser o índice exato do array retornado

---

## 2. MiningPool

### Estrutura do Contrato:
- **Plans Array**: `MiningPlan[] public plans`
  - `cost`: custo em LIPT (wei)
  - `power`: geração de LIPT por segundo (wei por segundo)
  - `duration`: segundos
  - `active`: bool

### Funções Admin:
- `addMiningPlan(uint256 _cost, uint256 _power, uint256 _duration)` - Adiciona novo plano
- `modifyMiningPlan(uint256 planId, uint256 _cost, uint256 _power, uint256 _duration, bool _active)` - Modifica plano existente

### Funções Usuário:
- `activateMiner(uint256 planId)` - planId é o **índice do array plans**
- `getMiningPlans()` - Retorna array completo de planos

### Problema Identificado:
Mesmo problema do Staking - usar apenas planos do contrato, nunca fallback.

---

## 3. WheelOfFortune

### Estrutura do Contrato:
- **Segments Array**: `Segment[] public segments`
  - `multiplier`: multiplicador (ex: 200 = 2x)
  - `weight`: peso para probabilidade

### Funções Admin:
- `setWheelSegments(uint256[] memory multipliers, uint256[] memory weights)` - Configura os segmentos
  - **IMPORTANTE**: Esta função deve ser chamada pelo admin para configurar os segmentos
  - Se não for chamada, o array `segments` estará vazio

### Funções Usuário:
- `spinWheel(uint256 betAmount)` - Gira a roda

### Problema Identificado:
Os segmentos não estão sendo configurados pelo admin, então o array está vazio.
O código está tentando ler `segments[index]` mas o array está vazio.

### Solução:
- O admin precisa chamar `setWheelSegments()` via interface admin
- O frontend deve mostrar mensagem clara quando não há segmentos configurados

---

## 4. RocketGame

### Estrutura do Contrato:
- **Round**: `currentRound`
  - `crashPoint`: basis points (ex: 200 = 2.00x)
  - `startTime`: timestamp
  - `bets`: `Bet[]` - array de apostas
  - `active`: bool

### Funções Admin:
- `startNewRound(uint256 simulatedCrashPoint)` - Inicia nova rodada (apenas owner)
- `crashRound()` - Finaliza rodada atual (apenas owner)

### Funções Usuário:
- `playRocket(uint256 betAmount)` - Adiciona aposta ao array `currentRound.bets[]`
  - Emite evento `RocketBetPlaced`
  - O bet é adicionado com `bets.push()`, então o índice é `bets.length - 1`
- `cashOutRocket(uint256 betIndex, uint256 multiplier)` - betIndex é o **índice no array bets**

### Problema Identificado:
O código está tentando contar eventos para obter betIndex, mas isso é complicado e pode ter race conditions.

### Solução Correta:
O contrato não expõe `currentRound.bets.length` como view function, então temos que contar eventos `RocketBetPlaced` da rodada atual.

**Forma mais simples**: Após a transação confirmar, contar todos os eventos `RocketBetPlaced` onde `block.timestamp >= roundStartTime`. O número total de eventos será o betIndex (0-indexed, então último evento = total - 1).

---

## 5. Lottery

### Estrutura do Contrato:
- `currentDraw`: Draw struct
  - `drawId`: uint256
  - `ticketPrice`: uint256 (em wei)
  - `totalTickets`: uint256
  - `winner`: address
  - `drawn`: bool
- `ticketPrice`: uint256 - preço por ticket
- `ticketsBought[address]`: mapping - quantos tickets cada usuário comprou

### Funções Admin:
- `setLotteryTicketPrice(uint256 price)` - Define preço do ticket
- `forceDrawWinner(uint256 simulatedRandomness)` - Força sorteio (apenas owner)

### Funções Usuário:
- `buyTickets(uint256 ticketQuantity)` - Compra tickets
- `claimLotteryPrize(uint256 drawId)` - Reclama prêmio

### Problema Identificado:
O `prizePool` é calculado como `totalTickets * ticketPrice`, mas isso não está exposto diretamente no contrato.

---

## Resumo das Correções Necessárias

1. **Staking/Mining Plans**: Remover fallbacks, usar apenas planos do contrato
2. **Wheel Segments**: Admin precisa configurar via `setWheelSegments()`
3. **Rocket betIndex**: Simplificar contagem de eventos
4. **Lottery prizePool**: Calcular como `totalTickets * ticketPrice` do contrato

