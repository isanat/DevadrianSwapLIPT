// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StakingPool
 * @dev Implementa a Pool de Staking para o LIPT Token.
 */
contract StakingPool is Ownable {
    using SafeERC20 for IERC20;

    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    IERC20 public immutable LIPT;

    struct StakingPlan {
        uint256 duration; // em segundos
        uint256 apy; // em pontos base (ex: 1250 = 12.5%)
        bool active;
    }

    struct Stake {
        address user;
        uint256 amount;
        uint256 startDate;
        uint256 planId;
        uint256 rewardsClaimed;
    }

    StakingPlan[] public plans;
    mapping(address => Stake[]) public userStakes;
    uint256 public earlyUnstakePenaltyBasisPoints = 1000; // 10%

    event Staked(address indexed user, uint256 amount, uint256 planId, uint256 stakeId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Admin ---

    function addStakingPlan(uint256 _duration, uint256 _apy) public onlyOwner {
        plans.push(StakingPlan(_duration, _apy, true));
    }

    function modifyStakingPlan(uint256 planId, uint256 _duration, uint256 _apy, bool _active) public onlyOwner {
        require(planId < plans.length, "Staking: Invalid planId");
        plans[planId] = StakingPlan(_duration, _apy, _active);
    }

    function setEarlyUnstakePenalty(uint256 penaltyBasisPoints) public onlyOwner {
        earlyUnstakePenaltyBasisPoints = penaltyBasisPoints;
    }

    // --- Usuário ---

    function stake(uint256 amount, uint256 planId) public {
        require(planId < plans.length, "Staking: Invalid plan");
        require(plans[planId].active, "Staking: Plan not active");
        require(amount > 0, "Staking: Zero amount");

        LIPT.safeTransferFrom(msg.sender, address(this), amount);

        userStakes[msg.sender].push(
            Stake({
                user: msg.sender,
                amount: amount,
                startDate: block.timestamp,
                planId: planId,
                rewardsClaimed: 0
            })
        );

        emit Staked(msg.sender, amount, planId, userStakes[msg.sender].length - 1);
    }

    function calculateRewards(uint256 stakeId) public view returns (uint256 rewards) {
        rewards = _calculateRewards(msg.sender, stakeId);
    }

    function claimRewards(uint256 stakeId) public {
        uint256 rewards = _calculateRewards(msg.sender, stakeId);
        require(rewards > 0, "Staking: No rewards to claim");

        userStakes[msg.sender][stakeId].rewardsClaimed += rewards;
        LIPT.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    function unstake(uint256 stakeId) public {
        Stake storage stakeData = userStakes[msg.sender][stakeId];
        StakingPlan storage plan = plans[stakeData.planId];

        uint256 capital = stakeData.amount;
        uint256 penalty = 0;

        if (block.timestamp < stakeData.startDate + plan.duration) {
            penalty = (capital * earlyUnstakePenaltyBasisPoints) / 10000;
            capital = capital - penalty;
        }

        LIPT.safeTransfer(msg.sender, capital);
        LIPT.safeTransfer(DEAD_ADDRESS, penalty);

        stakeData.amount = 0;
        stakeData.startDate = 0;

        emit Unstaked(msg.sender, capital, penalty);
    }

    // --- Views para integra��o ---

    function getStakingPlans() external view returns (StakingPlan[] memory) {
        return plans;
    }

    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    function getUnclaimedRewards(address user) external view returns (uint256[] memory rewards) {
        uint256 len = userStakes[user].length;
        rewards = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            rewards[i] = _calculateRewards(user, i);
        }
    }

    // --- Interno ---

    function _calculateRewards(address user, uint256 stakeId) internal view returns (uint256 rewards) {
        Stake storage stakeData = userStakes[user][stakeId];
        StakingPlan storage plan = plans[stakeData.planId];

        uint256 timeElapsed = block.timestamp - stakeData.startDate;
        uint256 totalDuration = plan.duration;

        uint256 rewardsPerSecond = (stakeData.amount * plan.apy) / (10000 * totalDuration);
        rewards = rewardsPerSecond * timeElapsed;
        rewards = rewards - stakeData.rewardsClaimed;
    }
}
