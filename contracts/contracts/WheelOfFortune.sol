// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./GameBase.sol";

/**
 * @title WheelOfFortune
 * @dev Implementa a Roda da Fortuna.
 */
contract WheelOfFortune is GameBase {
    // Estruturas de Dados
    struct Segment {
        uint256 multiplier; // Multiplicador de prêmio (ex: 200 = 2x)
        uint256 weight;     // Peso para a probabilidade de ser sorteado
    }

    Segment[] public segments;
    uint256 public totalWeight;
    uint256 public houseEdgeBasisPoints = 500; // 5%

    // Mapeamento para armazenar o ID do pedido VRF e o endereço do apostador
    mapping(uint256 => address) public vrfRequests;

    // Eventos
    event WheelSpun(address indexed user, uint256 betAmount, uint256 multiplier, uint256 winnings);

    constructor(address _lipt) GameBase(_lipt) {}

    // --- Funções de Administração (Owner-Only) ---

    function setWheelSegments(uint256[] memory multipliers, uint256[] memory weights) public onlyOwner {
        require(multipliers.length == weights.length, "Wheel: Array length mismatch");
        
        delete segments;
        totalWeight = 0;

        for (uint256 i = 0; i < multipliers.length; i++) {
            segments.push(Segment(multipliers[i], weights[i]));
            totalWeight += weights[i];
        }
    }

    function setHouseEdge(uint256 edgeBasisPoints) public onlyOwner {
        houseEdgeBasisPoints = edgeBasisPoints;
    }

    // --- Funções de Utilizador ---

    function spinWheel(uint256 betAmount) public {
        // 1. Processar a aposta e coletar a taxa da casa
        uint256 amountToPool = _processBet(betAmount, houseEdgeBasisPoints);

        // 2. Solicitar aleatoriedade (Simulação)
        // Em um sistema real, aqui seria a chamada para o Chainlink VRF
        uint256 requestId = block.timestamp; // Simulação de Request ID
        vrfRequests[requestId] = msg.sender;

        // 3. Simular o resultado imediato para o protótipo
        _fulfillRandomness(requestId, 123456789); // Simulação de resultado
    }

    // --- Funções de VRF (Simuladas) ---

    // Esta função simula a chamada do Chainlink VRF após a geração do número aleatório
    function _fulfillRandomness(uint256 requestId, uint256 randomness) internal {
        address user = vrfRequests[requestId];
        require(user != address(0), "Wheel: Invalid request ID");
        
        // 1. Determinar o segmento vencedor
        uint256 winningIndex = _getWinningSegmentIndex(randomness);
        Segment storage winningSegment = segments[winningIndex];

        // 2. Calcular os ganhos
        uint256 betAmount = LIPT.balanceOf(address(this)); // Simplificação: usar o saldo atual
        uint256 winnings = (betAmount * winningSegment.multiplier) / 100;

        // 3. Pagar os ganhos
        _payWinnings(user, winnings);

        emit WheelSpun(user, betAmount, winningSegment.multiplier, winnings);
        delete vrfRequests[requestId];
    }

    function _getWinningSegmentIndex(uint256 randomness) internal view returns (uint256) {
        uint256 randomNumber = randomness % totalWeight;
        uint256 cumulativeWeight = 0;

        for (uint256 i = 0; i < segments.length; i++) {
            cumulativeWeight += segments[i].weight;
            if (randomNumber < cumulativeWeight) {
                return i;
            }
        }
        // Deve ser inalcançável se totalWeight for calculado corretamente
        return 0;
    }
}
