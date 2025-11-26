// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ReferralProgram
 * @dev Programa de referidos unilevel com leitura amigável para o frontend.
 */
contract ReferralProgram is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;

    mapping(address => address) public referrerOf;
    mapping(address => uint256) public accumulatedRewards;
    mapping(address => uint256) public referralCount;
    uint256[] public commissionRates; // em basis points

    event Registered(address indexed user, address indexed referrer);
    event ReferralRewardsClaimed(address indexed user, uint256 amount);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Admin ---

    function setReferralCommissionRates(uint256[] memory _rates) public onlyOwner {
        commissionRates = _rates;
    }

    // --- Usuário ---

    function register(address referrerAddress) public {
        require(referrerAddress != address(0), "Referral: Invalid referrer");
        require(referrerAddress != msg.sender, "Referral: Cannot refer self");
        require(referrerOf[msg.sender] == address(0), "Referral: Already registered");

        referrerOf[msg.sender] = referrerAddress;
        referralCount[referrerAddress] += 1;
        emit Registered(msg.sender, referrerAddress);
    }

    // Chamado por contratos autorizados para distribuir comiss��es
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

        accumulatedRewards[msg.sender] = 0;
        LIPT.safeTransfer(msg.sender, rewards);

        emit ReferralRewardsClaimed(msg.sender, rewards);
    }

    // --- Views para integra��o ---

    function getCommissionRates() external view returns (uint256[] memory) {
        return commissionRates;
    }

    function getReferrer(address user) external view returns (address) {
        return referrerOf[user];
    }

    function getTotalCommissions(address user) external view returns (uint256) {
        return accumulatedRewards[user];
    }

    function getReferralCount(address user) external view returns (uint256) {
        return referralCount[user];
    }
}
