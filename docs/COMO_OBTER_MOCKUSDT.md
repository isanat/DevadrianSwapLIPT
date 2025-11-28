# 💡 Como Obter MockUSDT para Interagir com o Sistema

**Status:** ⚠️ Sistema atual usa MockUSDT (token de teste)

## 📋 Funcionalidades que Precisam de MockUSDT

### ✅ Sim, você precisa de MockUSDT para:

1. **Comprar LIPT Tokens** (`token-purchase.tsx`)
   - Precisar trocar MockUSDT por LIPT no pool de swap

2. **Adicionar Liquidez** (`liquidity-pool.tsx`)
   - Precisar de MockUSDT + LIPT para adicionar liquidez ao pool

### ❌ Não precisa de MockUSDT para:

- **Staking** - só precisa de LIPT
- **Mining** - só precisa de LIPT
- **Jogos** (Wheel of Fortune, Rocket Game) - só precisa de LIPT
- **Loteria** - só precisa de LIPT
- **Sistema de Afiliados** - não precisa de tokens

---

## 🎯 Como Obter MockUSDT

### Opção 1: Mintar diretamente do contrato (atual)

O contrato MockUSDT tem uma função `mint()` **pública** que permite qualquer pessoa mintar tokens.

**Endereço do contrato MockUSDT na Polygon Mainnet:**
```
0x47A50422F81327139A4796C7494E7B8725D3EB30
```

**Como fazer:**
1. Conectar carteira (MetaMask) à Polygon Mainnet
2. Ir ao Polygonscan: https://polygonscan.com/address/0x47A50422F81327139A4796C7494E7B8725D3EB30
3. Conectar wallet e usar a função `mint(address to, uint256 amount)`
4. Escolher sua carteira como `to` e a quantidade desejada

### Opção 2: Criar uma função de faucet no sistema (recomendado)

Criar uma página/componente que permite os usuários mintarem MockUSDT diretamente pelo frontend.

---

## ⚠️ Problema Atual

**MockUSDT é um token de teste** e não deveria estar em produção. Problemas:

1. ❌ Não tem valor real - não pode ser comprado em exchanges
2. ❌ Qualquer pessoa pode mintar tokens ilimitadamente
3. ❌ Não é o USDT real da Tether

---

## ✅ Solução Recomendada: Migrar para USDT Real

### Endereço USDT Real na Polygon:
```
0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

### Vantagens:
- ✅ Token com valor de mercado real
- ✅ Pode ser comprado em exchanges
- ✅ Liquidez real
- ✅ Sistema profissional

### Como Migrar:
1. Atualizar endereço em `src/config/contracts.ts`
2. Usuários compram USDT real em exchanges
3. Transferem USDT para Polygon via bridge
4. Podem usar USDT real para comprar LIPT

---

## 📝 Resumo

**Para usar o sistema atual:**
- ✅ Você precisa de **POL** para gas fees
- ✅ Você precisa de **MockUSDT** para comprar LIPT e adicionar liquidez
- ✅ Você pode mintar MockUSDT diretamente do contrato (função pública)
- ⚠️ MockUSDT não tem valor real - é apenas para testes

**Recomendação:** Migrar para USDT real o quanto antes para produção real.

