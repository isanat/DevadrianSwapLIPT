# 🔄 Integração com PancakeSwap - Análise e Requisitos

**Data:** Dezembro 2025  
**Status Atual:** ❌ Sistema NÃO está preparado para PancakeSwap

---

## 📊 Situação Atual do Sistema

### ✅ O que o sistema TEM:

1. **Pool AMM Próprio (`DevAdrianSwapPool`)**
   - Contrato customizado que implementa AMM simples (x*y=k)
   - Pool isolado LIPT/USDT
   - Taxa de swap configurável (atualmente 0.3%)
   - Funções: `swap()`, `addLiquidity()`, `removeLiquidity()`

2. **Integração Direta com o Pool**
   - `purchaseLipt()` - Compra LIPT usando USDT no pool próprio
   - `addLiquidity()` - Adiciona liquidez ao pool próprio
   - `removeLiquidity()` - Remove liquidez do pool próprio

### ❌ O que o sistema NÃO TEM:

1. **Integração com DEXs Externos**
   - Não usa router da PancakeSwap
   - Não usa router da Uniswap V2
   - Não tem capacidade de buscar melhor preço em múltiplos pools
   - Não pode usar liquidez de outros DEXs

2. **Suporte a Múltiplas Fontes de Liquidez**
   - Não compara preços entre pools
   - Não permite escolher entre pool próprio e PancakeSwap
   - Não tem fallback para DEXs externos

---

## 🎯 O que seria necessário para integrar PancakeSwap

### Opção 1: Integração Híbrida (Recomendada)

Permitir que usuários escolham entre:
- **Pool Próprio** (DevAdrianSwapPool) - Taxa 0.3%
- **PancakeSwap** - Taxa padrão (~0.25%)

#### Requisitos Técnicos:

1. **Adicionar Router da PancakeSwap**
   ```typescript
   // Endereço do Router V2 na Polygon (verificar oficialmente)
   const PANCAKESWAP_ROUTER_V2 = '0x...'; // Precisa verificar endereço oficial
   ```

2. **Criar Função de Swap via PancakeSwap**
   ```typescript
   export async function purchaseLiptViaPancakeSwap(
     userAddress: Address,
     usdtAmount: bigint
   ) {
     // 1. Aprovar USDT para o router
     // 2. Chamar swapExactTokensForTokens do router
     // 3. Retornar hash da transação
   }
   ```

3. **Comparar Preços**
   ```typescript
   export async function getBestPrice(
     usdtAmount: bigint
   ): Promise<{ source: 'own' | 'pancakeswap', price: bigint }> {
     // Comparar preço no pool próprio vs PancakeSwap
     // Retornar melhor opção
   }
   ```

4. **Atualizar UI**
   - Adicionar toggle para escolher fonte de liquidez
   - Mostrar comparação de preços
   - Mostrar taxas de cada opção

### Opção 2: Substituir Pool Próprio por PancakeSwap

**⚠️ NÃO RECOMENDADO** - Perde controle sobre taxas e liquidez

#### Requisitos:

1. **Migrar Liquidez**
   - Remover toda liquidez do pool próprio
   - Adicionar liquidez na PancakeSwap
   - Atualizar todos os contratos para usar PancakeSwap

2. **Atualizar Contratos**
   - Modificar `purchaseLipt()` para usar router
   - Remover `DevAdrianSwapPool` (ou mantê-lo apenas para histórico)

---

## 📋 Endereços da PancakeSwap na Polygon

**⚠️ IMPORTANTE:** Verificar endereços oficiais antes de implementar!

### Router V2 (Uniswap V2 Compatible)
```
Endereço: (verificar em https://docs.pancakeswap.finance/)
```

### Factory
```
Endereço: (verificar oficialmente)
```

### WETH (Wrapped Native Token)
```
Na Polygon: WMATIC ou WPOL (depende da migração)
```

---

## 🔧 Implementação Técnica Detalhada

### 1. Adicionar ABI do Router da PancakeSwap

```typescript
// src/lib/abi/PancakeSwapRouter.json
// Baixar ABI oficial do router V2
```

### 2. Criar Função de Swap

