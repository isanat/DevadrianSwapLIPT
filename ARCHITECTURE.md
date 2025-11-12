# Arquitetura do Sistema - DevAdrian Swap

## 1. Visão Geral - O Modelo Híbrido

Este documento descreve a arquitetura de alto nível para a plataforma "DevAdrian Swap". A plataforma seguirá um **modelo híbrido**, combinando a segurança e a transparência de **smart contracts na blockchain (On-Chain)** com a velocidade, flexibilidade e baixo custo de um **back-end tradicional e um painel de administração (Off-Chain)**.

Este modelo permite-nos oferecer o melhor dos dois mundos:
-   **Confiança e Descentralização:** Para todas as operações que envolvem a posse e a transferência de fundos dos utilizadores.
-   **Eficiência e Experiência do Utilizador:** Para operações que não são críticas para a custódia de fundos, como a exibição de dados, estatísticas e a gestão da plataforma.

---

## 2. Componentes On-Chain (Smart Contracts)

A regra principal é: **toda a lógica que gere diretamente os fundos dos utilizadores ou que exija confiança e transparência deve estar num smart contract.**

### Funcionalidades On-Chain Obrigatórias:

1.  **Tokens (LIPT e LP Tokens):**
    -   **Lógica:** Devem ser contratos padrão ERC-20 para garantir posse, transferências e compatibilidade.
    -   **Justificação:** A propriedade dos ativos é a base de uma plataforma DeFi.

2.  **Pool de Liquidez e Swap (AMM):**
    -   **Lógica:** O contrato deve guardar os tokens (LIPT/USDT), calcular os preços via fórmula AMM, e executar trocas e a gestão de liquidez (`add`/`remove`). Deve expor uma função para o `owner` ajustar a taxa de swap.
    -   **Justificação:** É o núcleo da funcionalidade DeFi. Os utilizadores precisam de confiar que a lógica de market-making é imutável e autónoma.

3.  **Staking Pool:**
    -   **Lógica:** O contrato deve guardar os LIPT em stake, calcular as recompensas (com base em planos configuráveis de APY e duração) e aplicar as penalidades de retirada antecipada. Deve permitir que o `owner` adicione, modifique ou remova planos.
    -   **Justificação:** Os fundos dos utilizadores estão bloqueados no contrato, e a lógica de recompensa deve ser transparente e garantida por código, mas flexível do ponto de vista administrativo.

4.  **Sala de Mineração:**
    -   **Lógica:** Similar ao Staking. O contrato gere o pagamento pelos "mineradores" e a subsequente geração e reivindicação de LIPT ao longo do tempo, com base em planos configuráveis. Deve permitir que o `owner` adicione ou modifique estes planos.
    -   **Justificação:** Garante que as recompensas prometidas serão pagas conforme as regras estabelecidas, que podem ser ajustadas administrativamente.

5.  **Jogos (Roda da Fortuna, Foguete, Lotaria):**
    -   **Lógica:** Os contratos devem receber e reter as apostas, utilizar uma fonte de aleatoriedade segura e verificável (ex: **Chainlink VRF**) para determinar os resultados, e pagar os prémios automaticamente. Os parâmetros dos jogos (segmentos da roda, "house edge" do foguete, preço do bilhete da lotaria) devem ser configuráveis pelo `owner`.
    -   **Justificação:** A aleatoriedade e o pagamento de prémios são os pontos que exigem maior confiança nos jogos. A flexibilidade na configuração permite a gestão da economia do jogo.

6.  **Programa de Referidos (Apenas a Lógica Essencial):**
    -   **Lógica:** Uma função `register(referrerAddress)` para armazenar a ligação referente-referido e uma função para calcular e pagar as comissões acumuladas com base em taxas por nível configuráveis pelo `owner`.
    -   **Justificação:** O pagamento de recompensas de referência deve ser on-chain para ser confiável, mas as taxas devem ser ajustáveis.

7.  **Funções de Controlo Global:**
    -   **Lógica:** O contrato principal deve ter funções de `owner` como `pause()` e `unpause()` para parar as atividades críticas em caso de emergência, e a capacidade de transferir a propriedade (`transferOwnership`).
    -   **Justificação:** Essencial para a segurança e gestão a longo prazo da plataforma.

