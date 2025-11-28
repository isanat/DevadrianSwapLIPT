/**
 * Script para verificar quais contratos já foram deployados com sucesso
 * Execute: npx hardhat run scripts/check-existing-contracts.cjs --network mainnet
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const DEPLOYMENT_FILE = path.join(__dirname, '../deployment-addresses.json');

async function checkContract(address, name) {
  try {
    const code = await hre.ethers.provider.getCode(address);
    const hasCode = code && code !== "0x";
    
    // Calcular tamanho em bytes
    const codeSize = hasCode ? (code.length - 2) / 2 : 0;
    
    return {
      name,
      address,
      deployed: hasCode,
      codeSize: codeSize
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

async function main() {
  console.log('\n🔍 VERIFICANDO CONTRATOS JÁ DEPLOYADOS\n');
  console.log('='.repeat(80));
  
  // Ler endereços do deployment
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    console.error('❌ Arquivo deployment-addresses.json não encontrado!');
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, 'utf8'));
  const addresses = deploymentData.addresses;
  
  console.log(`\n📋 Network: ${deploymentData.network}`);
  console.log(`📅 Timestamp: ${deploymentData.timestamp}\n`);

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
  
  const results = {
    deployed: [],
    notDeployed: []
  };

  for (const contract of contracts) {
    const address = addresses[contract.key];
    if (!address) {
      console.log(`⚠️  ${contract.name}: Endereço não encontrado no arquivo`);
      results.notDeployed.push({ key: contract.key, name: contract.name, reason: 'endereço não encontrado' });
      continue;
    }

    const check = await checkContract(address, contract.name);
    
    if (check.deployed) {
      const status = '✅';
      console.log(`${status} ${contract.name.padEnd(25)}: ${address}`);
      console.log(`   ✅ Deployado (${check.codeSize} bytes)`);
      console.log(`   🔗 https://polygonscan.com/address/${address}\n`);
      results.deployed.push({ 
        key: contract.key, 
        name: contract.name, 
        address: address,
        codeSize: check.codeSize 
      });
    } else {
      const status = '❌';
      console.log(`${status} ${contract.name.padEnd(25)}: ${address}`);
      console.log(`   ❌ NÃO DEPLOYADO\n`);
      results.notDeployed.push({ 
        key: contract.key, 
        name: contract.name, 
        address: address,
        reason: check.error || 'código não encontrado'
      });
    }
  }

  console.log('='.repeat(80));
  console.log('\n📋 RESUMO:\n');
  console.log(`✅ Deployados: ${results.deployed.length}`);
  console.log(`❌ Não deployados: ${results.notDeployed.length}\n`);
  
  if (results.deployed.length > 0) {
    console.log('✅ CONTRATOS JÁ DEPLOYADOS (podem ser reutilizados):');
    results.deployed.forEach(c => {
      console.log(`   - ${c.name}: ${c.address}`);
    });
    console.log('');
  }
  
  if (results.notDeployed.length > 0) {
    console.log('❌ CONTRATOS QUE PRECISAM SER DEPLOYADOS:');
    results.notDeployed.forEach(c => {
      console.log(`   - ${c.name}: ${c.address || 'sem endereço'} (${c.reason})`);
    });
    console.log('');
  }
  
  // Salvar resultados em arquivo para uso pelo script de deploy
  const resultsFile = path.join(__dirname, '../deployment-status.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    network: deploymentData.network,
    deployed: results.deployed,
    notDeployed: results.notDeployed
  }, null, 2));
  
  console.log(`💾 Resultados salvos em: ${resultsFile}`);
  console.log('💡 Use este arquivo para fazer deploy apenas dos contratos que faltam\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

