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
    liptToken: '0xC2D56dCe89b6cD0015B9f7D915Bc08ce1164b789',
    mockUsdt: '0x36a56e4Ee8bA64D1a489C1FE3291d7BbF5F70066',
    protocolController: '0x19aeB4f157cb96B70E1e07Db98c5E3503c932C02',
    taxHandler: '0x3EBa2B8ab8d6235448Bd0cABCD630944279A01D2',
    swapPool: '0xB45a9cC6eA4ec799cc045231c630778BF019DBbF',
    stakingPool: '0xc30A0590cd68795C5D340d3cc8fF09d8d6C80602',
    miningPool: '0x73B902f9Fcadc12C0016d5779f17bCbBCADcb81F',
    referralProgram: '0x18a11366a8f6B906976aBb60FdF7970cbBbaBeBE',
    wheelOfFortune: '0x87aAc4Bb8D0d0B1349C1793bC3EA53c43839B135',
    rocketGame: '0xB7198062d9ae200dA5cBc68a1eF6Ea39cef5eb22',
    lottery: '0x9883Ef2e6405c2aEabc260e8A2dCEd73A413aACC',
  },
  // Endere?os para a rede de testes (Polygon Amoy)
  amoy: {
    liptToken: '0x...',
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
// Validar que a rede é uma chave válida antes de usar
type NetworkKey = keyof typeof ADDRESSES;
const VALID_NETWORKS: NetworkKey[] = ['mainnet', 'amoy'];

const getActiveNetwork = (): NetworkKey => {
  const envNetwork = process.env.NEXT_PUBLIC_ACTIVE_NETWORK as NetworkKey | undefined;
  
  // Validar que a rede da variável de ambiente é válida
  if (envNetwork && VALID_NETWORKS.includes(envNetwork)) {
    return envNetwork;
  }
  
  // Se não for válida ou não existir, usar mainnet como padrão
  return 'mainnet';
};

const ACTIVE_NETWORK = getActiveNetwork();

export const CONTRACT_ADDRESSES: typeof ADDRESSES[NetworkKey] = ADDRESSES[ACTIVE_NETWORK];

// Exportar a configura??o completa para compatibilidade
export const contractConfig = ADDRESSES;
