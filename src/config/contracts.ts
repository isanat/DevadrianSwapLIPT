import LIPTTokenABI from '../lib/abi/LIPTToken.json';
import MockUSDTABI from '../lib/abi/MockUSDT.json';
import ProtocolControllerABI from '../lib/abi/ProtocolController.json';
import TaxHandlerABI from '../lib/abi/TaxHandler.json';
import DevAdrianSwapPoolABI from '../lib/abi/DevAdrianSwapPool.json';
import StakingPoolABI from '../lib/abi/StakingPool.json';
import MiningPoolABI from '../lib/abi/MiningPool.json';
import ReferralProgramABI from '../lib/abi/ReferralProgram.json';
import WheelOfFortuneABI from '../lib/abi/WheelOfFortune.json';
import RocketGameABI from '../lib/abi/RocketGame.json';
import LotteryABI from '../lib/abi/Lottery.json';

export const CONTRACT_ABIS = {
  liptToken: LIPTTokenABI.abi,
  mockUsdt: MockUSDTABI.abi,
  protocolController: ProtocolControllerABI.abi,
  taxHandler: TaxHandlerABI.abi,
  swapPool: DevAdrianSwapPoolABI.abi,
  stakingPool: StakingPoolABI.abi,
  miningPool: MiningPoolABI.abi,
  referralProgram: ReferralProgramABI.abi,
  wheelOfFortune: WheelOfFortuneABI.abi,
  rocketGame: RocketGameABI.abi,
  lottery: LotteryABI.abi,
};

const ADDRESSES = {
  // Endereços para a rede principal (Polygon Mainnet)
  mainnet: {
    liptToken: '0x3113026cDdfE9145905003f5065A2BF815B82F91',
    mockUsdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Endereço real do USDT (Tether USD) na Polygon Mainnet
    protocolController: '0x6B99297aCc06a5b19387844864D0FbA79C3066a9',
    taxHandler: '0x0dC4576f6a77Bc27B2026d17828E521F734FEE39',
    swapPool: '0xF2d672c4985ba7F9bc8B4D7621D94f9fBE357197',
    stakingPool: '0x2db77F5d7ce547f17F648e6E70296938539E7174',
    miningPool: '0x745151FE81F1cfA2D4BB0942a7863551F0336A57',
    referralProgram: '0xEB70c71b57F0c4f740c27e39e58eE4D9d59ebf64',
    wheelOfFortune: '0xF0A209965F1F17CFA14a78b6D47e1F4F035aBA8a',
    rocketGame: '0xf2089db174dd570346dD4E146EB2c81bf474f716',
    lottery: '0x657a4685AA2F56F10d885d0F99284c421cD33308',
  },
  // Endereços para a rede de testes (Polygon Amoy)
  amoy: {
    liptToken: '0x...', // Preencher após implantação na Amoy
    mockUsdt: '0x...',
    protocolController: '0x...',
    taxHandler: '0x...',
    swapPool: '0x...',
    stakingPool: '0x...',
    miningPool: '0x...',
    referralProgram: '0x...',
    wheelOfFortune: '0x...',
    rocketGame: '0x...',
    lottery: '0x...',
  },
};

// Lógica para selecionar os endereços corretos com base na rede ativa
const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_ACTIVE_NETWORK as keyof typeof ADDRESSES || 'mainnet';

export const CONTRACT_ADDRESSES = ADDRESSES[ACTIVE_NETWORK];
