# Especificações Técnicas para o Smart Contract - DevAdrian Swap

## 1. Visão Geral

Este documento descreve os requisitos técnicos para o smart contract que servirá de back-end para a plataforma de DeFi "DevAdrian Swap". A interface do utilizador (front-end) já foi desenvolvida e simula todas as funcionalidades descritas abaixo. O smart contract deve implementar a lógica necessária para tornar estas funcionalidades operacionais na blockchain.

## 2. Tokens

### 2.1. Token da Plataforma (LIPT)
- **Nome:** LIPT Token
- **Símbolo:** LIPT
- **Padrão:** ERC-20
- **Fornecimento Total:** A definir. O contrato deve permitir a cunhagem (minting) de novos tokens, especialmente para recompensas de staking e mineração.

### 2.2. Token de Pagamento (USDT)
- A plataforma utilizará USDT (ou outro stablecoin ERC-20) como principal meio de troca.
- O endereço do contrato do USDT será uma variável configurável.

## 3. Funcionalidades Principais

### 3.1. Compra de Tokens (Swap)
O contrato deve permitir que os utilizadores comprem tokens LIPT usando USDT.

- **Função `purchaseLipt(usdtAmount)`:**
  - Recebe uma quantidade de `usdtAmount`.
  - O utilizador deve ter aprovado previamente o contrato para gastar o `usdtAmount` de USDT.
  - O contrato calcula a quantidade de LIPT a ser recebida com base num preço.
  - **Lógica de Preço:** O contrato deve implementar uma lógica de market-making (por exemplo, um pool de liquidez, como descrito na secção 3.3) para determinar o preço.
  - Transfere os USDT do utilizador para o contrato (ou para o pool de liquidez).
  - Transfere os LIPT calculados para a carteira do utilizador.
- **Evento `TokensPurchased(user, usdtAmount, liptAmount)`:**
  - Emitido após uma compra bem-sucedida.

### 3.2. Staking Pool de LIPT
O contrato deve permitir que os utilizadores façam stake de LIPT para ganhar recompensas.

- **Estruturas de Dados:**
  - `StakingPlan`: `{ duration: uint, apy: uint }` (duração em dias, APY em pontos base, ex: 12.5% = 1250)
  - `Stake`: `{ user: address, amount: uint, startDate: uint, planId: uint, rewardsClaimed: uint }`
- **Configuração:**
  - O contrato deve armazenar uma lista de `StakingPlan`s. Planos atuais na UI:
    - 20 dias, 12.5% APY
    - 30 dias, 15.0% APY
    - 60 dias, 20.0% APY
    - 90 dias, 25.0% APY
- **Funções:**
  - **`stake(amount, planId)`:**
    - O utilizador faz stake de `amount` LIPT de acordo com o `planId`.
    - LIPT são transferidos do utilizador para o contrato.
    - Cria um novo registo de `Stake`.
  - **`claimRewards()`:**
    - Calcula as recompensas acumuladas para todos os stakes de um utilizador.
    - As recompensas são calculadas proporcionalmente ao tempo decorrido.
    - Transfere as recompensas (LIPT) para o utilizador.
    - Atualiza o `rewardsClaimed` no registo de `Stake`.
  - **`unstake(stakeId)`:**
    - Permite ao utilizador retirar o seu capital.
    - Verifica se o período de stake (`duration`) foi concluído.
    - **Penalidade:** Se o unstake for feito antes da data de maturação, uma penalidade de 10% é aplicada ao montante principal (`amount`). O valor da penalidade fica no contrato.
    - Transfere o `amount` (com ou sem penalidade) de volta para o utilizador.
    - Remove o registo de `Stake`.
- **Eventos:**
  - `Staked(user, amount, planId, stakeId)`
  - `RewardsClaimed(user, totalAmount)`
  - `Unstaked(user, stakeId, amountReturned, penaltyAmount)`

### 3.3. Pool de Liquidez (LIPT/USDT)
O contrato deve gerir um pool de liquidez para o par LIPT/USDT, seguindo um modelo AMM (Automated Market Maker) padrão, como o Uniswap V2.

- **Funções:**
  - **`addLiquidity(liptAmount, usdtAmount)`:**
    - O utilizador deposita LIPT e USDT no pool.
    - O contrato cunha e envia tokens LP (Liquidity Provider) para o utilizador.
  - **`removeLiquidity(lpTokenAmount)`:**
    - O utilizador queima os seus `lpTokenAmount`.
    - O contrato devolve as quantidades proporcionais de LIPT e USDT ao utilizador.
  - **`swap(...)`:** A função principal para a troca entre LIPT e USDT. Deve incluir uma taxa de swap (ex: 0.3%) que é acumulada para os fornecedores de liquidez.

