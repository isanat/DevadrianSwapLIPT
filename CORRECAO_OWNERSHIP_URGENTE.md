# ⚠️ PROBLEMA CRÍTICO: Ownership

## 🚨 Situação

O ProtocolController **NÃO tem funções proxy** para chamar os contratos filhos. Isso significa que você não pode gerenciar os contratos mesmo sendo owner do ProtocolController.

## 💡 Solução Imediata

Você precisa **transferir o ownership dos contratos filhos de volta para sua carteira diretamente**.

### Passo a Passo:

1. **Exportar a private key da sua carteira** (que é owner do ProtocolController):
   - MetaMask: Settings → Security & Privacy → Reveal Seed Phrase
   - Ou usar a private key diretamente

2. **Executar o script de transferência**:
   ```bash
   cd contracts
   # Configure a private key da sua carteira
   export OWNER_PRIVATE_KEY=0x...sua_private_key_aqui...
   npx hardhat run scripts/transfer-ownership.cjs --network mainnet
   ```

3. **Verificar a transferência**:
   - Acesse `/admin/ownership-check`
   - Verifique se agora você é owner direto dos contratos

## ❌ Por Que Não Funciona Atualmente?

O `StakingPool` verifica:
```solidity
require(msg.sender == owner(), "OwnableUnauthorizedAccount");
```

- `msg.sender` = sua carteira
- `owner()` = ProtocolController
- Resultado: REJEITA ❌

O ProtocolController não tem funções para fazer proxy das chamadas, então não há como chamar através dele.

## ✅ Após Transferir Ownership

Depois de transferir, você será owner direto e poderá:
- ✅ Criar planos de staking
- ✅ Criar planos de mining
- ✅ Configurar jogos
- ✅ Gerenciar tudo normalmente

