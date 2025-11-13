"""
# Análise Profunda e Plano de Ação Viável: Dados Hardcoded

## 1. Visão Geral

Este documento fornece uma análise detalhada e um plano de ação seguro para os problemas de dados hardcoded identificados no `DADOS_MOCKADOS_E_HARDCODED.md`. A análise considera que os **Smart Contracts já estão implantados na Polygon Mainnet e são imutáveis**, e respeita a **arquitetura híbrida (On-Chain/Off-Chain)** do projeto.

## 2. Análise da Situação Atual

Após revisar os contratos implantados e o `ARCHITECTURE.md`, confirmei que os contratos já possuem funções de administração (`owner-only`) para gerenciar muitos dos parâmetros que estão hardcoded no frontend. Isso é uma excelente notícia, pois significa que **não precisamos reimplantar os contratos** para a maioria das correções.

## 3. Classificação dos Problemas e Plano de Ação

### Categoria 1: Deve Vir do Smart Contract (Já Implementado)

Estes são os parâmetros que já podem ser gerenciados pelos contratos implantados. A tarefa é **substituir os valores hardcoded no frontend por chamadas de leitura (`view`) aos contratos**.

| Problema Hardcoded | Contrato | Função de Leitura (`view`) | Plano de Ação |
|---|---|---|---|
| **Planos de Staking** | `StakingPool.sol` | `plans(uint256)` | Criar função no `web3-api.ts` para buscar todos os planos de staking e exibi-los dinamicamente. |
| **Planos de Mineração** | `MiningPool.sol` | `plans(uint256)` | Criar função no `web3-api.ts` para buscar todos os planos de mineração. |
| **Penalidade de Unstake** | `StakingPool.sol` | `earlyUnstakePenaltyBasisPoints()` | Obter o valor da penalidade do contrato e usá-lo nos cálculos. |
| **Segmentos da Roda** | `WheelOfFortune.sol` | `segments(uint256)` | Criar função no `web3-api.ts` para buscar os segmentos e pesos da roda. |
| **Taxa de Swap** | `DevAdrianSwapPool.sol` | `swapFeeBasisPoints()` | Obter a taxa de swap do contrato. |
| **Taxas de Referidos** | `ReferralProgram.sol` | `commissionRates(uint256)` | Obter as taxas de comissão do contrato. |
| **Taxas de Jogo** | `RocketGame.sol`, `WheelOfFortune.sol` | `houseEdgeBasisPoints()` | Obter a taxa da casa de cada jogo. |

### Categoria 2: Deve Vir do Backend/Admin (Off-Chain)

Estes são dados que, conforme a arquitetura, devem ser gerenciados por um backend off-chain para eficiência. Como o backend ainda não foi construído, a solução temporária é **mover esses dados para um arquivo de configuração JSON no frontend**, que servirá como um "mini-banco de dados" temporário.

| Problema Hardcoded | Solução Imediata (Frontend) | Solução Final (Backend) |
|---|---|---|
| **Histórico de Transações** | Manter o mock, pois não há backend para ouvir eventos. | Construir o serviço de backend que ouve os eventos da blockchain e os salva em um banco de dados. |
| **Leaderboard** | Manter o mock. | O backend deve agregar os dados de comissões e criar o ranking. |
| **Estrutura de Referidos** | Manter o mock. | O backend deve construir a árvore de referidos para consulta rápida. |

### Categoria 3: Deve ser Corrigido no Frontend

Estes são problemas de lógica e implementação no frontend que precisam ser corrigidos.

| Problema Hardcoded | Solução |
|---|---|
| **Funções Faltantes no `mock-api.ts`** | Implementar todas as funções faltantes no `web3-api.ts` para interagir com os contratos reais. |
| **`MOCK_USER_ADDRESS`** | Usar o hook `useAccount` da biblioteca `wagmi` para obter o endereço do usuário conectado. |
| **Lógica de Jogos no Frontend** | O frontend deve apenas **enviar a aposta** e **aguardar o resultado** do contrato. A lógica de cálculo de crash point e multiplicador deve ser removida do frontend. |
| **Decimais Hardcoded** | Criar uma função no `web3-api.ts` que chama a função `decimals()` do contrato do token para obter os decimais corretos. |
| **RPC Hardcoded** | Mover o URL do RPC para um arquivo `.env.local` (`NEXT_PUBLIC_RPC_URL`). |
| **Textos Hardcoded (Tradução)** | Implementar uma biblioteca como `next-i18next` e substituir todas as strings por chaves de tradução. |

## 4. Plano de Ação Viável e Seguro

### Fase 1: Correções de Funcionalidade e Segurança (Imediato)

1.  **Implementar Funções Faltantes:** Focar em implementar todas as funções de interação com os contratos no `web3-api.ts`.
2.  **Remover Endereço Mockado:** Integrar o `useAccount` para usar o endereço real do usuário.
3.  **Corrigir Lógica de Jogos:** Remover os cálculos de resultado do frontend e fazer com que ele apenas confie no resultado vindo do contrato.
4.  **Corrigir Decimais e RPC:** Mover para variáveis de ambiente e funções dinâmicas.

### Fase 2: Integração com Dados On-Chain (Curto Prazo)

1.  **Buscar Dados dos Contratos:** Implementar as chamadas `view` para buscar dinamicamente os planos de staking, mineração, segmentos da roda e taxas.
2.  **Painel de Administração:** Conectar o painel de administração para que ele chame as funções `owner-only` já existentes nos contratos (ex: `addStakingPlan`, `setWheelSegments`).

### Fase 3: Internacionalização e Backend (Médio Prazo)

1.  **Implementar i18n:** Substituir todos os textos hardcoded.
2.  **Construir o Backend Off-Chain:** Iniciar o desenvolvimento do serviço de backend para gerenciar histórico, leaderboard e outras funcionalidades off-chain.

## Conclusão

Este plano de ação é **seguro e viável** porque **não requer a reimplementação de nenhum Smart Contract**. Ele aproveita as funções de administração já existentes e foca em corrigir a lógica do frontend para que ele se comporte como um verdadeiro cliente da arquitetura híbrida, lendo dados dinâmicos dos contratos e do futuro backend, em vez de usar valores hardcoded.

Este documento será salvo no repositório para referência futura.
"""
