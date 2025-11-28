/**
 * Script para verificar o ownership de TODOS os contratos
 * Execute: npx tsx scripts/check-all-ownerships.ts
 */

import { createPublicClient, http, getContract, Address } from 'viem';
import { polygon } from 'viem/chains';
// Endereços dos contratos (mesmos do contracts.ts)
const CONTRACT_ADDRESSES = {
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
};

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com';

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(RPC_URL),
});

// ABI mínimo para ler owner
const OWNER_ABI = [
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

async function checkContractOwner(contractName: string, contractAddress: string) {
  try {
    const contract = getContract({
      address: contractAddress as Address,
      abi: OWNER_ABI,
      client: publicClient,
    });

    const owner = await contract.read.owner();
    return {
      contractName,
      contractAddress,
      owner: owner as string,
      success: true,
    };
  } catch (error: any) {
    return {
      contractName,
      contractAddress,
      owner: null,
      success: false,
      error: error.message,
    };
  }
}

async function checkProtocolControllerOwner() {
  try {
    // Buscar endereço do ProtocolController
    const protocolControllerAddress = CONTRACT_ADDRESSES.protocolController as string;
    
    const contract = getContract({
      address: protocolControllerAddress as Address,
      abi: OWNER_ABI,
      client: publicClient,
    });

    const owner = await contract.read.owner();
    return {
      contractName: 'ProtocolController',
      contractAddress: protocolControllerAddress,
      owner: owner as string,
      success: true,
    };
  } catch (error: any) {
    return {
      contractName: 'ProtocolController',
      contractAddress: CONTRACT_ADDRESSES.protocolController as string,
      owner: null,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 Verificando ownership de TODOS os contratos...\n');
  console.log('=' .repeat(80));

  const contracts = [
    { name: 'LIPT Token', address: CONTRACT_ADDRESSES.liptToken },
    { name: 'Mock USDT', address: CONTRACT_ADDRESSES.mockUsdt },
    { name: 'Staking Pool', address: CONTRACT_ADDRESSES.stakingPool },
    { name: 'Mining Pool', address: CONTRACT_ADDRESSES.miningPool },
    { name: 'Swap Pool', address: CONTRACT_ADDRESSES.swapPool },
    { name: 'Wheel of Fortune', address: CONTRACT_ADDRESSES.wheelOfFortune },
    { name: 'Rocket Game', address: CONTRACT_ADDRESSES.rocketGame },
    { name: 'Lottery', address: CONTRACT_ADDRESSES.lottery },
    { name: 'Referral Program', address: CONTRACT_ADDRESSES.referralProgram },
  ];

  const results = [];

  // Verificar todos os contratos
  for (const contract of contracts) {
    if (contract.address) {
      const result = await checkContractOwner(contract.name, contract.address as string);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${contract.name}:`);
        console.log(`   Endereço: ${contract.address}`);
        console.log(`   Owner: ${result.owner}\n`);
      } else {
        console.log(`❌ ${contract.name}:`);
        console.log(`   Endereço: ${contract.address}`);
        console.log(`   Erro: ${result.error}\n`);
      }
    }
  }

  // Verificar ProtocolController
  const protocolController = await checkProtocolControllerOwner();
  results.push(protocolController);
  
  if (protocolController.success) {
    console.log(`✅ ${protocolController.contractName}:`);
    console.log(`   Endereço: ${protocolController.contractAddress}`);
    console.log(`   Owner: ${protocolController.owner}\n`);
  } else {
    console.log(`❌ ${protocolController.contractName}:`);
    console.log(`   Endereço: ${protocolController.contractAddress}`);
    console.log(`   Erro: ${protocolController.error}\n`);
  }

  console.log('=' .repeat(80));
  console.log('\n📊 RESUMO:\n');

  // Agrupar por owner
  const ownersMap = new Map<string, string[]>();
  
  results.forEach(result => {
    if (result.success && result.owner) {
      const owner = result.owner.toLowerCase();
      if (!ownersMap.has(owner)) {
        ownersMap.set(owner, []);
      }
      ownersMap.get(owner)!.push(result.contractName);
    }
  });

  console.log('Contratos agrupados por owner:\n');
  ownersMap.forEach((contracts, owner) => {
    console.log(`👤 Owner: ${owner}`);
    console.log(`   Contratos: ${contracts.join(', ')}\n`);
  });

  // Verificar se algum contrato tem ownership diferente
  const uniqueOwners = Array.from(ownersMap.keys());
  if (uniqueOwners.length > 1) {
    console.log('⚠️  ATENÇÃO: Existem múltiplos owners!');
    console.log(`   Total de owners diferentes: ${uniqueOwners.length}\n`);
  } else if (uniqueOwners.length === 1) {
    console.log('✅ Todos os contratos têm o mesmo owner!');
    console.log(`   Owner: ${uniqueOwners[0]}\n`);
  }

  console.log('\n🔗 Links do Polygonscan:\n');
  results.forEach(result => {
    if (result.contractAddress) {
      console.log(`${result.contractName}: https://polygonscan.com/address/${result.contractAddress}`);
    }
  });
}

main()
  .then(() => {
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });

