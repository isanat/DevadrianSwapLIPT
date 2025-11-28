/**
 * Script para TRANSFERIR ownership dos contratos filhos DE VOLTA para sua carteira
 * 
 * Este script assume que:
 * - O ProtocolController é owner dos contratos filhos
 * - Você é owner do ProtocolController
 * - Você tem a PRIVATE_KEY no .env
 * 
 * O script vai:
 * 1. Verificar que você é owner do ProtocolController
 * 2. Chamar transferOwnership diretamente nos contratos filhos
 * 3. Como você é owner do ProtocolController, mas os contratos têm ProtocolController como owner,
 *    precisamos fazer isso através de uma chamada do ProtocolController
 * 
 * MAS: O ProtocolController não tem funções para isso, então precisamos fazer diferente.
 * 
 * SOLUÇÃO: Como os contratos foram transferidos para o ProtocolController,
 * e você não tem acesso direto ao ProtocolController como signer,
 * precisamos criar um script que chama transferOwnership diretamente nos contratos,
 * mas isso só funciona se você for owner dos contratos.
 * 
 * ALTERNATIVA: Você pode usar o ProtocolController para fazer isso se ele tiver funções proxy.
 * Como não tem, precisamos de outra solução.
 * 
 * A REALIDADE: Se você tem a private key da carteira que é owner do ProtocolController,
 * e os contratos foram transferidos para o ProtocolController, você PRECISA que o ProtocolController
 * tenha funções para transferir ownership de volta, OU você precisa ser owner direto dos contratos.
 * 
 * Como o ProtocolController não tem essas funções, a única forma é:
 * - Modificar e fazer redeploy do ProtocolController com funções proxy
 * - OU ter sido owner direto dos contratos antes de transferir para ProtocolController
 * 
 * Este script vai tentar transferir ownership diretamente, mas provavelmente vai falhar
 * porque você não é owner direto dos contratos (o ProtocolController é).
 */

const hre = require("hardhat");
require("dotenv").config();

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

// Private key da carteira (do .env)
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ABI para transferOwnership
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

async function main() {
  console.log('🚀 Tentando transferir ownership dos contratos filhos...\n');
  console.log('Carteira destino:', TARGET_WALLET);
  console.log('='.repeat(80));
  
  if (!PRIVATE_KEY) {
    console.error('❌ ERRO: PRIVATE_KEY não encontrado no .env!');
    console.error('   Configure PRIVATE_KEY=0x... no arquivo contracts/.env');
    process.exit(1);
  }

  // Criar signer da sua carteira
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY, hre.ethers.provider);
  const signerAddress = await wallet.getAddress();
  
  console.log(`\nUsando carteira: ${signerAddress}`);
  
  // Verificar se você é owner do ProtocolController
  const protocolControllerABI = [
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  
  const protocolController = await hre.ethers.getContractAt(
    protocolControllerABI,
    CONTRACT_ADDRESSES.protocolController
  );
  
  const protocolControllerOwner = await protocolController.owner();
  console.log(`\nOwner do ProtocolController: ${protocolControllerOwner}`);
  
  if (protocolControllerOwner.toLowerCase() !== signerAddress.toLowerCase()) {
    console.error(`\n❌ ERRO: A carteira ${signerAddress} NÃO é owner do ProtocolController!`);
    console.error(`   Owner atual: ${protocolControllerOwner}`);
    console.error(`\n💡 Você precisa usar a private key da carteira que é owner do ProtocolController.`);
    process.exit(1);
  }
  
  console.log(`✅ Você é owner do ProtocolController!\n`);

  // Lista de contratos para transferir
  const contracts = [
    { name: 'LIPT Token', address: CONTRACT_ADDRESSES.liptToken },
    { name: 'Staking Pool', address: CONTRACT_ADDRESSES.stakingPool },
    { name: 'Mining Pool', address: CONTRACT_ADDRESSES.miningPool },
    { name: 'Swap Pool', address: CONTRACT_ADDRESSES.swapPool },
    { name: 'Wheel of Fortune', address: CONTRACT_ADDRESSES.wheelOfFortune },
    { name: 'Rocket Game', address: CONTRACT_ADDRESSES.rocketGame },
    { name: 'Lottery', address: CONTRACT_ADDRESSES.lottery },
    { name: 'Referral Program', address: CONTRACT_ADDRESSES.referralProgram },
  ];

  console.log('⚠️  AVISO: Este script vai tentar transferir ownership diretamente dos contratos.');
  console.log('   Se os contratos têm o ProtocolController como owner, isso vai falhar.');
  console.log('   Nesse caso, você precisará fazer deploy de um novo ProtocolController com funções proxy.\n');

  const results = [];

  for (const contract of contracts) {
    try {
      console.log(`\n🔄 Tentando transferir ${contract.name}...`);
      
      const contractInstance = await hre.ethers.getContractAt(OWNER_ABI, contract.address);
      const currentOwner = await contractInstance.owner();
      
      console.log(`   Owner atual: ${currentOwner}`);
      
      // Verificar se o owner atual é o ProtocolController
      if (currentOwner.toLowerCase() === CONTRACT_ADDRESSES.protocolController.toLowerCase()) {
        console.log(`   ⚠️  O owner é o ProtocolController. Transferência direta não vai funcionar.`);
        console.log(`   ❌ Falhou: Você precisa usar o ProtocolController para transferir, mas ele não tem essa função.`);
        
        results.push({
          contractName: contract.name,
          success: false,
          error: 'Owner é ProtocolController - requer funções proxy que não existem',
        });
        continue;
      }
      
      // Verificar se você já é owner
      if (currentOwner.toLowerCase() === signerAddress.toLowerCase()) {
        console.log(`   ✅ Você já é owner deste contrato!`);
        results.push({
          contractName: contract.name,
          success: true,
          alreadyOwner: true,
        });
        continue;
      }
      
      // Tentar transferir
      console.log(`   ⏳ Tentando transferir para ${TARGET_WALLET}...`);
      const tx = await contractInstance.connect(wallet).transferOwnership(TARGET_WALLET);
      console.log(`   ⏳ Transação enviada: ${tx.hash}`);
      
      await tx.wait();
      console.log(`   ✅ Ownership transferido!`);
      
      // Verificar
      const newOwner = await contractInstance.owner();
      if (newOwner.toLowerCase() === TARGET_WALLET.toLowerCase()) {
        console.log(`   ✅ Confirmado: Novo owner é ${TARGET_WALLET}`);
        results.push({ contractName: contract.name, success: true });
      } else {
        console.log(`   ❌ Erro: Novo owner não confere!`);
        results.push({ contractName: contract.name, success: false, error: 'Verificação falhou' });
      }
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      results.push({ contractName: contract.name, success: false, error: error.message });
    }
    
    // Esperar um pouco entre transações
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

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
    console.log('\n💡 Para os contratos que falharam (owner é ProtocolController):');
    console.log('   Você precisa fazer deploy de um novo ProtocolController com funções proxy,');
    console.log('   ou modificar o ProtocolController atual para adicionar essas funções.');
  } else {
    console.log('❌ Nenhum contrato foi transferido.');
    console.log('\n💡 SOLUÇÃO: Como todos os contratos têm o ProtocolController como owner,');
    console.log('   você precisa fazer deploy de um novo ProtocolController com funções proxy.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

