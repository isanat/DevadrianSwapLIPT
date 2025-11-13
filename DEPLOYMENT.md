# Guia de Implantação dos Smart Contracts - DevAdrian Swap

Este documento descreve o processo completo de configuração do ambiente de desenvolvimento e implantação dos *smart contracts* do projeto **DevAdrian Swap** na **Polygon Amoy Testnet**.

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
*   **MATIC de Teste** na Polygon Amoy Testnet (obtido via Faucet)

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

## 4. Implantação na Polygon Amoy Testnet

### 4.1. Obter MATIC de Teste

Antes de implantar, você precisa de **MATIC de teste** na sua carteira para pagar as taxas de gás.

1.  **Encontre o Endereço da Sua Carteira:** Use a MetaMask ou um explorador de blocos para encontrar o endereço público associado à sua chave privada.
2.  **Use um Faucet:** Acesse um Faucet da Polygon Amoy (ex: [https://faucet.polygon.technology/](https://faucet.polygon.technology/)) e solicite MATIC de teste.
3.  **Verifique o Saldo:** Confirme que o MATIC foi creditado na sua carteira antes de prosseguir.

### 4.2. Executar o Script de Implantação

O script **`deploy.cjs`** implanta todos os 11 contratos e configura as relações entre eles.

Execute o script com o comando:

```bash
npx hardhat run scripts/deploy.cjs --network amoy
```

### 4.3. Saída Esperada

Ao final da implantação bem-sucedida, o script exibirá os endereços de todos os contratos implantados:

```
MockUSDT deployed to: 0x...
LIPTToken deployed to: 0x...
ProtocolController deployed to: 0x...
TaxHandler deployed to: 0x...
DevAdrianSwapPool deployed to: 0x...
StakingPool deployed to: 0x...
MiningPool deployed to: 0x...
ReferralProgram deployed to: 0x...
WheelOfFortune deployed to: 0x...
RocketGame deployed to: 0x...
Lottery deployed to: 0x...

--- Starting Post-Deployment Configuration ---
Setting ProtocolController addresses...
ProtocolController configured.
Setting TaxHandler Liquidity Pool address...
TaxHandler configured.
Transferring ownership to ProtocolController...
Ownership transferred to ProtocolController.

Deployment and Configuration Complete!
Please save the following addresses for frontend integration:
LIPTToken: 0x...
MockUSDT: 0x...
ProtocolController: 0x...
TaxHandler: 0x...
DevAdrianSwapPool: 0x...
StakingPool: 0x...
MiningPool: 0x...
ReferralProgram: 0x...
WheelOfFortune: 0x...
RocketGame: 0x...
Lottery: 0x...
```

**Importante:** **Copie e guarde esses endereços.** Você precisará deles para a integração com o *frontend*.

---

## 5. Integração com o Frontend

Após a implantação, você precisa atualizar o *frontend* Next.js com os endereços reais dos contratos.

### 5.1. Atualizar o Arquivo `contracts.ts`

Abra o arquivo **`studio/src/config/contracts.ts`** e substitua os endereços MOCK pelos endereços reais obtidos na implantação:

```typescript
// Endereços para a rede de testes (Polygon Amoy)
amoy: {
    liptToken: '0x...', // Substituir pelo endereço real do LIPTToken
    mockUsdt: '0x...', // Substituir pelo endereço real do MockUSDT
    protocolController: '0x...', // Substituir pelo endereço real do ProtocolController
    taxHandler: '0x...', // Substituir pelo endereço real do TaxHandler
    swapPool: '0x...', // Substituir pelo endereço real do DevAdrianSwapPool
    stakingPool: '0x...', // Substituir pelo endereço real do StakingPool
    miningPool: '0x...', // Substituir pelo endereço real do MiningPool
    referralProgram: '0x...', // Substituir pelo endereço real do ReferralProgram
    wheelOfFortune: '0x...', // Substituir pelo endereço real do WheelOfFortune
    rocketGame: '0x...', // Substituir pelo endereço real do RocketGame
    lottery: '0x...', // Substituir pelo endereço real do Lottery
},
```

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

*   **Documentação do Tokenomics:** O modelo de Tokenomics foi documentado no arquivo **`TOKENOMICS.md`**.
*   **Desenvolvimento dos Smart Contracts:** Os 11 *smart contracts* foram desenvolvidos em Solidity e compilados com sucesso.
*   **Configuração do Ambiente:** O ambiente de desenvolvimento Hardhat foi configurado para a Polygon Amoy Testnet.
*   **Script de Implantação:** O script `deploy.cjs` foi criado e testado (faltando apenas fundos para a implantação real).
*   **Integração do Frontend:** O *frontend* Next.js foi atualizado com a estrutura de endereços e ABIs dos contratos.

### 6.2. Próximos Passos

1.  **Obter MATIC de Teste:** Adicione MATIC de teste à sua carteira na Amoy Testnet.
2.  **Executar a Implantação:** Execute o script `deploy.cjs` para implantar os contratos.
3.  **Atualizar os Endereços:** Substitua os endereços MOCK no `contracts.ts` pelos endereços reais.
4.  **Testar a Integração:** Teste as funcionalidades do *frontend* para garantir que as chamadas aos *smart contracts* estão funcionando.
5.  **Desenvolvimento Contínuo:** Implemente as demais funcionalidades no `web3-api.ts` (Mineração, Jogos, etc.).
6.  **Auditoria de Segurança:** Antes de implantar na Mainnet, realize uma auditoria de segurança dos *smart contracts*.

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
6.  **Implantar os Contratos:** Execute `npx hardhat run scripts/deploy.cjs --network amoy`.

### 7.2. Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npx hardhat compile --config hardhat.config.cjs` | Compila os *smart contracts*. |
| `npx hardhat run scripts/deploy.cjs --network amoy` | Implanta os contratos na Amoy Testnet. |
| `npx hardhat test` | Executa os testes unitários (a serem implementados). |
| `npx hardhat node` | Inicia um nó local do Hardhat para testes. |

---

## 8. Recursos Adicionais

*   **Documentação do Hardhat:** [https://hardhat.org/docs](https://hardhat.org/docs)
*   **Documentação do OpenZeppelin:** [https://docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts)
*   **Polygon Amoy Faucet:** [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
*   **Explorador de Blocos da Amoy:** [https://amoy.polygonscan.com/](https://amoy.polygonscan.com/)

---

**Autor:** Manus AI  
**Data:** 13 de Novembro de 2025
