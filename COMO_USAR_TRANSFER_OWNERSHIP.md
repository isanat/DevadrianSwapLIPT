# 📝 Como Usar o Script de Transferência de Ownership

## ⚠️ IMPORTANTE

O script **NÃO vai funcionar diretamente** porque:
- Os contratos filhos têm o **ProtocolController** como owner
- O ProtocolController **NÃO tem funções proxy** para transferir ownership de volta
- Você precisa ser owner direto dos contratos para transferir ownership

## 🔍 Solução

Você tem 2 opções:

### Opção 1: Transferir Ownership via ProtocolController (REQUER MODIFICAÇÃO)

1. **Modificar o ProtocolController** para adicionar funções proxy
2. **Fazer redeploy** do ProtocolController
3. **Transferir ownership** usando as novas funções

Mas isso é complexo e requer redeploy.

### Opção 2: Usar o Script Atual (VAI FALHAR, MAS VAI MOSTRAR O PROBLEMA)

O script atual vai tentar transferir ownership diretamente. Como os contratos têm o ProtocolController como owner, vai falhar, mas vai mostrar claramente qual é o problema.

## 📋 Para Executar o Script

```bash
cd contracts

# O script já usa PRIVATE_KEY do .env automaticamente
npx hardhat run scripts/transfer-ownership.cjs --network mainnet
```

O script vai:
1. ✅ Verificar se você é owner do ProtocolController
2. ❌ Tentar transferir ownership dos contratos filhos
3. ❌ Falhar porque você não é owner direto (o ProtocolController é)
4. 📊 Mostrar um resumo claro do problema

## 💡 Recomendação

**A melhor solução é modificar o ProtocolController para adicionar funções proxy**:

```solidity
function transferStakingPoolOwnership(address newOwner) public onlyOwner {
    StakingPool(stakingPool).transferOwnership(newOwner);
}

function transferMiningPoolOwnership(address newOwner) public onlyOwner {
    MiningPool(miningPool).transferOwnership(newOwner);
}

// ... etc para todos os contratos
```

Depois fazer redeploy e transferir ownership usando essas funções.

