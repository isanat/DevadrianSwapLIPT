// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TaxHandler
 * @dev Contrato responsável por gerenciar a lógica de taxas (Burn, LP, Reflection)
 *      para o LIPT Token.
 */
contract TaxHandler is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;
    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    // Taxas de transação (em pontos base, 100 = 1%)
    uint256 public burnFee = 100; // 1% para queima
    uint256 public lpFee = 100;   // 1% para liquidez
    uint256 public reflectionFee = 100; // 1% para reflexão (será queimado)
    uint256 public totalFee = burnFee + lpFee + reflectionFee; // 3%

    // Endereço do Pool de Liquidez (para onde a taxa LP será enviada)
    address public liquidityPoolAddress;

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Funções de Administração (Owner-Only) ---

    function setFees(uint256 _burnFee, uint256 _lpFee, uint256 _reflectionFee) public onlyOwner {
        burnFee = _burnFee;
        lpFee = _lpFee;
        reflectionFee = _reflectionFee;
        totalFee = burnFee + lpFee + reflectionFee;
    }

    function setLiquidityPoolAddress(address _liquidityPoolAddress) public onlyOwner {
        require(_liquidityPoolAddress != address(0), "TaxHandler: Zero address");
        liquidityPoolAddress = _liquidityPoolAddress;
    }

    // --- Função de Transferência com Taxa ---

    /**
     * @dev Realiza uma transferência de LIPT aplicando as taxas de Tokenomics.
     *      Requer que o remetente tenha aprovado o TaxHandler para gastar o LIPT.
     */
    function transferWithTax(address from, address to, uint256 amount) public {
        require(amount > 0, "TaxHandler: Zero amount");
        require(to != address(0), "TaxHandler: Zero address");

        // 1. Calcular as taxas
        uint256 tBurn = (amount * burnFee) / 10000;
        uint256 tLP = (amount * lpFee) / 10000;
        uint256 tReflection = (amount * reflectionFee) / 10000;
        uint256 tTotal = tBurn + tLP + tReflection;
        uint256 tTransfer = amount - tTotal;

        // 2. Transferir para o destinatário (após a taxa)
        SafeERC20.safeTransferFrom(LIPT, from, to, tTransfer);

        // 3. Aplicar a taxa de Queima (Burn)
        // Queima total (Burn + Reflection)
        SafeERC20.safeTransferFrom(LIPT, from, DEAD_ADDRESS, tBurn + tReflection);

        // 4. Aplicar a taxa de Liquidez (LP)
        if (liquidityPoolAddress != address(0)) {
            SafeERC20.safeTransferFrom(LIPT, from, liquidityPoolAddress, tLP);
        }
    }
}
