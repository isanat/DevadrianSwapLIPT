// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MiningPool
 * @dev Implementa a Sala de Mineração para o LIPT Token.
 */
contract MiningPool is Ownable {
    address public immutable DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    using SafeERC20 for IERC20;

    IERC20 public immutable LIPT;

    // Estruturas de Dados
    struct MiningPlan {
        uint256 cost;     // Custo em LIPT para ativar
        uint256 power;    // Geração de LIPT por segundo
        uint256 duration; // Duração do plano em segundos
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

    // Eventos
    event MinerActivated(address indexed user, uint256 planId, uint256 minerId);
    event MinedRewardsClaimed(address indexed user, uint256 amount);

    constructor(address _lipt) Ownable(msg.sender) {
        LIPT = IERC20(_lipt);
    }

    // --- Funções de Administração (Owner-Only) ---

    function addMiningPlan(uint256 _cost, uint256 _power, uint256 _duration) public onlyOwner {
        plans.push(MiningPlan(_cost, _power, _duration, true));
    }

    function modifyMiningPlan(uint256 planId, uint256 _cost, uint256 _power, uint256 _duration, bool _active) public onlyOwner {
        require(planId < plans.length, "Mining: Invalid planId");
        plans[planId] = MiningPlan(_cost, _power, _duration, _active);
    }

    // --- Funções de Utilizador ---

    function activateMiner(uint256 planId) public {
        MiningPlan storage plan = plans[planId];
        require(plan.active, "Mining: Plan not active");
        require(plan.cost > 0, "Mining: Cost must be greater than zero");

        // 1. Transferir o custo em LIPT para o Pool (e queimar)
        SafeERC20.safeTransferFrom(LIPT, msg.sender, address(this), plan.cost);
        
        // Em um sistema real, o custo seria queimado ou enviado para o tesouro.
        // Aqui, vamos queimar o custo para maximizar a deflação (conforme Tokenomics).
        SafeERC20.safeTransfer(LIPT, DEAD_ADDRESS, plan.cost);

        // 2. Ativar o minerador
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
        Miner storage miner = userMiners[msg.sender][minerId];
        MiningPlan storage plan = plans[miner.planId];

        uint256 timeElapsed = block.timestamp - miner.startDate;
        
        // O minerador só gera recompensas durante a duração do plano
        uint256 effectiveTime = timeElapsed > plan.duration ? plan.duration : timeElapsed;

        // Recompensas = power * effectiveTime
        rewards = plan.power * effectiveTime;

        // Subtrair recompensas já reclamadas
        rewards = rewards - miner.rewardsClaimed;
    }

    function claimMinedRewards(uint256 minerId) public {
        uint256 rewards = calculateMinedRewards(minerId);
        require(rewards > 0, "Mining: No rewards to claim");

        // 1. Atualizar o registro de recompensas reclamadas
        userMiners[msg.sender][minerId].rewardsClaimed += rewards;

        // 2. Transferir recompensas (assumindo que o Pool tem LIPT para pagar)
        // Em um sistema real, o Pool precisaria de um mecanismo de minting ou de fundos.
        LIPT.safeTransfer(msg.sender, rewards);

        emit MinedRewardsClaimed(msg.sender, rewards);
    }
}
