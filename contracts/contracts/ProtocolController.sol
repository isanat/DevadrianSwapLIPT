// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProtocolController
 * @dev Contrato de controle central que gerencia a propriedade e o estado de pausa
 *      de todos os outros contratos do protocolo.
 */
contract ProtocolController is Ownable, Pausable {
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

    // --- Funções de Administração (Owner-Only) ---

    // Funções para configurar os endereços dos contratos
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

    // Funções de Pausa/Despausa
    function pauseProtocol() public onlyOwner {
        _pause();
    }

    function unpauseProtocol() public onlyOwner {
        _unpause();
    }

    // --- FUNÇÕES PROXY PARA TRANSFERIR OWNERSHIP DOS CONTRATOS FILHOS ---
    // Usamos interface inline ou casting direto
    
    function transferStakingPoolOwnership(address newOwner) public onlyOwner {
        require(stakingPool != address(0), "StakingPool not set");
        (bool success, ) = stakingPool.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "StakingPool transfer failed");
    }

    function transferMiningPoolOwnership(address newOwner) public onlyOwner {
        require(miningPool != address(0), "MiningPool not set");
        (bool success, ) = miningPool.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "MiningPool transfer failed");
    }

    function transferLIPTTokenOwnership(address newOwner) public onlyOwner {
        require(liptToken != address(0), "LIPTToken not set");
        (bool success, ) = liptToken.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "LIPTToken transfer failed");
    }

    function transferSwapPoolOwnership(address newOwner) public onlyOwner {
        require(swapPool != address(0), "SwapPool not set");
        (bool success, ) = swapPool.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "SwapPool transfer failed");
    }

    function transferWheelOfFortuneOwnership(address newOwner) public onlyOwner {
        require(wheelOfFortune != address(0), "WheelOfFortune not set");
        (bool success, ) = wheelOfFortune.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "WheelOfFortune transfer failed");
    }

    function transferRocketGameOwnership(address newOwner) public onlyOwner {
        require(rocketGame != address(0), "RocketGame not set");
        (bool success, ) = rocketGame.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "RocketGame transfer failed");
    }

    function transferLotteryOwnership(address newOwner) public onlyOwner {
        require(lottery != address(0), "Lottery not set");
        (bool success, ) = lottery.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "Lottery transfer failed");
    }

    function transferReferralProgramOwnership(address newOwner) public onlyOwner {
        require(referralProgram != address(0), "ReferralProgram not set");
        (bool success, ) = referralProgram.call(
            abi.encodeWithSignature("transferOwnership(address)", newOwner)
        );
        require(success, "ReferralProgram transfer failed");
    }

    // Função para transferir ownership de todos os contratos filhos de uma vez
    function transferAllChildContractsOwnership(address newOwner) public onlyOwner {
        if (stakingPool != address(0)) {
            (bool success, ) = stakingPool.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
            if (!success) {
                // Continuar mesmo se falhar
            }
        }
        if (miningPool != address(0)) {
            (bool success, ) = miningPool.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (liptToken != address(0)) {
            (bool success, ) = liptToken.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (swapPool != address(0)) {
            (bool success, ) = swapPool.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (wheelOfFortune != address(0)) {
            (bool success, ) = wheelOfFortune.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (rocketGame != address(0)) {
            (bool success, ) = rocketGame.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (lottery != address(0)) {
            (bool success, ) = lottery.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
        if (referralProgram != address(0)) {
            (bool success, ) = referralProgram.call(
                abi.encodeWithSignature("transferOwnership(address)", newOwner)
            );
        }
    }

    // Função de emergência para transferir a propriedade de todos os contratos
    function transferAllOwnership(address newOwner) public onlyOwner {
        transferAllChildContractsOwnership(newOwner);
        transferOwnership(newOwner);
    }
}
