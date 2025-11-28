/**
 * Script para verificar se os contratos foram deployados e estão funcionando
 * Execute: npx hardhat run scripts/verify-deployment.cjs --network mainnet
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const DEPLOYMENT_FILE = path.join(__dirname, '../deployment-addresses.json');

async function checkContract(address, name) {
  try {
    const code = await hre.ethers.provider.getCode(address);
    const hasCode = code && code !== "0x";
    
    return {
      name,
      address,
      deployed: hasCode,
      codeSize: hasCode ? code.length : 0
    };
  } catch (error) {
    return {
      name,
      address,
      deployed: false,
      error: error.message
    };
  }
}

async function checkContractOwner(address, name) {
  try {
    const ownerABI = [
      {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = await hre.ethers.getContractAt(ownerABI, address);
    const owner = await contract.owner();
    return owner;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('\n🔍 VERIFICANDO DEPLOY DOS CONTRATOS\n');
  console.log('='.repeat(80));
  
  // Ler endereços do deployment
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    console.error('❌ Arquivo deployment-addresses.json não encontrado!');
    console.error('   Execute o deploy primeiro: npx hardhat run scripts/deploy-complete.cjs --network mainnet');
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, 'utf8'));
  const addresses = deploymentData.addresses;
  
  console.log(`\n📋 Network: ${deploymentData.network}`);
  console.log(`📅 Timestamp: ${deploymentData.timestamp}\n`);

  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`👤 Deployer: ${deployerAddress}\n`);

  // Verificar todos os contratos
  const contracts = [
    { key: 'mockUsdt', name: 'MockUSDT' },
    { key: 'liptToken', name: 'LIPTToken' },
    { key: 'protocolController', name: 'ProtocolController' },
    { key: 'taxHandler', name: 'TaxHandler' },
    { key: 'swapPool', name: 'DevAdrianSwapPool' },
    { key: 'stakingPool', name: 'StakingPool' },
    { key: 'miningPool', name: 'MiningPool' },
    { key: 'referralProgram', name: 'ReferralProgram' },
    { key: 'wheelOfFortune', name: 'WheelOfFortune' },
    { key: 'rocketGame', name: 'RocketGame' },
    { key: 'lottery', name: 'Lottery' },
  ];

  console.log('📊 VERIFICAÇÃO DOS CONTRATOS:\n');
  
  let allDeployed = true;
  const results = [];

  for (const contract of contracts) {
    const address = addresses[contract.key];
    if (!address) {
      console.log(`⚠️  ${contract.name}: Endereço não encontrado`);
      allDeployed = false;
      continue;
    }

    const check = await checkContract(address, contract.name);
    results.push(check);

    const status = check.deployed ? '✅' : '❌';
    console.log(`${status} ${contract.name.padEnd(25)}: ${address}`);
    
    if (check.deployed) {
      console.log(`   ✅ Deployado (código: ${check.codeSize} bytes)`);
      
      // Verificar owner
      try {
        const owner = await checkContractOwner(address, contract.name);
        if (owner) {
          const isDeployer = owner.toLowerCase() === deployerAddress.toLowerCase();
          const ownerStatus = isDeployer ? '✅' : '⚠️ ';
          console.log(`   ${ownerStatus} Owner: ${owner}${isDeployer ? ' (você)' : ''}`);
        }
      } catch (e) {
        // Ignorar se não tem função owner
      }
      
      console.log(`   🔗 https://polygonscan.com/address/${address}\n`);
    } else {
      console.log(`   ❌ NÃO DEPLOYADO${check.error ? ` - ${check.error}` : ''}\n`);
      allDeployed = false;
    }
  }

  console.log('='.repeat(80));
  
  if (allDeployed) {
    console.log('\n✅ TODOS OS CONTRATOS ESTÃO DEPLOYADOS E FUNCIONANDO!\n');
  } else {
    console.log('\n⚠️  ALGUNS CONTRATOS NÃO ESTÃO DEPLOYADOS OU COM PROBLEMAS\n');
    console.log('💡 Execute o deploy completo: npx hardhat run scripts/deploy-complete.cjs --network mainnet\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

