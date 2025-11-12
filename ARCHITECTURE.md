# Arquitetura do Sistema - DevAdrian Swap

## 1. Visão Geral - O Modelo Híbrido

Este documento descreve a arquitetura de alto nível para a plataforma "DevAdrian Swap". A plataforma seguirá um **modelo híbrido**, combinando a segurança e a transparência de **smart contracts na blockchain (On-Chain)** com a velocidade, flexibilidade e baixo custo de um **back-end tradicional (Off-Chain)**.

Este modelo permite-nos oferecer o melhor dos dois mundos:
-   **Confiança e Descentralização:** Para todas as operações que envolvem a posse e a transferência de fundos dos utilizadores.
-   **Eficiência e Experiência do Utilizador:** Para operações que não são críticas para a custódia de fundos, como a exibição de dados, estatísticas e gestão da plataforma.

---

## 2. Componentes On-Chain (Smart Contracts)

A regra principal é: **toda a lógica que gere diretamente os fundos dos utilizadores ou que exija confiança e transparência deve estar num smart contract.**

### Funcionalidades On-Chain Obrigatórias:

1.  **Tokens (LIPT e LP Tokens):**
    -   **Lógica:** Devem ser contratos padrão ERC-20 para garantir posse, transferências e compatibilidade.
    -   **Justificação:** A propriedade dos ativos é a base de uma plataforma DeFi.

2.  **Pool de Liquidez e Swap (AMM):**
    -   **Lógica:** O contrato deve guardar os tokens (LIPT/USDT), calcular os preços via fórmula AMM, e executar trocas e a gestão de liquidez (`add`/`remove`).
    -   **Justificação:** É o núcleo da funcionalidade DeFi. Os utilizadores precisam de confiar que a lógica de market-making é imutável e autónoma.

3.  **Staking Pool:**
    -   **Lógica:** O contrato deve guardar os LIPT em stake, calcular as recompensas (com base em APY e duração) e aplicar as penalidades de retirada antecipada de forma determinística.
    -   **Justificação:** Os fundos dos utilizadores estão bloqueados no contrato, e a lógica de recompensa deve ser transparente e garantida por código.

4.  **Sala de Mineração:**
    -   **Lógica:** Similar ao Staking. O contrato gere o pagamento pelos "mineradores" e a subsequente geração e reivindicação de LIPT ao longo do tempo.
    -   **Justificação:** Garante que as recompensas prometidas serão pagas conforme as regras estabelecidas.

5.  **Jogos (Roda da Fortuna, Foguete, Lotaria):**
    -   **Lógica:** Os contratos devem receber e reter as apostas, utilizar uma fonte de aleatoriedade segura e verificável (ex: **Chainlink VRF**) para determinar os resultados, e pagar os prémios automaticamente.
    -   **Justificação:** A aleatoriedade e o pagamento de prémios são os pontos que exigem maior confiança nos jogos. A utilização da Chainlink VRF é crucial para provar a justeza dos resultados.

6.  **Programa de Referidos (Apenas a Lógica Essencial):**
    -   **Lógica:** Uma função `register(referrerAddress)` para armazenar a ligação referente-referido e uma função para calcular e pagar as comissões acumuladas.
    -   **Justificação:** O pagamento de recompensas de referência deve ser on-chain para ser confiável.

---

## 3. Componentes Off-Chain (Back-end / Admin)

O back-end serve como uma camada de aceleração, gestão e visualização de dados. Ele lida com tudo o que é muito caro, lento, ou que precisa de flexibilidade para ser executado on-chain.

### Responsabilidades do Back-end:

1.  **Agregação de Dados e Histórico:**
    -   **Lógica:** O back-end irá "ouvir" os eventos emitidos pelos smart contracts (ex: `Staked`, `TokensPurchased`, `WheelSpun`) e armazená-los numa base de dados tradicional (ex: Firestore, SQL).
    -   **Justificação:** Fornece uma API rápida e eficiente para o front-end exibir históricos de transações, gráficos e tabelas, sem sobrecarregar a blockchain com chamadas de leitura (`view`).

2.  **Programa de Referidos (Estrutura e Visualização):**
    -   **Lógica:** Enquanto o pagamento é on-chain, o back-end irá construir e armazenar a estrutura de rede multinível (a "árvore" de referidos).
    -   **Justificação:** Consultar uma estrutura de rede complexa on-chain é caro e lento. O back-end pode processar esta informação para fácil visualização no painel do utilizador e no admin.

3.  **Painel de Administração e Gestão de Contratos:**
    -   **Lógica:** O back-end (ou uma interface de admin segura) terá o controlo (`owner`) sobre os smart contracts para chamar funções administrativas.
    -   **Exemplos:**
        -   Adicionar novos planos de Staking ou Mineração.
        -   Ajustar a taxa de swap da pool.
        -   Pausar funcionalidades dos contratos em caso de emergência.
    -   **Justificação:** Separa as preocupações de gestão da lógica do utilizador final, proporcionando flexibilidade administrativa.

4.  **Perfis de Utilizador e Leaderboard:**
    -   **Lógica:** O back-end pode associar metadados (como nomes de utilizador) a endereços de carteira. Ele também irá agregar os dados de comissões de referidos para construir e exibir o "Leaderboard".
    -   **Justificação:** Estas são funcionalidades de visualização que não precisam da segurança da blockchain.

---

## 4. Tabela Resumo da Arquitetura

| Funcionalidade          | Lógica Principal (Smart Contract - On-Chain)                    | Gestão e Visualização (Back-end - Off-Chain)                       |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Tokens & Swap**       | Gestão de fundos (ERC-20), lógica de troca AMM.                 | Exibir histórico de transações (lido da base de dados off-chain).  |
| **Staking & Mineração** | Bloqueio de fundos, cálculo e pagamento de recompensas.         | Adicionar/modificar planos, ver estatísticas gerais.               |
| **Jogos (Lotaria, etc.)** | Receber apostas, usar Chainlink VRF, pagar prémios.             | Exibir histórico de jogos, iniciar/agendar rondas, estatísticas.   |
| **Referidos**           | Armazenar ligação `referente-referido`, pagar comissões.        | Construir e exibir a árvore da rede, calcular estatísticas por nível. |
| **Leaderboard**         | N/A                                                             | Agregar dados de comissões e criar o ranking.                      |
| **Dados do Utilizador** | N/A                                                             | Associar perfis a carteiras, gerir preferências de notificação.    |
