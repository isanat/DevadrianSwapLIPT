# Blockchain Event Listener

Este serviço escuta eventos emitidos pelos contratos inteligentes na blockchain Polygon e os salva no banco de dados para consulta posterior.

## Eventos Monitorados

### Staking Pool
- `Stake` - Quando um usuário faz stake de tokens
- `Unstake` - Quando um usuário remove stake
- `RewardClaimed` - Quando recompensas são reivindicadas

### Mining Pool
- `MinerActivated` - Quando um minerador é ativado
- `RewardsClaimed` - Quando recompensas de mineração são reivindicadas

### Wheel of Fortune
- `WheelSpun` - Quando a roda é girada

### Rocket Game
- `RocketPlayed` - Quando uma aposta é colocada
- `RocketCashedOut` - Quando o jogador faz cash out

### Lottery
- `TicketsPurchased` - Quando tickets são comprados
- `PrizeClaimed` - Quando um prêmio é reivindicado

### Referral Program
- `ReferralReward` - Quando uma comissão de referência é paga

## Como Executar

### Opção 1: Script Standalone

```bash
# Instalar ts-node se ainda não estiver instalado
pnpm install -D ts-node

# Executar o listener
npx ts-node src/services/blockchain/event-listener.ts
```

### Opção 2: Como Serviço (Recomendado para Produção)

Criar um arquivo systemd service:

```ini
[Unit]
Description=DevAdrian Swap Event Listener
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/studio
ExecStart=/usr/bin/node --loader ts-node/esm src/services/blockchain/event-listener.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Opção 3: Docker (Futuro)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "--loader", "ts-node/esm", "src/services/blockchain/event-listener.ts"]
```

## Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
DATABASE_URL=postgresql://user:password@localhost:5432/devadrian
```

## TODO

- [ ] Implementar conexão com banco de dados (PostgreSQL/MongoDB)
- [ ] Adicionar retry logic para falhas de rede
- [ ] Implementar checkpoint system para retomar de onde parou
- [ ] Adicionar logging estruturado (Winston/Pino)
- [ ] Implementar health check endpoint
- [ ] Adicionar métricas (Prometheus)
- [ ] Implementar rate limiting para chamadas à API
