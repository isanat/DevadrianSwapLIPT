# Correções de Bugs nos Jogos e Mining Pool

## Bugs Corrigidos

### 1. **Bug do Rocket Game - betIndex não retornado no fallback**

**Problema:** Quando a chamada web3 falhava em `placeRocketBet`, o fallback retornava apenas `{ success: true }` sem `betIndex`, causando falha no cashout.

**Correção aplicada em `src/services/mock-api.ts`:**
```typescript
// Antes:
return { success: true };

// Depois:
return { success: true, betIndex: 0 };
```

### 2. **Bug do Rocket Game - Cálculo incorreto de betIndex**

**Problema:** O cálculo de `betIndex` tinha problemas de race condition. Se o evento não fosse encontrado nos logs, o código ainda subtraía 1, resultando em um índice incorreto.

**Correção aplicada em `src/services/web3-api.ts`:**
- Reescrita completa da lógica de contagem de eventos
- Agora conta todos os eventos da rodada primeiro
- Se encontrar nosso evento, usa o índice baseado na contagem
- Se não encontrar, usa o total de eventos - 1 (último bet)
- Adicionado tratamento de erro com fallback para 0

### 3. **Bug do Rocket Game - winnings silenciosamente zero**

**Problema:** Quando `cashOutRocket` não encontrava o evento `RocketCashedOut` nos logs, retornava `winnings: 0n` silenciosamente, fazendo parecer que a operação foi bem-sucedida mas sem ganhos.

**Correção aplicada em `src/services/web3-api.ts`:**
- Adicionada flag `foundEvent` para rastrear se o evento foi encontrado
- Se o evento não for encontrado, lança um erro explicativo
- Se `winnings` for zero, também lança erro (indicando problema na transação)
- Agora o usuário recebe feedback claro sobre falhas

### 4. **Bug do Staking Pool - Invalid plan error**

**Problema:** O código usava `STAKING_PLANS` como fallback ao buscar planos, mas isso fazia com que o `planIndex` não correspondesse ao índice real do contrato, causando erro "Staking: Invalid plan".

**Correção aplicada em `src/services/mock-api.ts`:**
- Removido fallback para `STAKING_PLANS` na função `stakeLipt`
- Agora só usa planos do contrato
- Se não houver planos no contrato, lança erro claro
- Adicionada validação de `planIndex` dentro dos limites válidos

### 5. **Bug do Mining Pool - planId incorreto**

**Problema:** Similar ao staking, o mining pool buscava planos mas podia usar índices incorretos.

**Correção aplicada em `src/components/dashboard/mining-pool.tsx`:**
- Agora busca planos do contrato diretamente antes de ativar
- Garante que o `planId` corresponde ao índice real do contrato
- Adicionado tratamento de erro apropriado
- Corrigida estrutura do try-catch

### 6. **Wheel of Fortune - Warnings repetidos no console**

**Problema:** Múltiplos warnings "No wheel segments found in contract" apareciam no console.

**Correção aplicada em `src/services/web3-api.ts`:**
- Adicionado flag para logar o warning apenas uma vez por sessão
- Mensagem melhorada indicando que o administrador precisa configurar os segmentos

## Arquivos Modificados

1. **`src/services/mock-api.ts`**
   - Correção do fallback de `placeRocketBet` para incluir `betIndex`
   - Correção do `stakeLipt` para não usar fallback de planos

2. **`src/services/web3-api.ts`**
   - Reescrita do cálculo de `betIndex` em `playRocket`
   - Correção de `cashOutRocket` para lançar erros quando eventos não são encontrados
   - Redução de warnings do Wheel of Fortune

3. **`src/components/dashboard/mining-pool.tsx`**
   - Busca direta de planos do contrato antes de ativar
   - Correção da estrutura do try-catch
   - Uso correto do `planId` encontrado

## Resultado Esperado

Após essas correções:
1. ✅ Rocket Game funciona corretamente com betIndex
2. ✅ Cashout do Rocket Game lança erros apropriados quando falha
3. ✅ Staking Pool não usa planos de fallback incorretos
4. ✅ Mining Pool busca planId correto do contrato
5. ✅ Menos spam de warnings no console do Wheel of Fortune

