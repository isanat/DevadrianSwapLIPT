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

    // Função de emergência para transferir a propriedade de todos os contratos
    function transferAllOwnership(address newOwner) public onlyOwner {
        // Em um sistema real, esta função chamaria a função transferOwnership()
        // em cada um dos contratos do protocolo.
        // Exemplo: ILiptToken(liptToken).transferOwnership(newOwner);
        // Por enquanto, apenas transfere a propriedade deste controlador.
        transferOwnership(newOwner);
    }
}
