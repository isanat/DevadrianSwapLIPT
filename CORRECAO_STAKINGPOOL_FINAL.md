# Correção do StakingPool - Resumo Final

## Problemas Identificados e Corrigidos

### 1. **Problema: PlanIndex não encontrado quando planos vêm do fallback**

**Descrição:** Quando o contrato não retornava planos (array vazio), o código usava `STAKING_PLANS` como fallback no `getStakingData`, mas quando o `stakeLipt` chamava `getStakingPlans()` diretamente, ele não usava o fallback, resultando em `planIndex = -1` e erro.

**Correção aplicada em `src/services/mock-api.ts`:**
- Adicionado fallback para `STAKING_PLANS` quando `getStakingPlans()` retorna array vazio
- Implementada comparação tolerante para floating point (usando `Math.abs()` para duration e apy)
- Melhorada a mensagem de erro quando o plano não é encontrado

```typescript
// Antes:
const plans = await getStakingPlans();
const planIndex = plans.findIndex(p => p.duration === plan.duration && p.apy === plan.apy);

// Depois:
let plans = await getStakingPlans();
if (!plans || plans.length === 0) {
    plans = STAKING_PLANS;
}
const planIndex = plans.findIndex(p => 
    Math.abs(p.duration - plan.duration) < 0.01 && 
    Math.abs(p.apy - plan.apy) < 0.01
);
```

### 2. **Problema: Falta de aguardo após transação**

**Descrição:** Após fazer o stake, o código não aguardava tempo suficiente para que o contrato atualizasse antes de buscar novos dados.

**Correção aplicada:**
- Adicionado aguardo de 2 segundos após a transação de stake em `mock-api.ts`
- Reduzido o aguardo no componente de 2s para 1s (já que a função já aguarda)

### 3. **Problema: Cálculo incorreto de amountBigInt**

**Descrição:** O cálculo de `amountBigInt` poderia resultar em valores decimais antes da conversão para `BigInt`, causando erros.

**Correção aplicada:**
- Adicionado `Math.floor()` antes de converter para `BigInt`:
```typescript
const amountBigInt = BigInt(Math.floor(amount * (10 ** liptDecimals)));
```

### 4. **Problema: Atualização de cache após stake**

**Descrição:** As mutações do cache eram feitas sequencialmente, não em paralelo, causando atrasos desnecessários.

**Correção aplicada em `src/components/dashboard/staking-pool.tsx`:**
- Mudado para usar `Promise.all()` para atualizar os caches em paralelo:
```typescript
await Promise.all([
  mutate(['staking', userAddress]),
  mutate(['wallet', userAddress])
]);
```

## Arquivos Modificados

1. **`src/services/mock-api.ts`**
   - Correção da função `stakeLipt` para usar fallback de planos
   - Melhoria na busca de `planIndex` com comparação tolerante
   - Adição de aguardo após transação
   - Correção do cálculo de `amountBigInt`

2. **`src/components/dashboard/staking-pool.tsx`**
   - Melhoria na atualização do cache após stake
   - Otimização do tempo de aguardo

## Resultado Esperado

Após essas correções:
1. ✅ Os planos de staking são exibidos corretamente (seja do contrato ou do fallback)
2. ✅ O `planIndex` é encontrado corretamente ao fazer stake
3. ✅ As transações aguardam confirmação antes de buscar novos dados
4. ✅ O cache é atualizado corretamente após o stake
5. ✅ Os dados exibidos na UI refletem as mudanças do contrato

## Observações

- O componente já tinha tratamento para exibir mensagem quando não há planos disponíveis
- O componente já tinha fallback para `STAKING_PLANS` no `getStakingData`
- O problema principal estava na função `stakeLipt` que não usava o mesmo fallback ao buscar o `planIndex`

