# 🚨 Problema de Ownership - Explicação Completa

## Situação Atual

1. **Você é owner do ProtocolController**: `0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903`
2. **StakingPool owner é o ProtocolController**: `0x5BC8aB3884aFEf2D4c361856Bb24EC286B395263`
3. **Quando você tenta criar um plano**: O contrato rejeita com `OwnableUnauthorizedAccount`

## Por Que Acontece?

O `StakingPool` tem este código:

```solidity
function addStakingPlan(uint256 _duration, uint256 _apy) public onlyOwner {
    plans.push(StakingPlan(_duration, _apy, true));
}
```

O modifier `onlyOwner` verifica:
```solidity
require(msg.sender == owner(), "OwnableUnauthorizedAccount");
```

Quando você chama `addStakingPlan` diretamente:
- `msg.sender` = sua carteira (`0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903`)
- `owner()` = ProtocolController (`0x5BC8aB3884aFEf2D4c361856Bb24EC286B395263`)
- Resultado: `msg.sender != owner()` → REJEITA ❌

## O Problema Real

O **ProtocolController NÃO tem funções proxy** para chamar os contratos filhos. Ele só armazena os endereços, mas não tem funções como:

```solidity
function addStakingPlan(uint256 _duration, uint256 _apy) public onlyOwner {
    StakingPool(stakingPool).addStakingPlan(_duration, _apy);
}
```

## Soluções

### ✅ Solução 1: Transferir Ownership de Volta (MAIS SIMPLES)

Transferir ownership dos contratos filhos diretamente para sua carteira via Hardhat:

```bash
cd contracts
# Configure OWNER_PRIVATE_KEY com a private key do ProtocolController owner
export OWNER_PRIVATE_KEY=0x...
npx hardhat run scripts/transfer-ownership.cjs --network mainnet
```

**Pré-requisito**: Você precisa ter a private key da carteira que é owner do ProtocolController.

### ⚠️ Solução 2: Adicionar Funções Proxy no ProtocolController

Criar um novo ProtocolController com funções proxy e fazer redeploy. Mas isso é complexo e requer transferir tudo novamente.

### ❌ Solução 3: Modificar Contratos Filhos

Modificar os contratos para aceitar chamadas do ProtocolController owner. Mas os contratos já estão deployados e não podem ser modificados.

## Recomendação

**Use a Solução 1**: Transferir ownership de volta para sua carteira.

Você precisa da private key da carteira que é owner do ProtocolController (que é você mesmo: `0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903`).

Se você não tiver a private key dessa carteira, você precisa:
1. Exportar do MetaMask/Wallet
2. Ou transferir ownership do ProtocolController para uma carteira que você tem a private key
3. Depois transferir ownership dos contratos filhos

