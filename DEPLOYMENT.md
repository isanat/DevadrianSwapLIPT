# Guia de Implantação dos Smart Contracts - DevAdrian Swap

Este documento descreve o processo completo de configuração do ambiente de desenvolvimento e implantação dos *smart contracts* do projeto **DevAdrian Swap** na **Polygon Mainnet**.

---

## 1. Visão Geral da Arquitetura

O projeto **DevAdrian Swap** é composto por **11 *smart contracts*** desenvolvidos em **Solidity 0.8.24** e implantados na rede **Polygon** (Testnet Amoy para desenvolvimento, Mainnet para produção).

### 1.1. Lista de Contratos

| ID | Nome do Contrato | Descrição | Arquivo |
| :--- | :--- | :--- | :--- |
| 1 | **LIPTToken** | Token ERC-20 principal do protocolo. | `LIPTToken.sol` |
| 2 | **MockUSDT** | Simulação de USDT para testes. | `MockUSDT.sol` |
| 3 | **ProtocolController** | Contrato de controle global do protocolo. | `ProtocolController.sol` |
| 4 | **TaxHandler** | Gerenciador de taxas de transação (Burn, LP, Reflection). | `TaxHandler.sol` |
| 5 | **DevAdrianSwapPool** | Pool de Liquidez (AMM) e lógica de Buyback. | `DevAdrianSwapPool.sol` |
| 6 | **StakingPool** | Gerenciador de Staking com múltiplos planos. | `StakingPool.sol` |
| 7 | **MiningPool** | Gerenciador de Mineração (Sala de Mineração). | `MiningPool.sol` |
| 8 | **ReferralProgram** | Sistema de Referidos (5 níveis). | `ReferralProgram.sol` |
| 9 | **WheelOfFortune** | Jogo da Roda da Fortuna. | `WheelOfFortune.sol` |
| 10 | **RocketGame** | Jogo do Foguete (Crash Game). | `RocketGame.sol` |
| 11 | **Lottery** | Lotaria Diária. | `Lottery.sol` |

### 1.2. Arquitetura Modular

A arquitetura foi projetada para ser modular e segura. O **ProtocolController** atua como o contrato central que detém a propriedade de todos os outros contratos, permitindo a gestão centralizada.

O **TaxHandler** é um contrato separado que gerencia a lógica de taxas de transação, permitindo que o **LIPTToken** seja um contrato ERC-20 padrão.

---

## 2. Configuração do Ambiente de Desenvolvimento

O ambiente de desenvolvimento utiliza **Hardhat**, um framework de desenvolvimento Ethereum/Polygon.

### 2.1. Pré-requisitos

*   **Node.js** (versão 22.13.0 ou superior)
*   **npm** ou **pnpm**
*   **Git**
*   **Conta MetaMask** com uma carteira de teste
*   **POL de Teste** na Polygon Amoy Testnet (obtido via Faucet)

### 2.2. Estrutura de Diretórios

```
studio/
├── contracts/                  # Diretório do projeto Hardhat
│   ├── contracts/              # Código-fonte dos Smart Contracts (Solidity)
│   │   ├── LIPTToken.sol
│   │   ├── MockUSDT.sol
│   │   ├── ProtocolController.sol
│   │   ├── TaxHandler.sol
│   │   ├── DevAdrianSwapPool.sol
│   │   ├── StakingPool.sol
│   │   ├── MiningPool.sol
│   │   ├── ReferralProgram.sol
│   │   ├── GameBase.sol
│   │   ├── WheelOfFortune.sol
│   │   ├── RocketGame.sol
│   │   └── Lottery.sol
│   ├── scripts/                # Scripts de implantação
│   │   └── deploy.cjs
│   ├── test/                   # Testes unitários (a serem implementados)
│   ├── artifacts/              # Artefatos de compilação (ABIs, bytecode)
│   ├── hardhat.config.cjs      # Configuração do Hardhat
│   ├── package.json            # Dependências do projeto
│   ├── .env                    # Variáveis de ambiente (CHAVE PRIVADA, RPC URL)
│   └── .env.example            # Exemplo de arquivo .env
├── src/                        # Código-fonte do Frontend (Next.js)
│   ├── config/
│   │   └── contracts.ts        # Endereços e ABIs dos contratos
│   ├── lib/
│   │   └── abi/                # ABIs dos contratos (copiados de artifacts/)
│   └── services/
│       ├── mock-api.ts         # API simulada (a ser substituída)
│       └── web3-api.ts         # Camada de serviço para interação com a blockchain
├── TOKENOMICS.md               # Documentação do modelo de Tokenomics
├── ARCHITECTURE.md             # Documentação da arquitetura do sistema
├── SMART_CONTRACT_SPECS.md     # Especificações dos Smart Contracts
└── DEPLOYMENT.md               # Este documento
```

