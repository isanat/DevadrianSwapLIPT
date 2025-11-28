""
# Análise e Plano de Ação: Dados Hardcoded no Projeto DevAdrian Swap

## 1. Visão Geral

Este documento analisa o relatório `DADOS_MOCKADOS_E_HARDCODED.md` e fornece um plano de ação detalhado para corrigir os problemas identificados. A correção desses problemas é crucial para a segurança, funcionalidade e manutenibilidade do projeto.

## 2. Análise dos Problemas

### 🔴 Problemas Críticos (Risco Alto)

| Problema | Impacto | Solução Recomendada |
|---|---|---|
| **Funções Faltantes no `mock-api.ts`** | A aplicação não compila ou falha em tempo de execução. | Implementar todas as funções faltantes no `web3-api.ts` e integrá-las ao `mock-api.ts`. |
| **`MOCK_USER_ADDRESS`** | Todas as interações usam um endereço falso. | Substituir pelo endereço da carteira conectada (via `useAccount` do wagmi). |
| **Lógica de Jogos no Frontend** | Crash point e multiplicadores são calculados no frontend, permitindo manipulação. | A lógica de resultado dos jogos deve ser obtida do Smart Contract (via Chainlink VRF). |
| **Segmentos da Roda Hardcoded** | Os pesos e valores da Roda da Fortuna estão no frontend, não no contrato. | Criar função no Smart Contract para gerenciar os segmentos e pesos. |

### 🟡 Problemas Importantes (Risco Médio)

| Problema | Impacto | Solução Recomendada |
|---|---|---|
| **Planos de Staking e Mineração Hardcoded** | Dificulta a atualização e o gerenciamento dos planos. | Criar funções no `ProtocolController` para adicionar, remover e atualizar planos. |
| **Penalidade de Unstake Hardcoded** | A penalidade não pode ser ajustada sem reimplantar o contrato. | Criar função no `StakingPool` para definir a penalidade. |
| **Decimais e RPC Hardcoded** | Dificulta a mudança de rede ou o uso de tokens com diferentes decimais. | Usar variáveis de ambiente (`.env`) para o RPC e obter os decimais do contrato do token. |
| **Textos Hardcoded (Tradução)** | Dificulta a internacionalização e a manutenção dos textos. | Usar um sistema de tradução (i18n) para todas as strings visíveis ao usuário. |

### 🟢 Problemas de Baixa Prioridade (Risco Baixo)

| Problema | Impacto | Solução Recomendada |
|---|---|---|
| **Cores e Animações Hardcoded** | Apenas estético. | Manter como está. Não representa risco funcional. |
| **Endereços de Contratos** | Já estão em um arquivo de configuração, o que é aceitável. | Mover para variáveis de ambiente para maior segurança e flexibilidade. |

## 3. Plano de Ação Detalhado

### Fase 1: Correções Críticas (Imediato)

1.  **Implementar Funções Faltantes:**
    - Criar todas as funções de jogos, mineração, liquidez e loteria no `web3-api.ts`.
    - Integrar essas funções no `mock-api.ts` para que os componentes possam chamá-las.

2.  **Remover Endereço Mockado:**
    - Usar o hook `useAccount` da biblioteca `wagmi` para obter o endereço do usuário conectado.
    - Passar o endereço como parâmetro para as funções da API.

3.  **Mover Lógica de Jogos para o Backend:**
    - Modificar os contratos de jogos para que os resultados sejam gerados on-chain (via Chainlink VRF).
    - O frontend deve apenas solicitar o resultado do contrato, não calculá-lo.

4.  **Gerenciar Segmentos da Roda no Contrato:**
    - Adicionar uma função `setWheelSegments` no contrato `WheelOfFortune`.
    - O frontend deve buscar os segmentos do contrato em vez de tê-los hardcoded.

### Fase 2: Melhorias Importantes (Curto Prazo)

1.  **Gerenciamento de Planos (Staking e Mineração):**
    - Adicionar funções `addStakingPlan`, `updateStakingPlan`, `addMiningPlan`, etc., no `ProtocolController`.
    - Criar uma seção no painel de administração para gerenciar esses planos.

2.  **Configurações Dinâmicas:**
    - Adicionar função `setEarlyUnstakePenalty` no `StakingPool`.
    - Criar campo no painel de administração para ajustar a penalidade.

3.  **Variáveis de Ambiente:**
    - Mover o URL do RPC para um arquivo `.env.local` (`NEXT_PUBLIC_RPC_URL`).
    - Mover os endereços dos contratos para o mesmo arquivo.

4.  **Internacionalização (i18n):**
    - Implementar uma biblioteca como `next-i18next`.
    - Substituir todas as strings hardcoded por chaves de tradução.

## 4. Documentação e Repositório

- Este documento (`HARDCODED_DATA_ANALYSIS.md`) será salvo no repositório.
- As alterações de código serão feitas em branches separadas para cada fase do plano de ação.
- Cada pull request incluirá uma descrição detalhada das correções aplicadas.

Este plano de ação garante que os problemas de dados hardcoded sejam resolvidos de forma estruturada, priorizando os riscos mais críticos e melhorando a segurança e a flexibilidade do projeto **DevAdrian Swap**.
""
