/**
 * Script para atualizar automaticamente os endereços dos contratos no frontend
 * após o deploy completo.
 * 
 * Execute: node scripts/update-contracts-config.cjs
 */

const fs = require('fs');
const path = require('path');

const CONTRACTS_CONFIG_PATH = path.join(__dirname, '../../src/config/contracts.ts');
const DEPLOYMENT_ADDRESSES_PATH = path.join(__dirname, '../deployment-addresses.json');

function updateContractsConfig() {
  try {
    // Ler endereços do deploy
    const deploymentData = JSON.parse(fs.readFileSync(DEPLOYMENT_ADDRESSES_PATH, 'utf8'));
    const addresses = deploymentData.addresses;
    
    // Ler arquivo de configuração atual
    let configContent = fs.readFileSync(CONTRACTS_CONFIG_PATH, 'utf8');
    
    // Atualizar endereços na seção mainnet
    const mainnetSection = `  mainnet: {
    liptToken: '${addresses.liptToken}',
    mockUsdt: '${addresses.mockUsdt}',
    protocolController: '${addresses.protocolController}',
    taxHandler: '${addresses.taxHandler}',
    swapPool: '${addresses.swapPool}',
    stakingPool: '${addresses.stakingPool}',
    miningPool: '${addresses.miningPool}',
    referralProgram: '${addresses.referralProgram}',
    wheelOfFortune: '${addresses.wheelOfFortune}',
    rocketGame: '${addresses.rocketGame}',
    lottery: '${addresses.lottery}',
  },`;
    
    // Substituir a seção mainnet
    configContent = configContent.replace(
      /mainnet:\s*\{[^}]+}/s,
      mainnetSection
    );
    
    // Salvar arquivo atualizado
    fs.writeFileSync(CONTRACTS_CONFIG_PATH, configContent, 'utf8');
    
    console.log('✅ Endereços atualizados em src/config/contracts.ts');
    console.log('\n📋 Endereços atualizados:');
    Object.entries(addresses).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error.message);
    process.exit(1);
  }
}

updateContractsConfig();