### 2.3. Instalação das Dependências

Navegue até o diretório `studio/contracts/` e instale as dependências:

```bash
cd studio/contracts
npm install
```

As principais dependências são:

*   **hardhat**: Framework de desenvolvimento.
*   **@nomicfoundation/hardhat-toolbox**: Conjunto de ferramentas do Hardhat.
*   **@openzeppelin/contracts**: Biblioteca de contratos seguros (ERC-20, Ownable, etc.).
*   **dotenv**: Para carregar variáveis de ambiente do arquivo `.env`.

### 2.4. Configuração do Arquivo `.env`

Crie um arquivo **`.env`** no diretório `studio/contracts/` (use o `.env.example` como modelo) e preencha com as suas credenciais:

```env
# URL do RPC da Polygon Amoy Testnet
POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology"

# Chave Privada da sua conta MetaMask (com fundos na Testnet)
# ATENÇÃO: Use uma conta de teste e NUNCA compartilhe sua chave privada principal.
PRIVATE_KEY="SUA_CHAVE_PRIVADA_AQUI"
```

**Importante:**

*   **Nunca compartilhe sua chave privada principal.** Use uma carteira de teste dedicada.
*   **Adicione o arquivo `.env` ao `.gitignore`** para evitar que ele seja enviado para o repositório.

### 2.5. Configuração do Hardhat

O arquivo **`hardhat.config.cjs`** já está configurado para a rede Amoy:

```javascript
const { HardhatUserConfig } = require("hardhat/config");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const config = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;
```

---

## 3. Compilação dos Smart Contracts

Para compilar os *smart contracts*, execute:

```bash
npx hardhat compile --config hardhat.config.cjs
```

Os artefatos de compilação (ABIs e bytecode) serão salvos no diretório `artifacts/`.

---

## 4. Implantação na Polygon Mainnet

### 4.1. Obter POL (Polygon Native Token)

Antes de implantar, você precisa de **POL real** na sua carteira para pagar as taxas de gás.

**Importante:** A partir de setembro de 2024, a Polygon migrou do token MATIC para POL. Em dezembro de 2025, apenas POL é aceito como token de gas na Polygon Mainnet.

1.  **Adquirir POL:** Você pode adquirir POL em uma corretora de criptomoedas e transferi-lo para a sua carteira MetaMask.
2.  **Verificar o Saldo:** Confirme que o POL está na sua carteira antes de prosseguir.

### 4.2. Executar o Script de Implantação

O script **`deploy.cjs`** implanta todos os 11 contratos e configura as relações entre eles.

Execute o script com o comando:

```bash
npx hardhat run scripts/deploy.cjs --network mainnet
```

### 4.3. Endereços dos Contratos na Mainnet

A implantação foi concluída com sucesso. Abaixo estão os endereços oficiais dos contratos na Polygon Mainnet:

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

**Importante:** **Copie e guarde esses endereços.** Você precisará deles para a integração com o *frontend*.

---

## 5. Integração com o Frontend

O *frontend* Next.js já foi atualizado com os endereços reais dos contratos na Polygon Mainnet.

### 5.1. Arquivo `contracts.ts`

O arquivo **`studio/src/config/contracts.ts`** foi atualizado para usar os endereços da Mainnet por padrão. O endereço do `MockUSDT` foi substituído pelo endereço real do USDT na Polygon.

### 5.2. Copiar os ABIs

Os ABIs dos contratos já foram copiados para o diretório `studio/src/lib/abi/` durante a configuração. Se você recompilar os contratos, execute novamente:

```bash
cp /home/ubuntu/studio/contracts/artifacts/contracts/*.sol/*.json /home/ubuntu/studio/src/lib/abi/
```

### 5.3. Expandir o `web3-api.ts`

