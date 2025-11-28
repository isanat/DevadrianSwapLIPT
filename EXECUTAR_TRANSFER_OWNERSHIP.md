# 🚀 Como Executar o Script de Transferência

## ✅ Configuração

O script já está configurado para usar `PRIVATE_KEY` do arquivo `.env` no diretório `contracts/`.

## 📋 Passos

1. **Verifique que a PRIVATE_KEY está no `.env`**:
   ```bash
   cd contracts
   # Verifique se existe: PRIVATE_KEY=0x...
   ```

2. **Execute o script**:
   ```bash
   cd contracts
   npx hardhat run scripts/transfer-ownership.cjs --network mainnet
   ```

## ⚠️ O Que Vai Acontecer

O script vai:
1. ✅ Verificar se sua carteira é owner do ProtocolController
2. ⚠️ Tentar transferir ownership dos contratos filhos
3. ❌ **Vai falhar** porque o owner atual é o ProtocolController (não sua carteira)
4. 📊 Mostrar um resumo claro do problema

## 💡 Por Que Vai Falhar?

Os contratos filhos foram transferidos para o ProtocolController. Para transferir ownership de volta, o ProtocolController precisa ter funções proxy, que ele **não tem**.

## 🔧 Solução

Você precisa **modificar o ProtocolController** para adicionar funções proxy e fazer redeploy. Ou transferir ownership diretamente se ainda não foi transferido.

Mas primeiro, **execute o script para ver a situação real** de cada contrato!

