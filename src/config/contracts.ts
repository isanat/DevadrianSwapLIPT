'use client';

import { Address } from 'viem';

// Exemplo de ABIs - você substituirá estes pelos JSONs reais dos seus contratos
import LIPTTokenAbi from '@/lib/abi/LIPTToken.json';
import MockUSDTAbi from '@/lib/abi/MockUSDT.json';
import ProtocolControllerAbi from '@/lib/abi/ProtocolController.json';
import TaxHandlerAbi from '@/lib/abi/TaxHandler.json';
import DevAdrianSwapPoolAbi from '@/lib/abi/DevAdrianSwapPool.json';
import StakingPoolAbi from '@/lib/abi/StakingPool.json';
import MiningPoolAbi from '@/lib/abi/MiningPool.json';
import ReferralProgramAbi from '@/lib/abi/ReferralProgram.json';
import WheelOfFortuneAbi from '@/lib/abi/WheelOfFortune.json';
import RocketGameAbi from '@/lib/abi/RocketGame.json';
import LotteryAbi from '@/lib/abi/Lottery.json';

// Chains suportadas (pode adicionar mais, como 'polygon', 'bsc', etc.)
type SupportedChainId = 'mainnet' | 'sepolia' | 'mumbai';

// Estrutura para os endereços dos contratos
interface ContractAddresses {
    liptToken: Address;
    mockUsdt: Address;
    protocolController: Address;
    taxHandler: Address;
    swapPool: Address;
    stakingPool: Address;
    miningPool: Address;
    referralProgram: Address;
    wheelOfFortune: Address;
    rocketGame: Address;
    lottery: Address;
}

// Mapeamento dos endereços por chain
const contractAddresses: Record<SupportedChainId, ContractAddresses> = {
    // Endereços para a rede de testes (Polygon Mumbai)
    mumbai: {
        liptToken: '0x0000000000000000000000000000000000000001', // MOCK
        mockUsdt: '0x0000000000000000000000000000000000000002', // MOCK
        protocolController: '0x0000000000000000000000000000000000000003', // MOCK
        taxHandler: '0x0000000000000000000000000000000000000004', // MOCK
        swapPool: '0x0000000000000000000000000000000000000005', // MOCK
        stakingPool: '0x0000000000000000000000000000000000000006', // MOCK
        miningPool: '0x0000000000000000000000000000000000000007', // MOCK
        referralProgram: '0x0000000000000000000000000000000000000008', // MOCK
        wheelOfFortune: '0x0000000000000000000000000000000000000009', // MOCK
        rocketGame: '0x000000000000000000000000000000000000000A', // MOCK
        lottery: '0x000000000000000000000000000000000000000B', // MOCK
    },
    // Endereços para a rede principal (Mainnet)
    mainnet: {
        liptToken: '0x...', // TODO: Substituir pelo endereço real
        mockUsdt: '0x...', // TODO: Substituir pelo endereço real do USDT
        protocolController: '0x...', // TODO: Substituir pelo endereço real
        taxHandler: '0x...', // TODO: Substituir pelo endereço real
        swapPool: '0x...', // TODO: Substituir pelo endereço real
        stakingPool: '0x...', // TODO: Substituir pelo endereço real
        miningPool: '0x...', // TODO: Substituir pelo endereço real
        referralProgram: '0x...', // TODO: Substituir pelo endereço real
        wheelOfFortune: '0x...', // TODO: Substituir pelo endereço real
        rocketGame: '0x...', // TODO: Substituir pelo endereço real
        lottery: '0x...', // TODO: Substituir pelo endereço real
    },
    // Endereços para a rede de testes (Sepolia)
    sepolia: {
        liptToken: '0x...', // TODO: Substituir pelo endereço de teste
        mockUsdt: '0x...', // TODO: Substituir pelo endereço de teste do USDT
        protocolController: '0x...', // TODO: Substituir pelo endereço de teste
        taxHandler: '0x...', // TODO: Substituir pelo endereço de teste
        swapPool: '0x...', // TODO: Substituir pelo endereço de teste
        stakingPool: '0x...', // TODO: Substituir pelo endereço de teste
        miningPool: '0x...', // TODO: Substituir pelo endereço de teste
        referralProgram: '0x...', // TODO: Substituir pelo endereço de teste
        wheelOfFortune: '0x...', // TODO: Substituir pelo endereço de teste
        rocketGame: '0x...', // TODO: Substituir pelo endereço de teste
        lottery: '0x...', // TODO: Substituir pelo endereço de teste
    },
};


// Objeto de configuração que será usado na aplicação
export const contractConfig = {
    addresses: contractAddresses,
    abi: {
        liptToken: LIPTTokenAbi.abi,
        mockUsdt: MockUSDTAbi.abi,
        protocolController: ProtocolControllerAbi.abi,
        taxHandler: TaxHandlerAbi.abi,
        swapPool: DevAdrianSwapPoolAbi.abi,
        stakingPool: StakingPoolAbi.abi,
        miningPool: MiningPoolAbi.abi,
        referralProgram: ReferralProgramAbi.abi,
        wheelOfFortune: WheelOfFortuneAbi.abi,
        rocketGame: RocketGameAbi.abi,
        lottery: LotteryAbi.abi,
    }
}