### 3.4. Sala de Mineração
Os utilizadores podem comprar "mineradores" que geram LIPT ao longo do tempo.

- **Estruturas de Dados:**
  - `MiningPlan`: `{ cost: uint, power: uint, duration: uint }` (poder em LIPT por hora, duração em dias).
  - `Miner`: `{ user: address, startDate: uint, planId: uint }`
- **Configuração:**
  - O contrato deve armazenar uma lista de `MiningPlan`s. Planos atuais na UI:
    - Basic: 1000 LIPT, 0.5 LIPT/h, 30 dias
    - Advanced: 5000 LIPT, 3.0 LIPT/h, 60 dias
    - Professional: 10000 LIPT, 7.5 LIPT/h, 90 dias
- **Funções:**
  - **`activateMiner(planId)`:**
    - O utilizador paga o `cost` em LIPT, que são transferidos para o contrato (ou queimados).
    - Cria um novo registo de `Miner` para o utilizador.
  - **`claimMinedRewards()`:**
    - Calcula o total de LIPT gerado por todos os mineradores ativos de um utilizador desde o último resgate.
    - O cálculo deve considerar o tempo decorrido e o `power` de cada minerador.
    - Um minerador para de gerar recompensas após a sua `duration` expirar.
    - Transfere os LIPT gerados para o utilizador.
- **Eventos:**
  - `MinerActivated(user, planId, minerId)`
  - `MinedRewardsClaimed(user, totalAmount)`

### 3.5. Programa de Referidos (Unilevel)
O sistema deve recompensar os utilizadores por indicarem novos membros.

- **Lógica:**
  - Cada utilizador deve ter um link de referido (gerado no front-end, contendo o endereço da carteira).
  - **`register(referrerAddress)`:** Um novo utilizador, ao fazer a sua primeira grande interação (ex: primeiro stake ou compra de minerador), deve ser registado sob o seu referente (`referrerAddress`).
  - O contrato precisa de armazenar a estrutura da rede (quem indicou quem).
  - **Comissões:** Uma percentagem das atividades (ex: taxas de staking, custos de ativação de mineradores) dos utilizadores indicados deve ser distribuída aos seus referentes em múltiplos níveis. A UI mostra 5 níveis; a profundidade e as percentagens devem ser configuráveis.
- **Função:**
  - **`claimReferralRewards()`:** Permite que um utilizador resgate as suas comissões de referência acumuladas.

### 3.6. Zona de Jogos (Roda da Fortuna)
Um jogo de sorte onde os utilizadores apostam LIPT para girar uma roleta.

- **Lógica:**
  - A roleta tem 8 segmentos com diferentes multiplicadores e probabilidades (pesos).
  - **`spinWheel(betAmount)`:**
    - O utilizador aposta `betAmount` LIPT.
    - O contrato precisa de uma fonte segura de aleatoriedade (ex: Chainlink VRF) para determinar o resultado de forma justa e transparente.
    - Com base no resultado aleatório e nos pesos dos segmentos, o contrato determina o prémio.
    - O prémio é `betAmount * multiplier`.
    - Os LIPT da aposta inicial são transferidos para o contrato. O prémio é transferido do contrato para o utilizador.
- **Segmentos (configuração de exemplo):**
  - `{ value: 1.5x, weight: 8 }`
  - `{ value: 0x, weight: 25 }`
  - `{ value: 1x, weight: 10 }`
  - `{ value: 3x, weight: 2 }`
  - `{ value: 0.5x, weight: 20 }`
  - `{ value: 2x, weight: 5 }`
  - `{ value: 0x, weight: 20 }`
  - `{ value: 1x, weight: 10 }`
- **Evento:**
  - `WheelSpun(user, betAmount, multiplier, winnings)`

### 3.7. Zona de Jogos (Foguete LIPT - "Crash Game")
Um jogo de aposta onde os utilizadores apostam LIPT e decidem quando fazer "cash out" de um multiplicador crescente.

- **Lógica:**
  - O jogo consiste num multiplicador que começa em 1.00x e aumenta exponencialmente.
  - A qualquer momento, o jogo pode "crashar" num ponto aleatório. Este ponto de crash deve ser determinado de forma segura e transparente antes do início da ronda, usando uma fonte de aleatoriedade (ex: Chainlink VRF).
  - Os utilizadores fazem uma aposta antes do início da ronda.
  - Durante a ronda, eles podem fazer "cash out" a qualquer momento, recebendo `betAmount * currentMultiplier`.
  - Se um utilizador não fizer cash out antes do ponto de crash, ele perde a aposta.