---

## 3. Componentes Off-Chain (Back-end / Painel de Administração)

O back-end e o painel de administração servem como uma camada de aceleração, gestão e visualização de dados. Eles lidam com tudo o que é muito caro, lento, ou que precisa de flexibilidade para ser executado on-chain.

### Responsabilidades dos Componentes Off-Chain:

1.  **Agregação de Dados e Histórico (Back-end):**
    -   **Lógica:** Um serviço de back-end irá "ouvir" os eventos emitidos pelos smart contracts (ex: `Staked`, `TokensPurchased`, `WheelSpun`) e armazená-los numa base de dados tradicional (ex: Firestore, SQL).
    -   **Justificação:** Fornece uma API rápida e eficiente para o front-end (dashboard do utilizador e painel de admin) exibir históricos de transações, gráficos e tabelas, sem sobrecarregar a blockchain com chamadas de leitura (`view`).

2.  **Painel de Administração (Interface de Gestão):**
    -   **Lógica:** O painel de administração é a interface gráfica que permite ao `owner` da plataforma chamar as funções administrativas dos smart contracts de forma segura e intuitiva.
    -   **Responsabilidades de Gestão:**
        -   **Staking e Mineração:** Adicionar, editar e remover os planos disponíveis para os utilizadores (duração, APY, custo, poder).
        -   **Liquidez:** Monitorizar o estado da pool e ajustar a taxa de swap.
        -   **Programa de Referidos:** Configurar as percentagens de comissão para cada nível da rede.
        -   **Game Zone:**
            -   **Roda da Fortuna:** Modificar os segmentos, os seus multiplicadores e pesos (probabilidades).
            -   **Foguete LIPT:** Ajustar a "house edge" do jogo.
            -   **Lotaria Diária:** Alterar o preço do bilhete e iniciar manualmente um sorteio se necessário.
        -   **Configurações Globais:** Executar a pausa de emergência, ver os endereços dos contratos e iniciar a transferência de propriedade.

3.  **Programa de Referidos (Estrutura e Visualização):**
    -   **Lógica:** Enquanto o pagamento é on-chain, o back-end pode construir e armazenar a estrutura de rede multinível (a "árvore" de referidos) para consulta rápida.
    -   **Justificação:** Consultar uma estrutura de rede complexa on-chain é caro e lento. O back-end processa esta informação para fácil visualização no painel do utilizador e no admin.

4.  **Perfis de Utilizador e Leaderboard:**
    -   **Lógica:** O back-end pode associar metadados (como nomes de utilizador) a endereços de carteira. Ele também irá agregar os dados de comissões de referidos para construir e exibir o "Leaderboard".
    -   **Justificação:** Estas são funcionalidades de visualização que não precisam da segurança da blockchain.

---

## 4. Tabela Resumo da Arquitetura

| Funcionalidade          | Lógica Principal (Smart Contract - On-Chain)                    | Gestão e Visualização (Back-end / Admin - Off-Chain)                       |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Tokens & Swap**       | Gestão de fundos (ERC-20), lógica de troca AMM.                 | Exibir histórico. **Admin:** Ajustar taxa de swap.  |
| **Staking & Mineração** | Bloqueio de fundos, cálculo e pagamento de recompensas.         | **Admin:** Adicionar/modificar/remover planos (APY, duração, custo).               |
| **Jogos (Lotaria, etc.)** | Receber apostas, usar Chainlink VRF, pagar prémios.             | **Admin:** Configurar parâmetros (segmentos da roda, house edge, preço bilhete). Exibir histórico.   |
| **Referidos**           | Armazenar ligação `referente-referido`, pagar comissões.        | **Admin:** Configurar taxas de comissão por nível. Construir e exibir a árvore da rede. |
| **Leaderboard**         | N/A                                                             | Agregar dados de comissões e criar o ranking.                      |
| **Controlo Protocolo**  | Funções `pause()`, `transferOwnership()`.                       | **Admin:** Interface para chamar as funções de controlo de emergência e propriedade. |
| **Dados do Utilizador** | N/A                                                             | Associar perfis a carteiras, gerir preferências de notificação.    |
