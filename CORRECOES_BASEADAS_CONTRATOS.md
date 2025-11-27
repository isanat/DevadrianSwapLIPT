# Correções Baseadas na Análise dos Smart Contracts

## Problema Principal

O código estava recriando lógica ao invés de seguir exatamente o que os smart contracts fazem. Após ler os contratos, identifiquei os problemas e soluções corretas.

---

## 1. StakingPool e MiningPool - Planos devem ser criados pelo Admin

### Como Funciona:
- **Admin cria planos** via `addStakingPlan(duration, apy)` ou `addMiningPlan(cost, power, duration)`
- Os planos são armazenados em um **array público** no contrato
- **Usuários fazem stake/activate** passando o `planId` que é o **índice do array** (0, 1, 2, etc.)

### Problema:
- O código estava usando fallback `STAKING_PLANS` quando o contrato não tinha planos
- Isso fazia com que o `planIndex` não correspondesse ao índice real do contrato
- **"Staking: Invalid plan"** erro porque o planId não existia no contrato

### Solução Implementada:
- ✅ Removido fallback de planos - se não há planos no contrato, mostrar mensagem
- ✅ Usar apenas planos retornados por `getStakingPlans()` / `getMiningPlans()` do contrato
- ✅ O `planId` é o índice exato do array retornado

### Próximo Passo Necessário:
- ⚠️ **Admin precisa criar os planos via interface admin usando `addStakingPlan` e `addMiningPlan`**
- ⚠️ A interface admin atual (`/admin/staking` e `/admin/mining`) está apenas manipulando estado local
- ⚠️ Precisamos integrar essas páginas para chamar as funções do contrato

---

## 2. WheelOfFortune - Segmentos devem ser configurados pelo Admin

### Como Funciona:
- **Admin configura segmentos** via `setWheelSegments(multipliers[], weights[])`
- Os segmentos são armazenados em um **array público** no contrato
- Se não for configurado, o array está vazio

### Problema:
- Os segmentos não estão sendo configurados, então o array está vazio
- **"No wheel segments found in contract"** warnings

### Solução Implementada:
- ✅ Reduzido spam de warnings (log apenas uma vez)
- ✅ Mensagem clara indicando que o admin precisa configurar

### Próximo Passo Necessário:
- ⚠️ **Admin precisa chamar `setWheelSegments()` via interface admin**
- ⚠️ Criar interface admin para configurar os segmentos da roda

---

## 3. RocketGame - betIndex simplificado

### Como Funciona:
- `playRocket(betAmount)` adiciona bet ao array `currentRound.bets[]` com `push()`
- O betIndex é simplesmente `bets.length - 1` após o push
- `cashOutRocket(betIndex, multiplier)` usa esse índice direto

### Problema:
- O código estava tentando contar eventos de forma complicada
- Race conditions e lógica complexa

### Solução Implementada:
- ✅ Simplificado: contar eventos `RocketBetPlaced` desta rodada
- ✅ O número total de eventos = betIndex (0-indexed, então último = total - 1)
- ✅ Mais simples e direto

---

## 4. Lottery - prizePool cálculo correto

### Como Funciona:
- `currentDraw.totalTickets` e `currentDraw.ticketPrice` estão no contrato
- Prize pool = `totalTickets * ticketPrice`

### Problema:
- O cálculo estava correto, mas pode retornar NaN se valores não estiverem disponíveis

### Solução:
- Já estava implementado corretamente

---

## Resumo das Correções Feitas

1. ✅ **Rocket betIndex**: Simplificado cálculo baseado em contagem de eventos
2. ✅ **Staking/Mining**: Removido fallback de planos, usar apenas do contrato
3. ✅ **Wheel segments**: Reduzido warnings, mensagem clara
4. ✅ **CashOut winnings**: Lança erro quando evento não encontrado

## Próximos Passos Necessários

1. ⚠️ **Integrar interface admin** para criar planos via contratos:
   - `/admin/staking` → chamar `addStakingPlan(duration, apy)`
   - `/admin/mining` → chamar `addMiningPlan(cost, power, duration)`
   - Criar interface para `setWheelSegments(multipliers[], weights[])`

2. ⚠️ **Admin precisa criar planos no contrato** antes dos usuários poderem usar

3. ⚠️ **Mostrar mensagens claras** quando não há planos/segmentos configurados

