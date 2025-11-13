// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./GameBase.sol";

/**
 * @title RocketGame
 * @dev Implementa o Jogo do Foguete (Crash Game).
 */
contract RocketGame is GameBase {
    // Estruturas de Dados
    struct Bet {
        address user;
        uint256 amount;
        bool cashedOut;
    }

    struct Round {
        uint256 crashPoint; // Ponto de crash (ex: 200 = 2.00x)
        uint256 startTime;
        Bet[] bets;
        bool active;
    }

    Round public currentRound;
    uint256 public houseEdgeBasisPoints = 100; // 1%

    // Eventos
    event RocketRoundStarted(uint256 crashPoint);
    event RocketBetPlaced(address indexed user, uint256 amount);
    event RocketCashedOut(address indexed user, uint256 amount, uint256 multiplier);
    event RocketRoundCrashed(uint256 crashPoint);

    constructor(address _lipt) GameBase(_lipt) {}

    // --- Funções de Administração (Owner-Only) ---

    function setHouseEdge(uint256 edgeBasisPoints) public onlyOwner {
        houseEdgeBasisPoints = edgeBasisPoints;
    }

    // Inicia uma nova rodada (simulação de VRF)
    function startNewRound(uint256 simulatedCrashPoint) public onlyOwner {
        // Em um sistema real, o crashPoint seria determinado por VRF antes do início.
        currentRound.crashPoint = simulatedCrashPoint;
        currentRound.startTime = block.timestamp;
        delete currentRound.bets; // Limpa o array de storage
        currentRound.active = true;
        emit RocketRoundStarted(simulatedCrashPoint);
    }

    // --- Funções de Utilizador ---

    function playRocket(uint256 betAmount) public {
        require(currentRound.active, "Rocket: Round not active");

        // 1. Processar a aposta e coletar a taxa da casa
        // A taxa da casa é aplicada no momento do Cash Out para simplificar a lógica.
        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), betAmount);

        // 2. Registrar a aposta
        currentRound.bets.push(Bet({
            user: msg.sender,
            amount: betAmount,
            cashedOut: false
        }));

        emit RocketBetPlaced(msg.sender, betAmount);
    }

    function cashOutRocket(uint256 betIndex, uint256 multiplier) public {
        require(currentRound.active, "Rocket: Round not active");
        require(betIndex < currentRound.bets.length, "Rocket: Invalid bet index");
        Bet storage bet = currentRound.bets[betIndex];
        require(bet.user == msg.sender, "Rocket: Not your bet");
        require(!bet.cashedOut, "Rocket: Already cashed out");
        require(multiplier < currentRound.crashPoint, "Rocket: Multiplier exceeds crash point");

        // 1. Marcar como cashed out
        bet.cashedOut = true;

        // 2. Calcular ganhos
        uint256 winnings = (bet.amount * multiplier) / 100;
        
        // 3. Aplicar a taxa da casa (House Edge) no lucro
        uint256 profit = winnings - bet.amount;
        uint256 houseEdge = (profit * houseEdgeBasisPoints) / 10000;
        uint256 finalWinnings = winnings - houseEdge;

        // 4. Pagar ganhos
        _payWinnings(msg.sender, finalWinnings);

        emit RocketCashedOut(msg.sender, finalWinnings, multiplier);
    }

    // Função para finalizar a rodada (chamada pelo Owner ou por um Keeper)
    function crashRound() public onlyOwner {
        require(currentRound.active, "Rocket: Round not active");
        currentRound.active = false;
        emit RocketRoundCrashed(currentRound.crashPoint);
    }
}
