// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./GameBase.sol";

/**
 * @title Lottery
 * @dev Implementa a Lotaria Diária.
 */
contract Lottery is GameBase {
    // Estruturas de Dados
    struct Draw {
        uint256 drawId;
        uint256 ticketPrice;
        uint256 totalTickets;
        address winner;
        bool drawn;
    }

    Draw public currentDraw;
    mapping(address => uint256) public ticketsBought;
    address[] public participants;
    uint256 public ticketPrice = 100 * 10**18; // 100 LIPT (exemplo)
    uint256 public drawCounter = 0;

    // Eventos
    event NewLotteryDraw(uint256 drawId, uint256 ticketPrice);
    event TicketsPurchased(address indexed user, uint256 quantity);
    event LotteryWinnerDrawn(uint256 drawId, address indexed winner);
    event LotteryPrizeClaimed(uint256 drawId, address indexed winner, uint256 amount);

    constructor(address _lipt) GameBase(_lipt) {
        _startNewDraw();
    }

    // --- Funções de Administração (Owner-Only) ---

    function setLotteryTicketPrice(uint256 price) public onlyOwner {
        ticketPrice = price;
    }

    function _startNewDraw() internal {
        drawCounter++;
        currentDraw = Draw({
            drawId: drawCounter,
            ticketPrice: ticketPrice,
            totalTickets: 0,
            winner: address(0),
            drawn: false
        });
        // delete ticketsBought; (Não é possível deletar um mapping inteiro)
        // delete participants; (Não é possível deletar um array inteiro)
        emit NewLotteryDraw(drawCounter, ticketPrice);
    }

    // Função para o admin forçar o sorteio (simulação de VRF)
    function forceDrawWinner(uint256 simulatedRandomness) public onlyOwner {
        require(!currentDraw.drawn, "Lottery: Draw already finished");
        require(currentDraw.totalTickets > 0, "Lottery: No tickets sold");

        // 1. Determinar o bilhete vencedor
        uint256 winningTicket = simulatedRandomness % currentDraw.totalTickets;

        // 2. Encontrar o vencedor
        uint256 cumulativeTickets = 0;
        address winnerAddress = address(0);

        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            cumulativeTickets += ticketsBought[participant];
            if (winningTicket < cumulativeTickets) {
                winnerAddress = participant;
                break;
            }
        }

        currentDraw.winner = winnerAddress;
        currentDraw.drawn = true;

        emit LotteryWinnerDrawn(currentDraw.drawId, winnerAddress);
        
        // Iniciar o próximo sorteio
        _startNewDraw();
    }

    // --- Funções de Utilizador ---

    function buyTickets(uint256 ticketQuantity) public {
        require(!currentDraw.drawn, "Lottery: Draw already finished");
        require(ticketQuantity > 0, "Lottery: Must buy at least one ticket");

        uint256 totalCost = ticketQuantity * currentDraw.ticketPrice;

        // 1. Transferir o custo em LIPT para o Pool (e queimar)
        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), totalCost);
        
        // Queimar 5% do custo como taxa de jogo (exemplo)
        uint256 gameFee = (totalCost * 500) / 10000; // 5%
        SafeERC20.safeTransfer(LIPT, DEAD_ADDRESS, gameFee);

        // 2. Registrar a compra
        if (ticketsBought[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        ticketsBought[msg.sender] += ticketQuantity;
        currentDraw.totalTickets += ticketQuantity;

        emit TicketsPurchased(msg.sender, ticketQuantity);
    }

    function claimLotteryPrize(uint256 drawId) public {
        require(drawId < currentDraw.drawId, "Lottery: Invalid draw ID");
        // Lógica de reclamação de prêmio complexa (não implementada aqui)
        // O prêmio seria o valor total arrecadado menos a taxa da casa.
        // Simplificação: Pagar um prêmio fixo de 1000 LIPT
        
        uint256 prizeAmount = 1000 * 10**18;
        _payWinnings(msg.sender, prizeAmount);
        
        emit LotteryPrizeClaimed(drawId, msg.sender, prizeAmount);
    }
}
