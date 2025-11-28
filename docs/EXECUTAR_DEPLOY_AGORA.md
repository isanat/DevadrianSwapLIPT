# 🚀 EXECUTAR DEPLOY AGORA

## 📋 Comandos para Executar no PowerShell

Copie e cole estes comandos um por vez no PowerShell:

```powershell
# 1. Navegar para o diretório
cd C:\Users\morei\Desktop\DevadrianSwapLIPT\contracts

# 2. Desabilitar telemetria
$env:HARDHAT_DISABLE_TELEMETRY="1"

# 3. Executar deploy completo (pode levar alguns minutos)
.\node_modules\.bin\hardhat.cmd run scripts/deploy-complete.cjs --network mainnet
```

## ⏱️ Tempo Estimado

- Deploy completo: ~5-10 minutos
- Gas necessário: ~0.5-1 POL (estimado)

## 📝 Após o Deploy

Os endereços serão salvos automaticamente em:
- `contracts/deployment-addresses.json`

Depois, atualize o frontend com:
```powershell
node scripts/update-contracts-config.cjs
```

## ⚠️ Importante

- Certifique-se de ter saldo POL suficiente
- O deploy vai criar NOVOS contratos
- Você precisará atualizar o frontend após o deploy

