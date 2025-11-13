// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DevAdrianSwapPool
 * @dev Implementa a Pool de Liquidez (AMM) e a lógica de Buyback.
 *      Simplificado para um par LIPT/USDT.
 */
contract DevAdrianSwapPool is Ownable {
    address private constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    using SafeERC20 for IERC20;

    // Endereços dos tokens
    IERC20 public immutable LIPT;
    IERC20 public immutable USDT;

    // Taxa de swap (em pontos base, 30 = 0.3%)
    uint256 public swapFeeBasisPoints = 30;

    // Eventos
    event TokensSwapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, uint256 liptAmount, uint256 usdtAmount);
    event LiquidityRemoved(address indexed user, uint256 liptAmount, uint256 usdtAmount);
    event BuybackExecuted(uint256 usdtSpent, uint256 liptBurned);

    constructor(address _lipt, address _usdt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
        USDT = IERC20(_usdt);
    }

    // --- Funções de Administração (Owner-Only) ---

    function setSwapFee(uint256 _swapFeeBasisPoints) public onlyOwner {
        require(_swapFeeBasisPoints <= 100, "SwapPool: Fee too high"); // Max 1%
        swapFeeBasisPoints = _swapFeeBasisPoints;
    }

    // Função para o Owner executar o Buyback e Queima
    // O contrato deve ter USDT aprovado para gastar
    function executeBuybackAndBurn(uint256 usdtAmount) public onlyOwner {
        require(usdtAmount > 0, "Buyback: Zero amount");
        
        // 1. Transferir USDT do Owner para o Pool (simulação de receita)
        // Em um cenário real, o Owner transferiria o USDT da conta de receita.
        // Aqui, assumimos que o Owner já aprovou o gasto.
        USDT.safeTransferFrom(msg.sender, address(this), usdtAmount);

        // 2. Calcular a quantidade de LIPT a ser comprada (swap reverso)
        uint256 liptReserve = LIPT.balanceOf(address(this));
        uint256 usdtReserve = USDT.balanceOf(address(this));
        
        // Simulação de AMM simples: x * y = k
        // (liptReserve - liptOut) * (usdtReserve + usdtIn) = liptReserve * usdtReserve
        // liptOut = liptReserve - (liptReserve * usdtReserve) / (usdtReserve + usdtIn)
        
        // A lógica de swap é complexa e requer um contrato AMM completo (ex: Uniswap V2).
        // Para simplificar, vamos assumir uma taxa de câmbio fixa para o Buyback.
        // Em um projeto real, o Buyback seria um swap real no Pool.
        
        // Para este protótipo, vamos simular que 1 USDT compra 10 LIPT
        uint256 liptToBuy = usdtAmount * 10;

        // 3. Transferir LIPT do Pool para o endereço de Queima (Burn)
        SafeERC20.safeTransfer(LIPT, DEAD_ADDRESS, liptToBuy);

        emit BuybackExecuted(usdtAmount, liptToBuy);
    }

    // --- Funções de Utilizador ---

    // Adicionar Liquidez (simplificado)
    function addLiquidity(uint256 liptAmount, uint256 usdtAmount) public {
        // Transferir tokens para o Pool
        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), liptAmount);
        USDT.safeTransferFrom(msg.sender, address(this), usdtAmount);

        // Em um AMM real, o usuário receberia LP Tokens. Aqui, apenas registramos.
        emit LiquidityAdded(msg.sender, liptAmount, usdtAmount);
    }

    // Swap (simplificado)
    function swap(address tokenIn, uint256 amountIn) public returns (uint256 amountOut) {
        require(tokenIn == address(LIPT) || tokenIn == address(USDT), "SwapPool: Invalid token");

        // 1. Calcular a taxa de swap
        uint256 fee = (amountIn * swapFeeBasisPoints) / 10000;
        uint256 amountAfterFee = amountIn - fee;

        // 2. Transferir tokenIn para o Pool
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // 3. Calcular amountOut (AMM simples: 1 LIPT = 0.1 USDT)
        if (tokenIn == address(LIPT)) {
            // Swap LIPT -> USDT
            amountOut = amountAfterFee / 10;
            USDT.safeTransfer(msg.sender, amountOut);
        } else {
            // Swap USDT -> LIPT
            amountOut = amountAfterFee * 10;
            LIPT.safeTransfer(msg.sender, amountOut);
        }

        emit TokensSwapped(msg.sender, tokenIn, address(LIPT) == tokenIn ? address(USDT) : address(LIPT), amountIn, amountOut);
    }
}
