# Guia de Integração do Frontend - DevAdrian Swap

Este documento descreve como o *frontend* (Next.js) do projeto **DevAdrian Swap** está integrado com os *smart contracts* na blockchain da Polygon e como adicionar novas funcionalidades.

---

## 1. Visão Geral da Integração

A integração entre o *frontend* e a blockchain é realizada através da biblioteca **`viem`**, uma alternativa moderna e leve à `ethers.js`. A lógica de interação está encapsulada em uma camada de serviço para manter o código organizado e fácil de manter.

### 1.1. Estrutura de Arquivos Relevantes

```
src/
├── config/
│   └── contracts.ts        # Endereços e ABIs dos contratos
├── lib/
│   └── abi/                # ABIs dos contratos (JSON)
└── services/
    ├── mock-api.ts         # API simulada (agora substituída)
    └── web3-api.ts         # Camada de serviço para interação com a blockchain
```

### 1.2. Fluxo de uma Chamada à Blockchain

1.  **Componente do Frontend (ex: `StakingPool.tsx`):** O componente do usuário chama uma função da camada de serviço (ex: `stakeLipt`).
2.  **Camada de Serviço (`web3-api.ts`):** A função na camada de serviço prepara a transação, obtém a aprovação do usuário via MetaMask e envia a transação para o *smart contract* correspondente.
3.  **Smart Contract:** O *smart contract* executa a lógica e retorna o resultado.

---

## 2. Configuração dos Contratos (`contracts.ts`)

O arquivo **`src/config/contracts.ts`** é o ponto central da configuração da integração. Ele exporta duas constantes principais:

*   **`CONTRACT_ABIS`:** Um objeto que contém os ABIs (Application Binary Interfaces) de todos os *smart contracts*. Os ABIs são importados dos arquivos JSON no diretório `src/lib/abi/`.
*   **`CONTRACT_ADDRESSES`:** Um objeto que contém os endereços dos contratos implantados. Ele seleciona automaticamente os endereços da **Mainnet** ou da **Testnet (Amoy)** com base na variável de ambiente `NEXT_PUBLIC_ACTIVE_NETWORK`.

```typescript
// Lógica para selecionar os endereços corretos com base na rede ativa
const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_ACTIVE_NETWORK as keyof typeof ADDRESSES || 'mainnet';

export const CONTRACT_ADDRESSES = ADDRESSES[ACTIVE_NETWORK];
```

---

## 3. Camada de Serviço Web3 (`web3-api.ts`)

O arquivo **`src/services/web3-api.ts`** é o coração da integração. Ele é responsável por:

1.  **Configurar os Clientes `viem`:**
    *   `publicClient`: Para chamadas de leitura (view functions) que não exigem a assinatura do usuário.
    *   `walletClient`: Para transações (write functions) que exigem a assinatura do usuário via MetaMask.

2.  **Instanciar os Contratos:** Usando a função `getContract` do `viem`, cada *smart contract* é instanciado com o seu endereço, ABI e os clientes `viem`.

3.  **Exportar Funções de Interação:** O arquivo exporta funções que encapsulam a lógica de chamada aos *smart contracts*. Essas funções são projetadas para serem facilmente consumidas pelos componentes do *frontend*.

### 3.1. Exemplo: Função `stakeLipt`

A função `stakeLipt` demonstra o padrão de duas etapas para transações que envolvem a transferência de tokens:

1.  **Aprovação (`approve`):** Primeiro, o contrato `LIPTToken` é chamado para aprovar o contrato `StakingPool` a gastar a quantidade de LIPT especificada.
2.  **Ação (`stake`):** Em seguida, a função `stake` do contrato `StakingPool` é chamada para realizar o staking.

```typescript
export async function stakeLipt(userAddress: Address, amount: bigint, planId: number) {
  // 1. Aprovar o StakingPool para gastar o LIPT
  const { request: approveRequest } = await liptContract.simulate.approve([STAKING_ADDRESS, amount], { account: userAddress });
  await walletClient.writeContract(approveRequest);

  // 2. Chamar a função stake
  const { request: stakeRequest } = await stakingContract.simulate.stake([amount, planId], { account: userAddress });
  const hash = await walletClient.writeContract(stakeRequest);
  return hash;
}
```

---

## 4. Como Adicionar Novas Funcionalidades

Para adicionar a interação com uma nova função de um *smart contract*, siga estes passos:

1.  **Verificar o ABI:** Certifique-se de que o ABI no diretório `src/lib/abi/` está atualizado com a nova função.
2.  **Adicionar a Função no `web3-api.ts`:** Crie uma nova função `async` no `web3-api.ts` que chame a função do *smart contract*.
    *   **Para Funções de Leitura (View):** Use `contrato.read.nomeDaFuncao([argumentos])`.
    *   **Para Funções de Escrita (Write):** Use o padrão `simulate` e `writeContract` do `viem`.
3.  **Chamar a Função no Componente:** Importe e chame a nova função do `web3-api.ts` no seu componente do *frontend*.

### 4.1. Exemplo: Adicionar a Função `claimRewards`

Para implementar a função de resgate de recompensas do Staking:

1.  **No `web3-api.ts`:**

    ```typescript
    export async function claimStakingRewards(userAddress: Address) {
      const { request } = await stakingContract.simulate.claimRewards([], { account: userAddress });
      const hash = await walletClient.writeContract(request);
      return hash;
    }
    ```

2.  **No Componente `StakingPool.tsx`:**

    ```typescript
    import { claimStakingRewards } from "@/services/web3-api";

    // ...

    const handleClaim = async () => {
      try {
        // Obter o endereço do usuário conectado
        const userAddress = "0x..."; // Substituir pela lógica de obtenção do endereço
        const txHash = await claimStakingRewards(userAddress);
        console.log("Recompensas resgatadas! Hash da transação:", txHash);
        // Adicionar lógica para atualizar a UI
      } catch (error) {
        console.error("Erro ao resgatar recompensas:", error);
      }
    };
    ```

---

## 5. Próximos Passos Recomendados

*   **Implementar a Lógica de Conexão da Carteira:** Use uma biblioteca como `wagmi` ou `web3-react` para gerenciar a conexão com a MetaMask e obter o endereço do usuário conectado de forma dinâmica.
*   **Expandir o `web3-api.ts`:** Implemente as funções restantes para Mineração, Jogos, Liquidez, etc., seguindo o padrão estabelecido.
*   **Tratamento de Erros e Feedback ao Usuário:** Melhore a experiência do usuário adicionando feedback visual para transações pendentes, bem-sucedidas e com falha.
*   **Leitura de Eventos:** Para dados agregados (como estatísticas do painel), implemente um serviço de *backend* (ou use um serviço como o The Graph) para "ouvir" os eventos emitidos pelos *smart contracts* e armazenar os dados em um banco de dados para consulta rápida.
