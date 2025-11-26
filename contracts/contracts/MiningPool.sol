// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MiningPool
 * @dev Implementa a sala de minera��o para o LIPT Token.
 */
contract MiningPool is Ownable {
    using SafeERC20 for IERC20;

    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    IERC20 public immutable LIPT;

    struct MiningPlan {
        uint256 cost; // Custo em LIPT para ativar
        uint256 power; // Gera��o de LIPT por segundo
        uint256 duration; // Dura��o do plano em segundos
        bool active;
    }

    struct Miner {
        address user;
        uint256 startDate;
        uint256 planId;
        uint256 rewardsClaimed;
    }

    MiningPlan[] public plans;
    mapping(address => Miner[]) public userMiners;

    event MinerActivated(address indexed user, uint256 planId, uint256 minerId);
    event MinedRewardsClaimed(address indexed user, uint256 amount);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Admin ---

    function addMiningPlan(uint256 _cost, uint256 _power, uint256 _duration) public onlyOwner {
        plans.push(MiningPlan(_cost, _power, _duration, true));
    }

    function modifyMiningPlan(uint256 planId, uint256 _cost, uint256 _power, uint256 _duration, bool _active) public onlyOwner {
        require(planId < plans.length, "Mining: Invalid planId");
        plans[planId] = MiningPlan(_cost, _power, _duration, _active);
    }

    // --- Usuário ---

    function activateMiner(uint256 planId) public {
        require(planId < plans.length, "Mining: Invalid plan");
        MiningPlan storage plan = plans[planId];
        require(plan.active, "Mining: Plan not active");
        require(plan.cost > 0, "Mining: Cost must be greater than zero");

        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), plan.cost);
        SafeERC20.safeTransfer(LIPT, DEAD_ADDRESS, plan.cost);

        userMiners[msg.sender].push(
            Miner({
                user: msg.sender,
                startDate: block.timestamp,
                planId: planId,
                rewardsClaimed: 0
            })
        );

        emit MinerActivated(msg.sender, planId, userMiners[msg.sender].length - 1);
    }

    function calculateMinedRewards(uint256 minerId) public view returns (uint256 rewards) {
        rewards = _calculateRewards(msg.sender, minerId);
    }

    function claimMinedRewards(uint256 minerId) public {
        uint256 rewards = _calculateRewards(msg.sender, minerId);
        require(rewards > 0, "Mining: No rewards to claim");

        userMiners[msg.sender][minerId].rewardsClaimed += rewards;
        LIPT.safeTransfer(msg.sender, rewards);

        emit MinedRewardsClaimed(msg.sender, rewards);
    }

    // --- Views para integra��o ---

    function getMiningPlans() external view returns (MiningPlan[] memory) {
        return plans;
    }

    function getUserMiners(address user) external view returns (Miner[] memory) {
        return userMiners[user];
    }

    // --- Interno ---

    function _calculateRewards(address user, uint256 minerId) internal view returns (uint256 rewards) {
        Miner storage miner = userMiners[user][minerId];
        MiningPlan storage plan = plans[miner.planId];

        uint256 timeElapsed = block.timestamp - miner.startDate;
        uint256 effectiveTime = timeElapsed > plan.duration ? plan.duration : timeElapsed;

        rewards = plan.power * effectiveTime;
        rewards = rewards - miner.rewardsClaimed;
    }
}
