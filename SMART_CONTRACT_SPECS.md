# Especificações Técnicas para o Smart Contract - DevAdrian Swap

## 1. Visão Geral

Este documento descreve os requisitos técnicos para os smart contracts que servirão de back-end para a plataforma de DeFi "DevAdrian Swap". A interface do utilizador (front-end) e o painel de administração já foram desenvolvidos. Os smart contracts devem implementar a lógica necessária para tornar estas funcionalidades operacionais na blockchain, incluindo as funções de gestão que serão chamadas pelo painel de administração.

## 2. Tokens

### 2.1. Token da Plataforma (LIPT)
- **Nome:** LIPT Token
- **Símbolo:** LIPT
- **Padrão:** ERC-20
- **Fornecimento Total:** A definir. O contrato deve permitir a cunhagem (minting) de novos tokens, controlada pelo `owner`, especialmente para recompensas de staking e mineração.

### 2.2. Token de Pagamento (USDT)
- A plataforma utilizará USDT (ou outro stablecoin ERC-20) como principal meio de troca.
- O endereço do contrato do USDT será uma variável configurável.

## 3. Funcionalidades de Utilizador

### 3.1. Compra de Tokens (Swap)
- **Função `swap(tokenIn, tokenOut, amountIn)`:** Implementada no contrato de Pool de Liquidez (AMM).
- **Lógica de Preço:** O contrato deve implementar uma lógica de market-making (AMM) para determinar o preço.
- **Evento `TokensSwapped(user, tokenIn, tokenOut, amountIn, amountOut)`:** Emitido após uma troca bem-sucedida.

### 3.2. Staking Pool de LIPT
- **Estruturas de Dados:**
  - `StakingPlan`: `{ duration: uint, apy: uint, active: bool }` (duração em dias, APY em pontos base, ex: 12.5% = 1250)
  - `Stake`: `{ user: address, amount: uint, startDate: uint, planId: uint, rewardsClaimed: uint }`
- **Funções de Utilizador:**
  - **`stake(amount, planId)`:** Faz stake de `amount` LIPT de acordo com um `planId` ativo.
  - **`claimRewards()`:** Calcula e transfere as recompensas acumuladas para o utilizador.
  - **`unstake(stakeId)`:** Permite retirar o capital, aplicando uma penalidade de 10% (configurável) se for feito antes da maturação.
- **Eventos:** `Staked`, `RewardsClaimed`, `Unstaked`.

### 3.3. Pool de Liquidez (LIPT/USDT)
- Segue um modelo AMM padrão (ex: Uniswap V2).
- **Funções de Utilizador:**
  - **`addLiquidity(liptAmount, usdtAmount)`:** Deposita tokens e recebe tokens LP.
  - **`removeLiquidity(lpTokenAmount)`:** Queima tokens LP e recebe os tokens proporcionais.
  - **`swap(...)`:** Função principal para a troca entre LIPT e USDT.
- **Taxa:** A taxa de swap (ex: 0.3%) deve ser configurável pelo `owner`.

### 3.4. Sala de Mineração
- **Estruturas de Dados:**
  - `MiningPlan`: `{ cost: uint, power: uint, duration: uint, active: bool }` (poder em LIPT por hora).
  - `Miner`: `{ user: address, startDate: uint, planId: uint }`
- **Funções de Utilizador:**
  - **`activateMiner(planId)`:** O utilizador paga o `cost` em LIPT e ativa um minerador de um plano ativo.
  - **`claimMinedRewards()`:** Calcula e transfere os LIPT gerados pelos mineradores ativos.
- **Eventos:** `MinerActivated`, `MinedRewardsClaimed`.

### 3.5. Programa de Referidos (Unilevel)
- **Lógica:**
  - **`register(referrerAddress)`:** Um novo utilizador regista-se sob um referente.
  - O contrato armazena a estrutura da rede e as percentagens de comissão por nível.