- **Funções:**
  - **`playRocket(betAmount)`:**
    - O utilizador regista a sua aposta `betAmount` para a próxima ronda. Os LIPT são transferidos para o contrato.
  - **`cashOutRocket()`:**
    - O utilizador solicita o cash out na ronda atual.
    - O contrato verifica se a ronda ainda está ativa (não "crashou").
    - Se for válido, calcula o prémio `betAmount * currentMultiplier` e transfere-o para o utilizador.
- **Eventos:**
  - `RocketRoundStarted(roundId, crashPointHash)` (o hash do ponto de crash é revelado no início)
  - `RocketBetPlaced(roundId, user, betAmount)`
  -`RocketCashedOut(roundId, user, cashOutMultiplier, winnings)`
  - `RocketRoundCrashed(roundId, crashPoint)` (o ponto de crash é revelado no final)

### 3.8. Zona de Jogos (Lotaria Diária)
Uma lotaria periódica onde os utilizadores podem comprar bilhetes para ganhar um prémio acumulado.

- **Lógica:**
  - A lotaria tem sorteios com uma duração definida (ex: 24 horas).
  - Os utilizadores compram bilhetes com LIPT. O custo de cada bilhete é fixo.
  - Uma parte do custo dos bilhetes vai para o prémio acumulado (`prizePool`).
  - No final do período, um bilhete vencedor é sorteado aleatoriamente, usando uma fonte segura de aleatoriedade (ex: Chainlink VRF).
- **Estruturas de Dados:**
  - `LotteryDraw`: `{ id: uint, endTime: uint, prizePool: uint, status: enum, winningTicket: uint, winnerAddress: address }`
  - `Ticket`: `{ owner: address, drawId: uint, ticketId: uint }`
- **Configuração:**
  - `ticketPrice`: Custo de cada bilhete em LIPT.
  - `drawDuration`: Duração de cada sorteio em segundos.
- **Funções:**
  - **`buyTickets(ticketQuantity)`:**
    - O utilizador compra `ticketQuantity` bilhetes.
    - O contrato calcula o custo total (`ticketPrice * ticketQuantity`), transfere os LIPT do utilizador e atribui os números dos bilhetes.
  - **`closeAndDrawWinner()`:**
    - Função restrita (possivelmente chamada por um keeper da Chainlink) que é executada após `endTime`.
    - Solicita um número aleatório à Chainlink VRF.
    - Com o número aleatório, determina o bilhete vencedor e o endereço do vencedor.
    - Atualiza o estado do sorteio para "CLOSED" e inicia um novo sorteio.
  - **`claimLotteryPrize(drawId)`:**
    - O vencedor do sorteio `drawId` chama esta função.
    - O contrato verifica se o chamador é o vencedor e se o prémio já não foi reivindicado.
    - Transfere o `prizePool` para o vencedor.
- **Eventos:**
  - `NewLotteryDraw(drawId, endTime)`
  - `TicketsPurchased(user, drawId, ticketQuantity)`
  - `LotteryWinnerDrawn(drawId, winningTicket, winnerAddress)`
  - `LotteryPrizeClaimed(drawId, user, amount)`

## 4. Funções de Consulta (View/Pure)

O contrato deve expor funções de `view` para que o front-end possa ler o estado da blockchain sem custos de gás, incluindo:
- `getLiptPrice()`: Retorna o preço atual do LIPT.
- `getUserStakes(userAddress)`: Retorna todos os stakes ativos de um utilizador.
- `getUnclaimedRewards(userAddress)`: Retorna as recompensas de staking não reclamadas.
- `getLiquidityBalance(userAddress)`: Retorna o saldo de tokens LP de um utilizador.
- `getUserMiners(userAddress)`: Retorna todos os mineradores ativos de um utilizador.
- `getMinedRewards(userAddress)`: Retorna as recompensas de mineração não reclamadas.
- `getReferralNetwork(userAddress)`: Retorna informações sobre a rede de referidos de um utilizador.
- `getLotteryStatus()`: Retorna os detalhes do sorteio atual da lotaria.
- `getUserLotteryTickets(userAddress, drawId)`: Retorna os bilhetes de um utilizador para um sorteio específico.
- E outras funções de consulta necessárias para popular todos os dados da UI.
