/**
 * Script para TRANSFERIR ownership de TODOS os contratos para sua carteira
 * 
 * ⚠️ IMPORTANTE: Este script assume que você tem acesso às carteiras que são owners atuais
 * 
 * Para usar:
 * 1. Configure a variável TARGET_WALLET abaixo com sua carteira
 * 2. Configure a variável OWNER_PRIVATE_KEY com a private key da carteira que é owner atual
 *    (ou configure no .env como OWNER_PRIVATE_KEY)
 * 3. Execute: npx hardhat run scripts/transfer-ownership.cjs --network mainnet
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

// SUA CARTEIRA - Para onde quer transferir o ownership
const TARGET_WALLET = '0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903';

// Private key da carteira que é owner atual (do .env)
const OWNER_PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// ABI mínimo para transferOwnership
const OWNER_ABI = [
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

async function transferOwnership(contractName, contractAddress, signer) {
  try {
    console.log(`\n🔄 Transferindo ownership de ${contractName}...`);
    
    const contract = await hre.ethers.getContractAt(OWNER_ABI, contractAddress);
    
    // Verificar owner atual
    const currentOwner = await contract.owner();
    const signerAddress = await signer.getAddress();
    
    console.log(`   Owner atual: ${currentOwner}`);
    console.log(`   Signer: ${signerAddress}`);
    
    // Verificar se o owner atual é o ProtocolController
    if (currentOwner.toLowerCase() === CONTRACT_ADDRESSES.protocolController.toLowerCase()) {
      console.log(`   ⚠️  O owner é o ProtocolController (${currentOwner})`);
      console.log(`   ❌ NÃO É POSSÍVEL transferir ownership diretamente!`);
      console.log(`   💡 O ProtocolController precisa ter funções proxy para isso.`);
      return { success: false, error: 'Owner é ProtocolController - requer funções proxy' };
    }
    
    // Verificar se o signer é o owner
    if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
      console.log(`   ❌ ERRO: O signer não é o owner atual!`);
      console.log(`   Owner atual: ${currentOwner}`);
      console.log(`   Signer: ${signerAddress}`);
      return { success: false, error: 'Signer não é owner' };
    }
    
    // Transferir
    const tx = await contract.transferOwnership(TARGET_WALLET);
    console.log(`   ⏳ Transação enviada: ${tx.hash}`);
    
    await tx.wait();
    console.log(`   ✅ Ownership transferido para: ${TARGET_WALLET}`);
    
    // Verificar novo owner
    const newOwner = await contract.owner();
    if (newOwner.toLowerCase() === TARGET_WALLET.toLowerCase()) {
      console.log(`   ✅ Confirmado: Novo owner é ${TARGET_WALLET}`);
      return { success: true };
    } else {
      console.log(`   ❌ ERRO: Novo owner não confere!`);
      return { success: false, error: 'Verificação falhou' };
    }
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Iniciando transferência de ownership...\n');
  console.log('Carteira destino:', TARGET_WALLET);
  console.log('='.repeat(80));
  
  if (!OWNER_PRIVATE_KEY) {
    console.error('❌ ERRO: OWNER_PRIVATE_KEY não configurado!');
    console.error('   Configure no arquivo .env ou passe como variável de ambiente.');
    console.error('   Exemplo: OWNER_PRIVATE_KEY=0x... npx hardhat run scripts/transfer-ownership.cjs --network mainnet');
    process.exit(1);
  }

  // Criar signer da carteira owner
  const wallet = new hre.ethers.Wallet(OWNER_PRIVATE_KEY, hre.ethers.provider);
  const signerAddress = await wallet.getAddress();
  
  console.log(`\nUsando signer: ${signerAddress}`);
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
    const result = await transferOwnership(contract.name, contract.address, wallet);
    results.push({ ...result, contractName: contract.name });
    
    // Esperar um pouco entre transações para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Transferir ProtocolController também
  const pcResult = await transferOwnership('ProtocolController', CONTRACT_ADDRESSES.protocolController, wallet);
  results.push({ ...pcResult, contractName: 'ProtocolController' });

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMO:\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Sucessos: ${successful}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log('');

  if (successful === results.length) {
    console.log('🎉 SUCESSO! Todos os contratos foram transferidos!');
  } else if (successful > 0) {
    console.log('⚠️  Transferência parcial. Alguns contratos falharam.');
  } else {
    console.log('❌ Nenhum contrato foi transferido. Verifique os erros acima.');
  }

  console.log('\n🔗 Verificar no Polygonscan:');
  results.forEach(result => {
    const address = CONTRACT_ADDRESSES[result.contractName?.toLowerCase().replace(/\s+/g, '')] || CONTRACT_ADDRESSES.protocolController;
    console.log(`${result.contractName}: https://polygonscan.com/address/${address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

