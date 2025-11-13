// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// Importações simuladas do Chainlink VRF (substituir por reais)
// import "@chainlink/contracts/src/v08/VRFConsumerBaseV2.sol";

/**
 * @title GameBase
 * @dev Contrato base para os jogos que gerencia a lógica de aposta e o uso do VRF.
 */
contract GameBase is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;
    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    // Endereço para onde a taxa da casa (house edge) será enviada (Tesouro)
    address public treasuryAddress;

    // Eventos
    event BetPlaced(address indexed user, uint256 amount);
    event WinningsPaid(address indexed user, uint256 amount);
    event HouseEdgeCollected(uint256 amount);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Funções de Administração (Owner-Only) ---

    function setTreasuryAddress(address _treasuryAddress) public onlyOwner {
        require(_treasuryAddress != address(0), "GameBase: Zero address");
        treasuryAddress = _treasuryAddress;
    }

    // Função interna para processar a aposta
    function _processBet(uint256 betAmount, uint256 houseEdgeBasisPoints) internal returns (uint256 amountToPool) {
        require(betAmount > 0, "GameBase: Zero bet");
        
        // 1. Transferir a aposta para o contrato
        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), betAmount);

        // 2. Calcular e coletar a taxa da casa (House Edge)
        uint256 houseEdge = (betAmount * houseEdgeBasisPoints) / 10000;
        amountToPool = betAmount - houseEdge;

        // 3. Enviar a taxa da casa para o Tesouro (ou queimar)
        if (treasuryAddress != address(0)) {
            SafeERC20.safeTransfer(LIPT, treasuryAddress, houseEdge);
        } else {
            // Se não houver tesouro, queimar para maximizar a deflação
            SafeERC20.safeTransfer(LIPT, DEAD_ADDRESS, houseEdge);
        }

        emit BetPlaced(msg.sender, betAmount);
        emit HouseEdgeCollected(houseEdge);
    }

    // Função interna para pagar os ganhos
    function _payWinnings(address user, uint256 winnings) internal {
        require(winnings > 0, "GameBase: Zero winnings");
        SafeERC20.safeTransfer(LIPT, user, winnings);
        emit WinningsPaid(user, winnings);
    }

    // --- Funções de VRF (Simuladas) ---
    // Em um projeto real, esta lógica seria implementada usando a interface do Chainlink VRF.
    // A função requestRandomWords seria chamada para iniciar o jogo.
    // A função fulfillRandomWords seria chamada pelo Chainlink para entregar o resultado.
}
