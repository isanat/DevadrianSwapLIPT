/**
 * Script para verificar o ownership de TODOS os contratos
 * Execute: npx hardhat run scripts/check-ownerships.cjs --network mainnet
 */

const hre = require("hardhat");

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

const YOUR_WALLET = '0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903';

async function checkOwnership(contractName, contractAddress) {
  try {
    // ABI mínimo para ler owner
    const ownerABI = [
      {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = await hre.ethers.getContractAt(ownerABI, contractAddress);
    const owner = await contract.owner();
    
    const isYourWallet = owner.toLowerCase() === YOUR_WALLET.toLowerCase();
    
    return {
      contractName,
      contractAddress,
      owner: owner,
      isYourWallet,
      canManage: isYourWallet,
    };
  } catch (error) {
    return {
      contractName,
      contractAddress,
      owner: null,
      error: error.message,
      isYourWallet: false,
      canManage: false,
    };
  }
}

async function checkProtocolController() {
  try {
    const protocolControllerAddress = CONTRACT_ADDRESSES.protocolController;
    const ownerABI = [
      {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = await hre.ethers.getContractAt(ownerABI, protocolControllerAddress);
    const owner = await contract.owner();
    
    const isYourWallet = owner.toLowerCase() === YOUR_WALLET.toLowerCase();
    
    return {
      contractName: 'ProtocolController',
      contractAddress: protocolControllerAddress,
      owner: owner,
      isYourWallet,
      canManage: isYourWallet,
    };
  } catch (error) {
    return {
      contractName: 'ProtocolController',
      contractAddress: CONTRACT_ADDRESSES.protocolController,
      owner: null,
      error: error.message,
      isYourWallet: false,
      canManage: false,
    };
  }
}

async function main() {
  console.log('🔍 Verificando ownership de TODOS os contratos...\n');
  console.log('Sua carteira:', YOUR_WALLET);
  console.log('='.repeat(80));
  console.log('');

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

  for (const contract of contracts) {
    const result = await checkOwnership(contract.name, contract.address);
    results.push(result);
    
    const status = result.isYourWallet ? '✅ SEU' : '❌ NÃO É SEU';
    console.log(`${status} - ${contract.name}:`);
    console.log(`   Endereço: ${contract.address}`);
    console.log(`   Owner: ${result.owner || 'ERRO: ' + result.error}`);
    console.log('');
  }

  // Verificar ProtocolController
  const protocolController = await checkProtocolController();
  results.push(protocolController);
  
  const pcStatus = protocolController.isYourWallet ? '✅ SEU' : '❌ NÃO É SEU';
  console.log(`${pcStatus} - ProtocolController:`);
  console.log(`   Endereço: ${protocolController.contractAddress}`);
  console.log(`   Owner: ${protocolController.owner || 'ERRO: ' + protocolController.error}`);
  console.log('');

  console.log('='.repeat(80));
  console.log('\n📊 RESUMO:\n');

  // Agrupar por owner
  const ownersMap = new Map();
  
  results.forEach(result => {
    if (result.owner) {
      const owner = result.owner.toLowerCase();
      if (!ownersMap.has(owner)) {
        ownersMap.set(owner, []);
      }
      ownersMap.get(owner).push(result.contractName);
    }
  });

  console.log('Contratos agrupados por owner:\n');
  ownersMap.forEach((contracts, owner) => {
    const isYours = owner === YOUR_WALLET.toLowerCase();
    const prefix = isYours ? '✅ VOCÊ' : '❌ OUTRO';
    console.log(`${prefix} - Owner: ${owner}`);
    console.log(`   Contratos: ${contracts.join(', ')}\n`);
  });

  // Verificar se você controla algum
  const yours = results.filter(r => r.isYourWallet);
  if (yours.length === 0) {
    console.log('❌ PROBLEMA: Você NÃO é owner de NENHUM contrato!');
    console.log('\n💡 SOLUÇÃO: Você precisa transferir o ownership para sua carteira.');
    console.log('   Execute: npx hardhat run scripts/transfer-ownership.cjs --network mainnet');
  } else if (yours.length === results.length) {
    console.log('✅ PERFEITO: Você é owner de TODOS os contratos!');
  } else {
    console.log(`⚠️  ATENÇÃO: Você é owner de ${yours.length} de ${results.length} contratos.`);
  }

  console.log('\n🔗 Links do Polygonscan:\n');
  results.forEach(result => {
    if (result.contractAddress) {
      console.log(`${result.contractName}: https://polygonscan.com/address/${result.contractAddress}`);
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

