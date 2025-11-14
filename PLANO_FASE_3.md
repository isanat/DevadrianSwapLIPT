# Fase 3: Internacionalização e Backend Off-Chain

## Status Atual

✅ **Sistema de i18n já implementado** - O projeto possui um sistema completo de tradução com suporte para:
- Inglês (en)
- Português (pt-BR)
- Espanhol (es)
- Italiano (it)

O sistema está localizado em `src/context/i18n-context.tsx` e usa o hook `useI18n()` para acessar traduções.

## Tarefas da Fase 3

### 3.1: Verificar e Substituir Textos Hardcoded Restantes

**Objetivo**: Garantir que todos os textos da aplicação usem o sistema de tradução.

**Ações**:
1. Buscar por strings hardcoded que não usam `t()` ou `useI18n()`
2. Identificar textos que precisam de chaves de tradução
3. Adicionar as chaves faltantes no `i18n-context.tsx`
4. Substituir strings hardcoded por chamadas `t()`

**Arquivos a verificar**:
- Todos os componentes em `src/components/`
- Mensagens de erro e toast
- Placeholders de inputs
- Labels e botões

### 3.2: Criar Estrutura Inicial do Backend Off-Chain

**Objetivo**: Criar a estrutura base para o backend que irá gerenciar dados off-chain.

**Opções de Implementação**:
1. **API Routes do Next.js** (Recomendado para começar)
   - Criar rotas em `src/app/api/`
   - Endpoints para histórico, leaderboard, etc.
   - Usar banco de dados (PostgreSQL já configurado)

2. **Serviço Backend Separado** (Para produção)
   - Serviço Node.js/Express separado
   - Comunicação via API REST
   - Mais escalável para produção

**Estrutura Proposta (API Routes)**:
```
src/app/api/
  ├── history/
  │   ├── route.ts          # GET /api/history - Histórico de transações
  │   └── [userId]/route.ts # GET /api/history/[userId] - Histórico do usuário
  ├── leaderboard/
  │   └── route.ts          # GET /api/leaderboard - Ranking de referidos
  ├── events/
  │   └── route.ts          # POST /api/events - Registrar eventos da blockchain
  └── stats/
      └── route.ts          # GET /api/stats - Estatísticas agregadas
```

### 3.3: Implementar Listener de Eventos Blockchain

**Objetivo**: Criar um serviço que escuta eventos da blockchain e salva no banco de dados.

**Eventos a Escutar**:
- `Stake` (StakingPool)
- `Unstake` (StakingPool)
- `RewardClaimed` (StakingPool)
- `MinerActivated` (MiningPool)
- `RewardsClaimed` (MiningPool)
- `WheelSpun` (WheelOfFortune)
- `RocketPlayed` (RocketGame)
- `RocketCashedOut` (RocketGame)
- `TicketsPurchased` (Lottery)
- `PrizeClaimed` (Lottery)
- `ReferralReward` (ReferralProgram)

**Implementação**:
1. Criar serviço em `src/services/blockchain-listener.ts`
2. Usar `publicClient.watchEvent()` do Viem
3. Salvar eventos no banco de dados
4. Executar como background job (usar `node-cron` ou similar)

### 3.4: Criar Endpoints para Leaderboard e Dados Agregados

**Objetivo**: Fornecer dados agregados para o frontend.

**Endpoints**:
1. **GET /api/leaderboard**
   - Retornar top 10 usuários por comissão de referência
   - Ordenar por total de comissões ganhas

2. **GET /api/stats**
   - TVL (Total Value Locked)
   - Total de tokens em staking
   - Total de tokens minerados
   - Estatísticas de jogos

3. **GET /api/history/[userId]**
   - Histórico completo de transações do usuário
   - Filtrar por tipo (staking, mining, games, etc.)

## Próximos Passos

1. ✅ **Corrigir erros de build** (Concluído)
2. 🔄 **Iniciar Fase 3.1**: Verificar textos hardcoded
3. ⏳ **Fase 3.2**: Criar estrutura do backend
4. ⏳ **Fase 3.3**: Implementar listener de eventos
5. ⏳ **Fase 3.4**: Criar endpoints de dados agregados

## Observações

- O sistema de i18n já está funcional e bem estruturado
- A Fase 3.1 pode ser feita incrementalmente, verificando componente por componente
- A Fase 3.2-3.4 requerem decisão sobre a arquitetura do backend (API Routes vs Serviço Separado)
- O banco de dados PostgreSQL já está configurado no ambiente de produção

