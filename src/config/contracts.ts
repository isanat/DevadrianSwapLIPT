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
  // Endere?os para a rede principal (Polygon Mainnet)
  mainnet: {
    liptToken: '0x15F6CAfD1fE68B0BCddecb28a739d14dB38947e6',
    mockUsdt: '0x47A50422F81327139A4796C7494E7B8725D3EB30',
    protocolController: '0x5BC8aB3884aFEf2D4c361856Bb24EC286B395263',
    taxHandler: '0x4D2bEaaBc3C4063319d11F9EB5184a05A3B956B0',
    swapPool: '0xD22e4AcB94A063e929D0bA0b232475d297EE16c7',
    stakingPool: '0x5B9F5e752596b7dFE1123EFdb5b86c2B7b86d8D3',
    miningPool: '0xb56BaAa0f328cf09734862142bF42bA291017a08',
    referralProgram: '0x839a9B70FCb941Ce6357C95eacd38a617DaDaE5a',
    wheelOfFortune: '0x71aF40Dab1Eb76B0fAcB6A5eeC6B8F27e48d71be',
    rocketGame: '0x1a189De97DfDa1B7231B1aD1E6c1c7c6C8E71dC6',
    lottery: '0x4e67a5c97889863AC0794584f9c6e20F288fF1EA',
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
