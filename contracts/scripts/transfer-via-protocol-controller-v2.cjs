/**
 * Script para TRANSFERIR ownership dos contratos filhos usando o ProtocolController
 * 
 * Este script usa o ProtocolController (que é owner dos contratos filhos) para
 * transferir ownership de volta para sua carteira através das funções proxy.
 * 
 * Execute: npx hardhat run scripts/transfer-via-protocol-controller-v2.cjs --network mainnet
 */

const hre = require("hardhat");

const CONTRACT_ADDRESSES = {
  protocolController: '0x5BC8aB3884aFEf2D4c361856Bb24EC286B395263',
};

const TARGET_WALLET = '0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903';

const PROTOCOL_CONTROLLER_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferAllChildContractsOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function main() {
  console.log('🚀 Transferindo ownership dos contratos filhos via ProtocolController...\n');
  console.log('Carteira destino:', TARGET_WALLET);
  console.log('='.repeat(80));

  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error('❌ ERRO: PRIVATE_KEY não encontrado no .env!');
    process.exit(1);
  }

  const wallet = new hre.ethers.Wallet(PRIVATE_KEY, hre.ethers.provider);
  const signerAddress = await wallet.getAddress();
  
  console.log(`\nUsando carteira: ${signerAddress}`);

  // Verificar se você é owner do ProtocolController
  const protocolController = await hre.ethers.getContractAt(
    PROTOCOL_CONTROLLER_ABI,
    CONTRACT_ADDRESSES.protocolController
  );
  
  const protocolControllerOwner = await protocolController.owner();
  console.log(`Owner do ProtocolController: ${protocolControllerOwner}`);
  
  if (protocolControllerOwner.toLowerCase() !== signerAddress.toLowerCase()) {
    console.error(`\n❌ ERRO: A carteira ${signerAddress} NÃO é owner do ProtocolController!`);
    process.exit(1);
  }
  
  console.log(`✅ Você é owner do ProtocolController!\n`);

  // Transferir ownership de todos os contratos filhos
  try {
    console.log('⏳ Transferindo ownership de todos os contratos filhos...');
    const tx = await protocolController.connect(wallet).transferAllChildContractsOwnership(TARGET_WALLET);
    console.log(`   Transação enviada: ${tx.hash}`);
    console.log('   Aguardando confirmação...');
    
    await tx.wait();
    console.log(`\n✅ Ownership transferido com sucesso para: ${TARGET_WALLET}`);
    console.log('\n🔗 Verifique no Polygonscan:');
    console.log(`   ProtocolController: https://polygonscan.com/address/${CONTRACT_ADDRESSES.protocolController}`);
    console.log(`   Transação: https://polygonscan.com/tx/${tx.hash}`);
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.message.includes('function does not exist') || error.message.includes('invalid function')) {
      console.error('\n💡 O ProtocolController não tem a função transferAllChildContractsOwnership!');
      console.error('   Isso significa que o contrato não foi atualizado com as funções proxy.');
      console.error('   Você precisa fazer deploy de um novo ProtocolController com essas funções.');
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