O arquivo **`studio/src/services/web3-api.ts`** contém as funções básicas de interação com a blockchain. Você pode expandir este arquivo para implementar as demais funcionalidades (Mineração, Jogos, Liquidez, etc.) seguindo o mesmo padrão.

### 5.2. Copiar os ABIs

Os ABIs dos contratos já foram copiados para o diretório `studio/src/lib/abi/` durante a configuração. Se você recompilar os contratos, execute novamente:

```bash
cp /home/ubuntu/studio/contracts/artifacts/contracts/*.sol/*.json /home/ubuntu/studio/src/lib/abi/
```

### 5.3. Expandir o `web3-api.ts`

O arquivo **`studio/src/services/web3-api.ts`** contém as funções básicas de interação com a blockchain. Você pode expandir este arquivo para implementar as demais funcionalidades (Mineração, Jogos, Liquidez, etc.) seguindo o mesmo padrão.

---

## 6. Estado Atual do Projeto

### 6.1. O Que Foi Concluído

*   **Documentação Completa:** Todos os aspectos do projeto foram documentados (Tokenomics, Arquitetura, Implantação, Integração).
*   **Desenvolvimento dos Smart Contracts:** Os 11 *smart contracts* foram desenvolvidos em Solidity e compilados com sucesso.
*   **Implantação na Mainnet:** Todos os 11 contratos foram implantados com sucesso na **Polygon Mainnet**.
*   **Integração do Frontend:** O *frontend* Next.js foi atualizado com os endereços reais dos contratos na Mainnet.

### 6.2. Próximos Passos

1.  **Adicionar Liquidez Inicial:** Para que o `DevAdrianSwapPool` funcione, você precisa adicionar liquidez inicial de LIPT e USDT.
2.  **Testar a Integração:** Teste exaustivamente todas as funcionalidades do *frontend* para garantir que as interações com os contratos na Mainnet estão a funcionar como esperado.
3.  **Auditoria de Segurança:** Como os contratos estão na Mainnet, é **altamente recomendável** que você realize uma auditoria de segurança profissional o mais rápido possível.
4.  **Desenvolvimento Contínuo:** Implemente as demais funcionalidades no `web3-api.ts` (Mineração, Jogos, etc.).

---

## 7. Como o Ambiente de Desenvolvimento Foi Criado

Este projeto foi desenvolvido em um **ambiente sandbox** com as seguintes características:

*   **Sistema Operacional:** Ubuntu 22.04 LTS (linux/amd64)
*   **Node.js:** Versão 22.13.0
*   **Gerenciador de Pacotes:** npm e pnpm
*   **Framework de Desenvolvimento:** Hardhat
*   **Biblioteca de Contratos:** OpenZeppelin Contracts

### 7.1. Passos para Recriar o Ambiente

Se você precisar recriar o ambiente de desenvolvimento em outro local, siga estes passos:

1.  **Instalar o Node.js:** Baixe e instale o Node.js (versão 22.13.0 ou superior) do site oficial.
2.  **Clonar o Repositório:** Clone o repositório do GitHub:
    ```bash
    git clone https://github.com/isanat/studio.git
    cd studio/contracts
    ```
3.  **Instalar as Dependências:** Execute `npm install` para instalar todas as dependências.
4.  **Configurar o `.env`:** Crie o arquivo `.env` com a sua chave privada e o URL do RPC.
5.  **Compilar os Contratos:** Execute `npx hardhat compile --config hardhat.config.cjs`.
6.  **Implantar os Contratos:** Execute `npx hardhat run scripts/deploy.cjs --network mainnet`.

### 7.2. Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npx hardhat compile --config hardhat.config.cjs` | Compila os *smart contracts*. |
| `npx hardhat run scripts/deploy.cjs --network mainnet` | Implanta os contratos na Polygon Mainnet. |
| `npx hardhat test` | Executa os testes unitários (a serem implementados). |
| `npx hardhat node` | Inicia um nó local do Hardhat para testes. |

---

## 8. Recursos Adicionais

*   **Documentação do Hardhat:** [https://hardhat.org/docs](https://hardhat.org/docs)
*   **Documentação do OpenZeppelin:** [https://docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts)
*   **Explorador de Blocos da Polygon:** [https://polygonscan.com/](https://polygonscan.com/)

---

**Autor:** Manus AI  
**Data:** 13 de Novembro de 2025
