'use client';

import { Address } from 'viem';

// Exemplo de ABIs - você substituirá estes pelos JSONs reais dos seus contratos
import LiptTokenAbi from '@/lib/abi/LiptToken.json';
import StakingAbi from '@/lib/abi/Staking.json';

// Chains suportadas (pode adicionar mais, como 'polygon', 'bsc', etc.)
type SupportedChainId = 'mainnet' | 'sepolia';

// Estrutura para os endereços dos contratos
interface ContractAddresses {
    liptToken: Address;
    usdtToken: Address;
    staking: Address;
    liquidityPool: Address;
    mining: Address;
    referrals: Address;
    wheelGame: Address;
    rocketGame: Address;
    lotteryGame: Address;
}

// Mapeamento dos endereços por chain
const contractAddresses: Record<SupportedChainId, ContractAddresses> = {
    // Endereços para a rede principal (Mainnet)
    mainnet: {
        liptToken: '0x...', // TODO: Substituir pelo endereço real
        usdtToken: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Endereço real do USDT na Mainnet
        staking: '0x...', // TODO: Substituir pelo endereço real
        liquidityPool: '0x...', // TODO: Substituir pelo endereço real
        mining: '0x...', // TODO: Substituir pelo endereço real
        referrals: '0x...', // TODO: Substituir pelo endereço real
        wheelGame: '0x...', // TODO: Substituir pelo endereço real
        rocketGame: '0x...', // TODO: Substituir pelo endereço real
        lotteryGame: '0x...', // TODO: Substituir pelo endereço real
    },
    // Endereços para a rede de testes (Sepolia)
    sepolia: {
        liptToken: '0x...', // TODO: Substituir pelo endereço de teste
        usdtToken: '0x...', // TODO: Substituir pelo endereço de teste do USDT
        staking: '0x...', // TODO: Substituir pelo endereço de teste
        liquidityPool: '0x...', // TODO: Substituir pelo endereço de teste
        mining: '0x...', // TODO: Substituir pelo endereço de teste
        referrals: '0x...', // TODO: Substituir pelo endereço de teste
        wheelGame: '0x...', // TODO: Substituir pelo endereço de teste
        rocketGame: '0x...', // TODO: Substituir pelo endereço de teste
        lotteryGame: '0x...', // TODO: Substituir pelo endereço de teste
    },
};


// Objeto de configuração que será usado na aplicação
export const contractConfig = {
    addresses: contractAddresses,
    abi: {
        liptToken: LiptTokenAbi,
        staking: StakingAbi,
        // Adicione outras ABIs aqui quando as tiver
        // liquidityPool: LiquidityPoolAbi,
        // mining: MiningAbi,
    }
}
