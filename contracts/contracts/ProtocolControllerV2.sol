// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Interfaces para os contratos filhos
interface IStakingPool {
    function transferOwnership(address newOwner) external;
    function addStakingPlan(uint256 _duration, uint256 _apy) external;
    function modifyStakingPlan(uint256 planId, uint256 _duration, uint256 _apy, bool _active) external;
}

interface IMiningPool {
    function transferOwnership(address newOwner) external;
    function addMiningPlan(uint256 _cost, uint256 _power, uint256 _duration) external;
    function modifyMiningPlan(uint256 planId, uint256 _cost, uint256 _power, uint256 _duration, bool _active) external;
}

interface IWheelOfFortune {
    function transferOwnership(address newOwner) external;
    function setWheelSegments(uint256[] calldata multipliers, uint256[] calldata probabilities) external;
}

interface IRocketGame {
    function transferOwnership(address newOwner) external;
}

interface ILottery {
    function transferOwnership(address newOwner) external;
}

interface IReferralProgram {
    function transferOwnership(address newOwner) external;
}

interface ILIPTToken {
    function transferOwnership(address newOwner) external;
}

interface ISwapPool {
    function transferOwnership(address newOwner) external;
}

/**
 * @title ProtocolControllerV2
 * @dev Versão melhorada do ProtocolController com funções proxy para gerenciar contratos filhos
 */
contract ProtocolControllerV2 is Ownable, Pausable {
    // Endereços dos contratos do protocolo
    address public liptToken;
    address public swapPool;
    address public stakingPool;
    address public miningPool;
    address public referralProgram;
    address public wheelOfFortune;
    address public rocketGame;
    address public lottery;

    constructor() Ownable(msg.sender) {}

    // --- Funções para configurar os endereços dos contratos ---
    
    function setLiptToken(address _liptToken) public onlyOwner {
        liptToken = _liptToken;
    }

    function setSwapPool(address _swapPool) public onlyOwner {
        swapPool = _swapPool;
    }

    function setStakingPool(address _stakingPool) public onlyOwner {
        stakingPool = _stakingPool;
    }

    function setMiningPool(address _miningPool) public onlyOwner {
        miningPool = _miningPool;
    }

    function setReferralProgram(address _referralProgram) public onlyOwner {
        referralProgram = _referralProgram;
    }

    function setWheelOfFortune(address _wheelOfFortune) public onlyOwner {
        wheelOfFortune = _wheelOfFortune;
    }

    function setRocketGame(address _rocketGame) public onlyOwner {
        rocketGame = _rocketGame;
    }

    function setLottery(address _lottery) public onlyOwner {
        lottery = _lottery;
    }

    // --- Funções de Pausa/Despausa ---
    
    function pauseProtocol() public onlyOwner {
        _pause();
    }

    function unpauseProtocol() public onlyOwner {
        _unpause();
    }

    // --- FUNÇÕES PROXY PARA TRANSFERIR OWNERSHIP DOS CONTRATOS FILHOS ---
    
    function transferStakingPoolOwnership(address newOwner) public onlyOwner {
        require(stakingPool != address(0), "StakingPool not set");
        IStakingPool(stakingPool).transferOwnership(newOwner);
    }

    function transferMiningPoolOwnership(address newOwner) public onlyOwner {
        require(miningPool != address(0), "MiningPool not set");
        IMiningPool(miningPool).transferOwnership(newOwner);
    }

    function transferLIPTTokenOwnership(address newOwner) public onlyOwner {
        require(liptToken != address(0), "LIPTToken not set");
        ILIPTToken(liptToken).transferOwnership(newOwner);
    }

    function transferSwapPoolOwnership(address newOwner) public onlyOwner {
        require(swapPool != address(0), "SwapPool not set");
        ISwapPool(swapPool).transferOwnership(newOwner);
    }

    function transferWheelOfFortuneOwnership(address newOwner) public onlyOwner {
        require(wheelOfFortune != address(0), "WheelOfFortune not set");
        IWheelOfFortune(wheelOfFortune).transferOwnership(newOwner);
    }

    function transferRocketGameOwnership(address newOwner) public onlyOwner {
        require(rocketGame != address(0), "RocketGame not set");
        IRocketGame(rocketGame).transferOwnership(newOwner);
    }

    function transferLotteryOwnership(address newOwner) public onlyOwner {
        require(lottery != address(0), "Lottery not set");
        ILottery(lottery).transferOwnership(newOwner);
    }

    function transferReferralProgramOwnership(address newOwner) public onlyOwner {
        require(referralProgram != address(0), "ReferralProgram not set");
        IReferralProgram(referralProgram).transferOwnership(newOwner);
    }

    // Função para transferir ownership de todos os contratos de uma vez
    function transferAllChildContractsOwnership(address newOwner) public onlyOwner {
        if (stakingPool != address(0)) {
            try IStakingPool(stakingPool).transferOwnership(newOwner) {} catch {}
        }
        if (miningPool != address(0)) {
            try IMiningPool(miningPool).transferOwnership(newOwner) {} catch {}
        }
        if (liptToken != address(0)) {
            try ILIPTToken(liptToken).transferOwnership(newOwner) {} catch {}
        }
        if (swapPool != address(0)) {
            try ISwapPool(swapPool).transferOwnership(newOwner) {} catch {}
        }
        if (wheelOfFortune != address(0)) {
            try IWheelOfFortune(wheelOfFortune).transferOwnership(newOwner) {} catch {}
        }
        if (rocketGame != address(0)) {
            try IRocketGame(rocketGame).transferOwnership(newOwner) {} catch {}
        }
        if (lottery != address(0)) {
            try ILottery(lottery).transferOwnership(newOwner) {} catch {}
        }
        if (referralProgram != address(0)) {
            try IReferralProgram(referralProgram).transferOwnership(newOwner) {} catch {}
        }
    }

    // --- FUNÇÕES PROXY PARA GERENCIAR CONTRATOS FILHOS ---
    
    // Staking Pool
    function addStakingPlan(uint256 _duration, uint256 _apy) public onlyOwner {
        require(stakingPool != address(0), "StakingPool not set");
        IStakingPool(stakingPool).addStakingPlan(_duration, _apy);
    }

    function modifyStakingPlan(uint256 planId, uint256 _duration, uint256 _apy, bool _active) public onlyOwner {
        require(stakingPool != address(0), "StakingPool not set");
        IStakingPool(stakingPool).modifyStakingPlan(planId, _duration, _apy, _active);
    }

    // Mining Pool
    function addMiningPlan(uint256 _cost, uint256 _power, uint256 _duration) public onlyOwner {
        require(miningPool != address(0), "MiningPool not set");
        IMiningPool(miningPool).addMiningPlan(_cost, _power, _duration);
    }

    function modifyMiningPlan(uint256 planId, uint256 _cost, uint256 _power, uint256 _duration, bool _active) public onlyOwner {
        require(miningPool != address(0), "MiningPool not set");
        IMiningPool(miningPool).modifyMiningPlan(planId, _cost, _power, _duration, _active);
    }

    // Wheel of Fortune
    function setWheelSegments(uint256[] calldata multipliers, uint256[] calldata probabilities) public onlyOwner {
        require(wheelOfFortune != address(0), "WheelOfFortune not set");
        IWheelOfFortune(wheelOfFortune).setWheelSegments(multipliers, probabilities);
    }

    // Função de emergência para transferir a propriedade de todos os contratos
    function transferAllOwnership(address newOwner) public onlyOwner {
        transferAllChildContractsOwnership(newOwner);
        transferOwnership(newOwner);
    }
}

