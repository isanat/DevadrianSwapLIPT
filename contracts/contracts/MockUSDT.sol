// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock Tether USD", "USDT") {
        _mint(msg.sender, initialSupply);
    }

    // Função para cunhar mais tokens para testes
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
