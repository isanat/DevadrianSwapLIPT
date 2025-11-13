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
    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;

    // Estruturas de Dados
    struct StakingPlan {
        uint256 duration; // em segundos
        uint256 apy;      // em pontos base (ex: 1250 = 12.5%)
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

    // Eventos
    event Staked(address indexed user, uint256 amount, uint256 planId, uint256 stakeId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Funções de Administração (Owner-Only) ---

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

    // --- Funções de Utilizador ---

    function stake(uint256 amount, uint256 planId) public {
        require(plans[planId].active, "Staking: Plan not active");
        require(amount > 0, "Staking: Zero amount");

        // Transferir LIPT para o Pool
        LIPT.safeTransferFrom(msg.sender, address(this), amount);

        // Criar o stake
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
        Stake storage stake = userStakes[msg.sender][stakeId];
        StakingPlan storage plan = plans[stake.planId];

        uint256 timeElapsed = block.timestamp - stake.startDate;
        uint256 totalDuration = plan.duration;

        // Recompensas são calculadas com base no tempo decorrido
        // Formula: amount * apy * timeElapsed / (365 dias * 10000)
        // Simplificado para: amount * apy * timeElapsed / (totalDuration * 10000)
        
        uint256 rewardsPerSecond = (stake.amount * plan.apy) / (10000 * totalDuration);
        rewards = rewardsPerSecond * timeElapsed;

        // Subtrair recompensas já reclamadas
        rewards = rewards - stake.rewardsClaimed;
    }

    function claimRewards(uint256 stakeId) public {
        uint256 rewards = calculateRewards(stakeId);
        require(rewards > 0, "Staking: No rewards to claim");

        // Atualizar o registro de recompensas reclamadas
        userStakes[msg.sender][stakeId].rewardsClaimed += rewards;

        // Transferir recompensas (assumindo que o Pool tem LIPT para pagar)
        // Em um sistema real, o Pool precisaria de um mecanismo de minting ou de fundos.
        LIPT.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    function unstake(uint256 stakeId) public {
        Stake storage stake = userStakes[msg.sender][stakeId];
        StakingPlan storage plan = plans[stake.planId];

        uint256 capital = stake.amount;
        uint256 penalty = 0;

        // Verificar se houve retirada antecipada
        if (block.timestamp < stake.startDate + plan.duration) {
            penalty = (capital * earlyUnstakePenaltyBasisPoints) / 10000;
            capital = capital - penalty;
        }

        // Transferir capital de volta ao usuário
        LIPT.safeTransfer(msg.sender, capital);

        // Queimar a penalidade (conforme Tokenomics)
        LIPT.safeTransfer(DEAD_ADDRESS, penalty);

        // Remover o stake (simplificado: apenas zerar o valor)
        stake.amount = 0;
        stake.startDate = 0;

        emit Unstaked(msg.sender, capital, penalty);
    }
}
