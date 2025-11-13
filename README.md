> **Aviso:** Este projeto foi implantado na **Polygon Mainnet**. A interação com os contratos envolve **fundos reais** e **riscos significativos**. Os contratos não foram auditados profissionalmente. Use por sua conta e risco.

# DevAdrian Swap - Plataforma DeFi na Polygon

**DevAdrian Swap** é uma plataforma de Finanças Descentralizadas (DeFi) completa, implantada na blockchain da **Polygon**. O projeto adota um modelo híbrido, combinando a segurança e a transparência de 11 *smart contracts* (On-Chain) com a velocidade e a flexibilidade de um *frontend* moderno em Next.js (Off-Chain).

Este repositório contém tanto o código-fonte do *frontend* (Next.js) quanto o código-fonte dos *smart contracts* (Solidity).

---

## 1. Visão Geral e Arquitetura

A arquitetura do sistema foi projetada para ser modular, segura e escalável.

*   **On-Chain (Backend):** 11 *smart contracts* em Solidity que governam toda a lógica de negócio, incluindo o token LIPT, o pool de liquidez (AMM), staking, mineração, jogos e o sistema de referidos.
*   **Off-Chain (Frontend):** Uma aplicação em Next.js que serve como a interface do usuário (Dashboard) e o painel de administração para a gestão do protocolo.

Para uma descrição detalhada da arquitetura, consulte o arquivo **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## 2. Tokenomics (LIPT Token)

O token nativo da plataforma, **LIPT**, foi projetado com um modelo de **Tokenomics Deflacionário Híbrido** para incentivar a posse, a liquidez e a valorização a longo prazo.

| Característica | Descrição |
| :--- | :--- |
| **Fornecimento Total** | 1 Bilhão de LIPT (Fixo) |
| **Mecanismos** | Taxas de transação, Queima (Burn), Recompra (Buyback), Staking e Recompensas de Mineração. |
| **Taxas de Transação** | 10% em cada transação, distribuídos para Queima, Pool de Liquidez e Marketing. |

Para uma análise completa do modelo de Tokenomics, consulte o arquivo **[TOKENOMICS.md](TOKENOMICS.md)**.

---

## 3. Smart Contracts Implantados na Polygon Mainnet

Todos os 11 *smart contracts* foram implantados com sucesso na **Polygon Mainnet**. Abaixo estão os endereços oficiais dos contratos. **Sempre verifique estes endereços antes de interagir com o protocolo.**

| Contrato | Endereço na Polygon Mainnet |
| :--- | :--- |
| **LIPTToken** | `0x3113026cDdfE9145905003f5065A2BF815B82F91` |
| **USDT (Tether USD)** | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| **ProtocolController** | `0x6B99297aCc06a5b19387844864D0FbA79C3066a9` |
| **TaxHandler** | `0x0dC4576f6a77Bc27B2026d17828E521F734FEE39` |
| **DevAdrianSwapPool** | `0xF2d672c4985ba7F9bc8B4D7621D94f9fBE357197` |
| **StakingPool** | `0x2db77F5d7ce547f17F648e6E70296938539E7174` |
| **MiningPool** | `0x745151FE81F1cfA2D4BB0942a7863551F0336A57` |
| **ReferralProgram** | `0xEB70c71b57F0c4f740c27e39e58eE4D9d59ebf64` |
| **WheelOfFortune** | `0xF0A209965F1F17CFA14a78b6D47e1F4F035aBA8a` |
| **RocketGame** | `0xf2089db174dd570346dD4E146EB2c81bf474f716` |
| **Lottery** | `0x657a4685AA2F56F10d885d0F99284c421cD33308` |

Para as especificações detalhadas de cada contrato, consulte o arquivo **[SMART_CONTRACT_SPECS.md](SMART_CONTRACT_SPECS.md)**.

---

## 4. Guia de Desenvolvimento e Implantação

Se você deseja configurar o ambiente de desenvolvimento, compilar, testar ou reimplantar os contratos, siga o guia detalhado no arquivo **[DEPLOYMENT.md](DEPLOYMENT.md)**.

Este guia cobre:

*   Configuração do ambiente Hardhat.
*   Instalação de dependências.
*   Compilação e teste dos contratos.
*   Instruções para implantação em Testnet ou Mainnet.

---

## 5. Integração do Frontend

O *frontend* (Next.js) já está configurado para interagir com os contratos implantados na Polygon Mainnet.

*   **Endereços e ABIs:** O arquivo `src/config/contracts.ts` contém todos os endereços e ABIs necessários.
*   **Camada de Serviço Web3:** O arquivo `src/services/web3-api.ts` encapsula a lógica de interação com a blockchain usando a biblioteca `viem`.

Para mais detalhes sobre como o *frontend* está integrado e como adicionar novas funcionalidades, consulte o guia **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)**.

---

## 6. Como Começar (Frontend)

Para executar o *frontend* localmente:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/isanat/studio.git
    cd studio
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 7. Contribuições

Este projeto foi desenvolvido pela **Manus AI**. Contribuições da comunidade são bem-vindas. Para contribuir, por favor, crie um *fork* do repositório, faça as suas alterações e abra um *Pull Request*.