- **Função de Utilizador:**
  - **`claimReferralRewards()`:** Permite que um utilizador resgate as suas comissões de referência acumuladas.

### 3.6. Zona de Jogos (Roda da Fortuna)
- **Lógica:**
  - **`spinWheel(betAmount)`:** Utilizador aposta LIPT. O contrato usa **Chainlink VRF** para determinar o resultado com base em segmentos (multiplicadores e pesos) configuráveis.
- **Evento:** `WheelSpun(user, betAmount, multiplier, winnings)`.

### 3.7. Zona de Jogos (Foguete LIPT)
- **Lógica:**
  - O ponto de "crash" da ronda é determinado de forma segura antes do início usando **Chainlink VRF**.
  - **`playRocket(betAmount)`:** Utilizador entra na próxima ronda.
  - **`cashOutRocket()`:** Utilizador solicita o cash out durante a ronda.
- **Eventos:** `RocketRoundStarted`, `RocketBetPlaced`, `RocketCashedOut`, `RocketRoundCrashed`.

### 3.8. Zona de Jogos (Lotaria Diária)
- **Lógica:**
  - **`buyTickets(ticketQuantity)`:** Utilizador compra bilhetes com LIPT. O preço é configurável.
  - O sorteio do vencedor no final do período deve usar **Chainlink VRF**.
- **Funções de Utilizador:**
  - `buyTickets(ticketQuantity)`
  - `claimLotteryPrize(drawId)`: Chamada pelo vencedor para reclamar o prémio.
- **Eventos:** `NewLotteryDraw`, `TicketsPurchased`, `LotteryWinnerDrawn`, `LotteryPrizeClaimed`.

## 4. Funções de Administração (Owner-Only)

O `owner` do contrato deve ter acesso a funções para gerir a plataforma.

### 4.1. Controlo Global
- **`pause()` e `unpause()`:** Funções para parar e retomar as principais atividades do contrato (staking, swaps, jogos) em caso de emergência.
- **`transferOwnership(newOwner)`:** Transfere a propriedade do contrato.

### 4.2. Gestão de Staking
- **`addStakingPlan(duration, apy)`**
- **`modifyStakingPlan(planId, duration, apy, active)`**
- **`setEarlyUnstakePenalty(percentage)`**

### 4.3. Gestão de Mineração
- **`addMiningPlan(cost, power, duration)`**
- **`modifyMiningPlan(planId, cost, power, duration, active)`**

### 4.4. Gestão do Pool de Liquidez
- **`setSwapFee(feePercentage)`:** Ajusta a taxa de swap (em pontos base, ex: 0.3% = 30).

### 4.5. Gestão de Referidos
- **`setReferralCommissionRates(rates: uint[])`:** Define as taxas de comissão para cada nível (ex: [500, 300, 150] para 5%, 3%, 1.5%).

### 4.6. Gestão de Jogos
- **Roda da Fortuna:**
  - **`setWheelSegments(multipliers: uint[], weights: uint[])`:** Configura os segmentos da roda.
- **Foguete LIPT:**
  - **`setRocketHouseEdge(edgePercentage)`:** Define a vantagem da casa.
- **Lotaria:**
  - **`setLotteryTicketPrice(price)`**
  - **`forceDrawWinner()`:** Função para o admin forçar o sorteio de um vencedor, caso o keeper automático falhe.

## 5. Funções de Consulta (View/Pure)

O contrato deve expor funções de `view` para que o front-end possa ler o estado da blockchain, incluindo:
- `getLiptPrice()`
- `getUserStakes(userAddress)`
- `getUnclaimedRewards(userAddress)`
- `getStakingPlans()`
- `getUserMiners(userAddress)`
- `getMinedRewards(userAddress)`
- `getMiningPlans()`
- `getReferralNetwork(userAddress)`
- `getLotteryStatus()`
- `getWheelSegments()`
- E outras funções de consulta necessárias para popular todos os dados da UI dos painéis de utilizador e administração.
