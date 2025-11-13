// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LIPTToken
 * @dev Token ERC20 padrão com cunhagem controlada e capacidade de queima.
 *      A lógica de taxas será implementada em um contrato TaxHandler separado.
 */
contract LIPTToken is ERC20, Ownable, ERC20Burnable {
    
    constructor(uint256 initialSupply) ERC20("LIPT Token", "LIPT") Ownable(msg.sender) {
        // Cunhagem inicial (para distribuição conforme Tokenomics)
        _mint(msg.sender, initialSupply);
    }

    // Função para o Owner cunhar novos tokens (para recompensas)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
