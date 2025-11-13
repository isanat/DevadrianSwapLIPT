// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ReferralProgram
 * @dev Implementa o Programa de Referidos Unilevel.
 */
contract ReferralProgram is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;

    // Mapeamento de usuário para seu referente
    mapping(address => address) public referrerOf;
    // Mapeamento de usuário para as recompensas acumuladas
    mapping(address => uint256) public accumulatedRewards;
    // Taxas de comissão por nível (em pontos base, ex: 500 = 5%)
    uint256[] public commissionRates;

    // Eventos
    event Registered(address indexed user, address indexed referrer);
    event ReferralRewardsClaimed(address indexed user, uint256 amount);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Funções de Administração (Owner-Only) ---

    function setReferralCommissionRates(uint256[] memory _rates) public onlyOwner {
        commissionRates = _rates;
    }

    // --- Funções de Utilizador ---

    function register(address referrerAddress) public {
        require(referrerAddress != address(0), "Referral: Invalid referrer");
        require(referrerAddress != msg.sender, "Referral: Cannot refer self");
        require(referrerOf[msg.sender] == address(0), "Referral: Already registered");

        referrerOf[msg.sender] = referrerAddress;
        emit Registered(msg.sender, referrerAddress);
    }

    // Função chamada por outros contratos (ex: Staking, Jogos) para distribuir comissões
    function distributeCommission(address referredUser, uint256 amount) public onlyOwner {
        address currentReferrer = referrerOf[referredUser];
        uint256 level = 0;

        while (currentReferrer != address(0) && level < commissionRates.length) {
            uint256 rate = commissionRates[level];
            uint256 commission = (amount * rate) / 10000;

            accumulatedRewards[currentReferrer] += commission;

            currentReferrer = referrerOf[currentReferrer];
            level++;
        }
    }

    function claimReferralRewards() public {
        uint256 rewards = accumulatedRewards[msg.sender];
        require(rewards > 0, "Referral: No rewards to claim");

        // Zera as recompensas acumuladas
        accumulatedRewards[msg.sender] = 0;

        // Transfere as recompensas (assumindo que o contrato tem LIPT)
        LIPT.safeTransfer(msg.sender, rewards);

        emit ReferralRewardsClaimed(msg.sender, rewards);
    }
}
