// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DevAdrianSwapPool
 * @dev AMM simples LIPT/USDT com emissão de LP token e leituras compatíveis com o frontend.
 */
contract DevAdrianSwapPool is ERC20, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;
    IERC20 public immutable USDT;

    uint256 public swapFeeBasisPoints = 30; // 0.3%

    uint256 private reserveLipt;
    uint256 private reserveUsdt;

    event TokensSwapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, uint256 liptAmount, uint256 usdtAmount, uint256 lpMinted);
    event LiquidityRemoved(address indexed user, uint256 liptAmount, uint256 usdtAmount, uint256 lpBurned);
    event BuybackExecuted(uint256 usdtSpent, uint256 liptBurned);

    constructor(address _lipt, address _usdt) ERC20("DevAdrian LP", "dLP") Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
        USDT = IERC20(_usdt);
    }

    // --- Admin ---

    function setSwapFee(uint256 _swapFeeBasisPoints) public onlyOwner {
        require(_swapFeeBasisPoints <= 100, "SwapPool: Fee too high"); // Max 1%
        swapFeeBasisPoints = _swapFeeBasisPoints;
    }

    // Owner executa buyback e queima (simplificado)
    function executeBuybackAndBurn(uint256 usdtAmount) public onlyOwner {
        require(usdtAmount > 0, "Buyback: Zero amount");

        USDT.safeTransferFrom(msg.sender, address(this), usdtAmount);

        // Simples: 1 USDT compra 10 LIPT (placeholder)
        uint256 liptToBuy = usdtAmount * 10;
        LIPT.safeTransfer(address(0x000000000000000000000000000000000000dEaD), liptToBuy);

        _syncReserves();
        emit BuybackExecuted(usdtAmount, liptToBuy);
    }

    // --- Liquidez ---

    function addLiquidity(uint256 liptAmount, uint256 usdtAmount) public returns (uint256 lpMinted) {
        require(liptAmount > 0 && usdtAmount > 0, "Liquidity: zero amount");

        (uint256 _reserveLipt, uint256 _reserveUsdt) = (reserveLipt, reserveUsdt);
        uint256 _totalSupply = totalSupply();

        LIPT.safeTransferFrom(msg.sender, address(this), liptAmount);
        USDT.safeTransferFrom(msg.sender, address(this), usdtAmount);

        if (_totalSupply == 0) {
            lpMinted = _sqrt(liptAmount * usdtAmount);
        } else {
            lpMinted = _min(
                (liptAmount * _totalSupply) / _reserveLipt,
                (usdtAmount * _totalSupply) / _reserveUsdt
            );
        }

        require(lpMinted > 0, "Liquidity: insufficient mint");
        _mint(msg.sender, lpMinted);

        _syncReserves();
        emit LiquidityAdded(msg.sender, liptAmount, usdtAmount, lpMinted);
    }

    function removeLiquidity(uint256 lpAmount) public returns (uint256 liptAmount, uint256 usdtAmount) {
        require(lpAmount > 0, "Liquidity: zero amount");

        (uint256 _reserveLipt, uint256 _reserveUsdt) = (reserveLipt, reserveUsdt);
        uint256 _totalSupply = totalSupply();

        liptAmount = (lpAmount * _reserveLipt) / _totalSupply;
        usdtAmount = (lpAmount * _reserveUsdt) / _totalSupply;

        require(liptAmount > 0 && usdtAmount > 0, "Liquidity: insufficient amount");

        _burn(msg.sender, lpAmount);
        LIPT.safeTransfer(msg.sender, liptAmount);
        USDT.safeTransfer(msg.sender, usdtAmount);

        _syncReserves();
        emit LiquidityRemoved(msg.sender, liptAmount, usdtAmount, lpAmount);
    }

    // --- Swap ---

    function swap(address tokenIn, uint256 amountIn) public returns (uint256 amountOut) {
        require(tokenIn == address(LIPT) || tokenIn == address(USDT), "SwapPool: Invalid token");
        require(amountIn > 0, "SwapPool: zero amount");

        bool isLiptIn = tokenIn == address(LIPT);
        (uint256 reserveIn, uint256 reserveOut) = isLiptIn ? (reserveLipt, reserveUsdt) : (reserveUsdt, reserveLipt);

        uint256 fee = (amountIn * swapFeeBasisPoints) / 10000;
        uint256 amountInAfterFee = amountIn - fee;

        // x*y=k
        amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
        require(amountOut > 0, "SwapPool: insufficient output");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(isLiptIn ? address(USDT) : address(LIPT)).safeTransfer(msg.sender, amountOut);

        _syncReserves();
        emit TokensSwapped(msg.sender, tokenIn, isLiptIn ? address(USDT) : address(LIPT), amountIn, amountOut);
    }

    // --- Views ---

    function getReserves() external view returns (uint256, uint256) {
        return (reserveLipt, reserveUsdt);
    }

    // --- Interno ---

    function _syncReserves() internal {
        reserveLipt = LIPT.balanceOf(address(this));
        reserveUsdt = USDT.balanceOf(address(this));
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