```typescript
// src/services/web3-api.ts

const PANCAKESWAP_ROUTER = '0x...' as Address; // Verificar endereço oficial

export async function swapViaPancakeSwap(
  userAddress: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  amountOutMin: bigint, // Slippage protection
  deadline: bigint
) {
  const { publicClient, walletClient } = getClients();
  if (!walletClient) throw new Error('Wallet not connected');

  // ABI do router (Uniswap V2 compatible)
  const routerABI = [
    {
      name: 'swapExactTokensForTokens',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMin', type: 'uint256' },
        { name: 'path', type: 'address[]' },
        { name: 'to', type: 'address' },
        { name: 'deadline', type: 'uint256' }
      ],
      outputs: [{ name: 'amounts', type: 'uint256[]' }]
    }
  ];

  const routerContract = getContract({
    address: PANCAKESWAP_ROUTER,
    abi: routerABI,
    client: { public: publicClient, wallet: walletClient },
  });

  // Path: USDT -> LIPT (ou vice-versa)
  const path = [tokenIn, tokenOut];
  
  // 1. Aprovar token de entrada
  const tokenInContract = getContract({
    address: tokenIn,
    abi: CONTRACT_ABIS.mockUsdt, // ou liptToken
    client: { public: publicClient, wallet: walletClient },
  });

  const { request: approveRequest } = await tokenInContract.simulate.approve(
    [PANCAKESWAP_ROUTER, amountIn],
    { account: userAddress }
  );
  await walletClient.writeContract(approveRequest);

  // 2. Executar swap
  const { request: swapRequest } = await routerContract.simulate.swapExactTokensForTokens(
    [amountIn, amountOutMin, path, userAddress, deadline],
    { account: userAddress }
  );
  
  const hash = await walletClient.writeContract(swapRequest);
  return hash;
}
```

### 3. Função para Obter Preço Estimado

```typescript
export async function getPancakeSwapPrice(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint
): Promise<bigint> {
  const { publicClient } = getClients();
  if (!publicClient) return 0n;

  const routerABI = [
    {
      name: 'getAmountsOut',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'amountIn', type: 'uint256' },
        { name: 'path', type: 'address[]' }
      ],
      outputs: [{ name: 'amounts', type: 'uint256[]' }]
    }
  ];

  const routerContract = getContract({
    address: PANCAKESWAP_ROUTER,
    abi: routerABI,
    client: publicClient,
  });

  const path = [tokenIn, tokenOut];
  const amounts = await routerContract.read.getAmountsOut([amountIn, path]);
  return amounts[1]; // amountOut
}
```

### 4. Comparar Preços

```typescript
export async function compareSwapPrices(
  usdtAmount: bigint
): Promise<{
  ownPool: { price: bigint; fee: number };
  pancakeswap: { price: bigint; fee: number };
  best: 'own' | 'pancakeswap';
}> {
  // Preço no pool próprio
  const ownPrice = await getLiquidityPoolData();
  const ownAmountOut = calculateSwapAmount(usdtAmount, ownPrice);

  // Preço na PancakeSwap
  const pancakePrice = await getPancakeSwapPrice(
    USDT_ADDRESS,
    LIPT_ADDRESS,
    usdtAmount
  );

  return {
    ownPool: {
      price: ownAmountOut,
      fee: 0.3 // 0.3%
    },
    pancakeswap: {
      price: pancakePrice,
      fee: 0.25 // ~0.25%
    },
    best: pancakePrice > ownAmountOut ? 'pancakeswap' : 'own'
  };
}
```

---

## ⚠️ Considerações Importantes

### Vantagens de Integrar PancakeSwap:

1. ✅ **Maior Liquidez** - Acesso a pools maiores
2. ✅ **Melhor Preço** - Possibilidade de encontrar melhor rate
3. ✅ **Padrão da Indústria** - Usuários já conhecem PancakeSwap
4. ✅ **Liquidez Compartilhada** - Não precisa criar liquidez própria

### Desvantagens:

1. ❌ **Perde Controle** - Taxas controladas pela PancakeSwap
2. ❌ **Dependência Externa** - Depende de terceiros
3. ❌ **Complexidade** - Mais código para manter
4. ❌ **Gas Fees** - Pode ser mais caro (router adicional)

### Recomendação:

**Manter Pool Próprio + Opção PancakeSwap**

- Pool próprio para controle e taxas customizadas
- PancakeSwap como alternativa para maior liquidez
- UI permite escolha do usuário
- Comparação de preços em tempo real

---

## 📝 Próximos Passos (se decidir implementar)

1. ✅ Verificar endereços oficiais da PancakeSwap na Polygon
2. ✅ Obter ABI do router V2
3. ✅ Implementar funções de swap via PancakeSwap
4. ✅ Adicionar comparação de preços
5. ✅ Atualizar UI para permitir escolha
6. ✅ Testar em testnet primeiro
7. ✅ Adicionar proteção contra slippage
8. ✅ Implementar fallback se PancakeSwap falhar

---

## 🔗 Recursos Úteis

- [PancakeSwap Documentation](https://docs.pancakeswap.finance/)
- [Uniswap V2 Router Interface](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02)
- [Polygon Network Info](https://polygon.technology/)

---

**Conclusão:** O sistema atual NÃO está preparado para PancakeSwap, mas pode ser integrado seguindo os passos acima. A recomendação é manter o pool próprio e adicionar PancakeSwap como opção alternativa.

