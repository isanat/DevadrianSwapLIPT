/**
 * Script de Deploy Inteligente - Deploy apenas dos contratos que faltam
 * Reutiliza os contratos já deployados com sucesso
 * Execute: npx hardhat run scripts/deploy-smart.cjs --network mainnet
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Cores para console (Windows compatible)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function checkContractExists(address) {
  try {
    const code = await hre.ethers.provider.getCode(address);
    return code && code !== "0x";
  } catch (error) {
    return false;
  }
}

async function waitForContractCode(address, maxRetries = 30, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    const code = await hre.ethers.provider.getCode(address);
    if (code && code !== "0x") {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
}

async function deployWithTimeout(contractFactory, constructorArgs, contractName, timeout = 60000) {
  log(`   Deployando ${contractName}...`, 'yellow');
  const deployTx = await contractFactory.deploy(...constructorArgs);
  
  const address = await deployTx.getAddress();
  log(`   ✅ ${contractName} será deployado em: ${address}`, 'green');
  
  const txHash = await deployTx.deploymentTransaction()?.hash;
  if (txHash) {
    log(`   ✅ Transação enviada! Hash: ${txHash}`, 'green');
    log(`   🔗 Ver: https://polygonscan.com/tx/${txHash}`, 'cyan');
  }
  
  log(`   ⏳ Aguardando confirmação (timeout ${timeout/1000}s)...`, 'yellow');
  
  try {
    await deployTx.waitForDeployment({ timeout });
    log(`   ✅ ${contractName} deployado e confirmado!`, 'green');
    return address;
  } catch (error) {
    log(`   ⏱️  Timeout aguardando confirmação. Verificando se contrato existe...`, 'yellow');
    
    const codeExists = await waitForContractCode(address, 5, 2000);
    if (codeExists) {
      log(`   ✅ Código do contrato encontrado! Deploy confirmado.`, 'green');
      return address;
    }
    
    log(`   ⚠️  Ainda aguardando mineração. Continuando...`, 'yellow');
    if (txHash) {
      log(`   💡 A transação está pendente. Verifique: https://polygonscan.com/tx/${txHash}`, 'cyan');
    } else {
      log(`   💡 Transação pendente. Verifique o endereço: ${address}`, 'cyan');
    }
    
    return address;
  }
}

async function loadExistingAddresses() {
  try {
    const deploymentFile = path.join(__dirname, '../deployment-addresses.json');
    if (fs.existsSync(deploymentFile)) {
      const fileContent = fs.readFileSync(deploymentFile, 'utf8');
      if (!fileContent || fileContent.trim() === '') {
        log(`⚠️  Arquivo deployment-addresses.json está vazio`, 'yellow');
        return {};
      }
      const data = JSON.parse(fileContent);
      return data.addresses || {};
    }
    return {};
  } catch (error) {
    log(`⚠️  Erro ao carregar endereços existentes: ${error.message}`, 'yellow');
    log(`   Continuando sem endereços pré-existentes...`, 'yellow');
    return {};
  }
}

async function saveDeploymentAddresses(addresses) {
  try {
    const deploymentFile = path.join(__dirname, '../deployment-addresses.json');
    const deploymentDir = path.dirname(deploymentFile);
    
    // Garantir que o diretório existe
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const deploymentData = {
      network: hre.network.name,
      timestamp: new Date().toISOString(),
      addresses: addresses
    };
    
    const jsonContent = JSON.stringify(deploymentData, null, 2);
    fs.writeFileSync(deploymentFile, jsonContent, 'utf8');
    log(`\n📝 Endereços salvos em: ${deploymentFile}`, 'cyan');
    
    // Verificar se o arquivo foi salvo corretamente
    if (fs.existsSync(deploymentFile)) {
      const savedData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
      if (savedData.addresses && Object.keys(savedData.addresses).length > 0) {
        log(`   ✅ ${Object.keys(savedData.addresses).length} endereços salvos com sucesso`, 'green');
      } else {
        log(`   ⚠️  Arquivo salvo mas sem endereços`, 'yellow');
      }
    } else {
      throw new Error('Arquivo não foi criado após writeFileSync');
    }
  } catch (error) {
    log(`\n❌ ERRO ao salvar endereços: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

async function waitForConfirmations(txHash, confirmations = 1) {
  log(`   ⏳ Aguardando ${confirmations} confirmação(ões)...`, 'yellow');
  try {
    const receipt = await hre.ethers.provider.waitForTransaction(txHash, confirmations, 120000);
    log(`   ✅ Transação confirmada! Hash: ${txHash}`, 'green');
    return receipt;
  } catch (error) {
    log(`   ❌ Erro ao aguardar confirmações: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  logSection('🚀 DEPLOY INTELIGENTE - Reutilizando Contratos Existentes');
  
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  
  log(`💰 Deployer: ${deployerAddress}`, 'cyan');
  log(`💰 Saldo: ${hre.ethers.formatEther(balance)} POL`, 'cyan');
  
  // Carregar endereços existentes
  const existingAddresses = await loadExistingAddresses();
  log(`\n📋 Carregando endereços existentes...`, 'cyan');
  
  const deploymentAddresses = { ...existingAddresses };
  
  try {
    // Verificar quais contratos já existem
    logSection('🔍 Verificando Contratos Existentes');
    
    const contractsToCheck = [
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
    
    const contractsToDeploy = [];
    const contractsReused = [];
    
    for (const contract of contractsToCheck) {
      const existingAddress = deploymentAddresses[contract.key];
      
      if (existingAddress) {
        const exists = await checkContractExists(existingAddress);
        if (exists) {
          log(`✅ ${contract.name} já existe em: ${existingAddress}`, 'green');
          contractsReused.push(contract);
          continue;
        } else {
          log(`⚠️  ${contract.name} tem endereço mas não está deployado: ${existingAddress}`, 'yellow');
        }
      }
      
      contractsToDeploy.push(contract);
    }
    
    log(`\n📊 RESUMO:`, 'cyan');
    log(`   ✅ Reutilizando: ${contractsReused.length} contratos`, 'green');
    log(`   🚀 Deployando: ${contractsToDeploy.length} contratos`, 'yellow');
    
    if (contractsToDeploy.length === 0) {
      log(`\n✅ Todos os contratos já estão deployados!`, 'green');
      log(`💡 Nada a fazer.`, 'cyan');
      return;
    }
    
    // ============================================================================
    // DEPLOY DOS CONTRATOS QUE FALTAM
    // ============================================================================
    
    let mockUSDTAddress = deploymentAddresses.mockUsdt;
    let liptTokenAddress = deploymentAddresses.liptToken;
    
    // 1. MockUSDT
    if (contractsToDeploy.find(c => c.key === 'mockUsdt')) {
      logSection('1️⃣  Deploy MockUSDT');
      const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
      const initialSupply = hre.ethers.parseUnits("1000000000", 18);
      mockUSDTAddress = await deployWithTimeout(MockUSDT, [initialSupply], 'MockUSDT');
      deploymentAddresses.mockUsdt = mockUSDTAddress;
    } else {
      log(`✅ MockUSDT: Reutilizando ${mockUSDTAddress}`, 'green');
    }
    
    // 2. LIPT Token
    if (contractsToDeploy.find(c => c.key === 'liptToken')) {
      logSection('2️⃣  Deploy LIPT Token');
      const LIPTToken = await hre.ethers.getContractFactory("LIPTToken");
      const liptInitialSupply = hre.ethers.parseUnits("1000000000", 18);
      liptTokenAddress = await deployWithTimeout(LIPTToken, [liptInitialSupply], 'LIPTToken');
      deploymentAddresses.liptToken = liptTokenAddress;
    } else {
      log(`✅ LIPTToken: Reutilizando ${liptTokenAddress}`, 'green');
    }
    
    // 3. ProtocolController
    if (contractsToDeploy.find(c => c.key === 'protocolController')) {
      logSection('3️⃣  Deploy ProtocolController');
      const ProtocolController = await hre.ethers.getContractFactory("ProtocolController");
      const protocolControllerAddress = await deployWithTimeout(ProtocolController, [], 'ProtocolController');
      deploymentAddresses.protocolController = protocolControllerAddress;
    }
    
    // 4. TaxHandler
    if (contractsToDeploy.find(c => c.key === 'taxHandler')) {
      logSection('4️⃣  Deploy TaxHandler');
      const TaxHandler = await hre.ethers.getContractFactory("TaxHandler");
      const taxHandlerAddress = await deployWithTimeout(TaxHandler, [liptTokenAddress], 'TaxHandler');
      deploymentAddresses.taxHandler = taxHandlerAddress;
    }
    
    // 5. Swap Pool
    let swapPoolAddress = deploymentAddresses.swapPool;
    if (contractsToDeploy.find(c => c.key === 'swapPool')) {
      logSection('5️⃣  Deploy DevAdrianSwapPool');
      const DevAdrianSwapPool = await hre.ethers.getContractFactory("DevAdrianSwapPool");
      swapPoolAddress = await deployWithTimeout(DevAdrianSwapPool, [liptTokenAddress, mockUSDTAddress], 'DevAdrianSwapPool');
      deploymentAddresses.swapPool = swapPoolAddress;
    } else if (swapPoolAddress) {
      log(`✅ DevAdrianSwapPool: Reutilizando ${swapPoolAddress}`, 'green');
    }
    
    // 6. Staking Pool
    let stakingPoolAddress = deploymentAddresses.stakingPool;
    if (contractsToDeploy.find(c => c.key === 'stakingPool')) {
      logSection('6️⃣  Deploy StakingPool');
      const StakingPool = await hre.ethers.getContractFactory("StakingPool");
      stakingPoolAddress = await deployWithTimeout(StakingPool, [liptTokenAddress], 'StakingPool');
      deploymentAddresses.stakingPool = stakingPoolAddress;
    } else if (stakingPoolAddress) {
      log(`✅ StakingPool: Reutilizando ${stakingPoolAddress}`, 'green');
    }
    
    // 7. Mining Pool
    let miningPoolAddress = deploymentAddresses.miningPool;
    if (contractsToDeploy.find(c => c.key === 'miningPool')) {
      logSection('7️⃣  Deploy MiningPool');
      const MiningPool = await hre.ethers.getContractFactory("MiningPool");
      miningPoolAddress = await deployWithTimeout(MiningPool, [liptTokenAddress], 'MiningPool');
      deploymentAddresses.miningPool = miningPoolAddress;
    } else if (miningPoolAddress) {
      log(`✅ MiningPool: Reutilizando ${miningPoolAddress}`, 'green');
    }
    
    // 8. Referral Program
    let referralProgramAddress = deploymentAddresses.referralProgram;
    if (contractsToDeploy.find(c => c.key === 'referralProgram')) {
      logSection('8️⃣  Deploy ReferralProgram');
      const ReferralProgram = await hre.ethers.getContractFactory("ReferralProgram");
      referralProgramAddress = await deployWithTimeout(ReferralProgram, [liptTokenAddress], 'ReferralProgram');
      deploymentAddresses.referralProgram = referralProgramAddress;
    } else if (referralProgramAddress) {
      log(`✅ ReferralProgram: Reutilizando ${referralProgramAddress}`, 'green');
    }
    
    // 9. Wheel of Fortune
    let wheelOfFortuneAddress = deploymentAddresses.wheelOfFortune;
    if (contractsToDeploy.find(c => c.key === 'wheelOfFortune')) {
      logSection('9️⃣  Deploy WheelOfFortune');
      const WheelOfFortune = await hre.ethers.getContractFactory("WheelOfFortune");
      wheelOfFortuneAddress = await deployWithTimeout(WheelOfFortune, [liptTokenAddress], 'WheelOfFortune');
      deploymentAddresses.wheelOfFortune = wheelOfFortuneAddress;
    } else if (wheelOfFortuneAddress) {
      log(`✅ WheelOfFortune: Reutilizando ${wheelOfFortuneAddress}`, 'green');
    }
    
    // 10. Rocket Game
    let rocketGameAddress = deploymentAddresses.rocketGame;
    if (contractsToDeploy.find(c => c.key === 'rocketGame')) {
      logSection('🔟 Deploy RocketGame');
      const RocketGame = await hre.ethers.getContractFactory("RocketGame");
      rocketGameAddress = await deployWithTimeout(RocketGame, [liptTokenAddress], 'RocketGame');
      deploymentAddresses.rocketGame = rocketGameAddress;
    } else if (rocketGameAddress) {
      log(`✅ RocketGame: Reutilizando ${rocketGameAddress}`, 'green');
    }
    
    // 11. Lottery
    let lotteryAddress = deploymentAddresses.lottery;
    if (contractsToDeploy.find(c => c.key === 'lottery')) {
      logSection('1️⃣1️⃣ Deploy Lottery');
      const Lottery = await hre.ethers.getContractFactory("Lottery");
      lotteryAddress = await deployWithTimeout(Lottery, [liptTokenAddress], 'Lottery');
      deploymentAddresses.lottery = lotteryAddress;
    } else if (lotteryAddress) {
      log(`✅ Lottery: Reutilizando ${lotteryAddress}`, 'green');
    }
    
    // Garantir que temos todos os endereços necessários
    const protocolControllerAddress = deploymentAddresses.protocolController;
    const taxHandlerAddress = deploymentAddresses.taxHandler;
    
    if (!protocolControllerAddress || !taxHandlerAddress || !liptTokenAddress || !swapPoolAddress) {
      throw new Error('Faltam endereços essenciais para configuração pós-deploy');
    }
    
    // ============================================================================
    // CONFIGURAÇÃO PÓS-DEPLOY (só se ProtocolController foi deployado/atualizado)
    // ============================================================================
    if (contractsToDeploy.find(c => c.key === 'protocolController') || 
        contractsReused.find(c => c.key === 'protocolController')) {
      
      logSection('⚙️  Configuração Pós-Deploy');
      
      // Verificar se ProtocolController existe
      const protocolControllerCode = await hre.ethers.provider.getCode(protocolControllerAddress);
      if (!protocolControllerCode || protocolControllerCode === "0x") {
        log(`⚠️  ProtocolController não existe ainda. Pulando configuração.`, 'yellow');
      } else {
        log("   Configurando ProtocolController com endereços...", 'yellow');
        
        const ProtocolControllerFactory = await hre.ethers.getContractFactory("ProtocolController");
        const protocolController = await ProtocolControllerFactory.attach(protocolControllerAddress);
        
        const tx1 = await protocolController.setLiptToken(liptTokenAddress);
        await waitForConfirmations(tx1.hash);
        const tx2 = await protocolController.setSwapPool(swapPoolAddress);
        await waitForConfirmations(tx2.hash);
        if (stakingPoolAddress) {
          const tx3 = await protocolController.setStakingPool(stakingPoolAddress);
          await waitForConfirmations(tx3.hash);
        }
        if (miningPoolAddress) {
          const tx4 = await protocolController.setMiningPool(miningPoolAddress);
          await waitForConfirmations(tx4.hash);
        }
        if (referralProgramAddress) {
          const tx5 = await protocolController.setReferralProgram(referralProgramAddress);
          await waitForConfirmations(tx5.hash);
        }
        if (wheelOfFortuneAddress) {
          const tx6 = await protocolController.setWheelOfFortune(wheelOfFortuneAddress);
          await waitForConfirmations(tx6.hash);
        }
        if (rocketGameAddress) {
          const tx7 = await protocolController.setRocketGame(rocketGameAddress);
          await waitForConfirmations(tx7.hash);
        }
        if (lotteryAddress) {
          const tx8 = await protocolController.setLottery(lotteryAddress);
          await waitForConfirmations(tx8.hash);
        }
        log("   ✅ ProtocolController configurado!", 'green');
      }
    }
    
    // Configurar TaxHandler se foi deployado
    if (taxHandlerAddress) {
      const taxHandlerCode = await hre.ethers.provider.getCode(taxHandlerAddress);
      if (taxHandlerCode && taxHandlerCode !== "0x" && swapPoolAddress) {
        log("   Configurando TaxHandler...", 'yellow');
        const TaxHandler = await hre.ethers.getContractFactory("TaxHandler");
        const taxHandler = await TaxHandler.attach(taxHandlerAddress);
        const tx9 = await taxHandler.setLiquidityPoolAddress(swapPoolAddress);
        await waitForConfirmations(tx9.hash);
        log("   ✅ TaxHandler configurado!", 'green');
      }
    }
    
    // Salvar endereços atualizados
    await saveDeploymentAddresses(deploymentAddresses);
    
    logSection('✅ DEPLOY INTELIGENTE CONCLUÍDO!');
    log('\n📋 ENDEREÇOS FINAIS:\n', 'cyan');
    Object.entries(deploymentAddresses).forEach(([name, address]) => {
      log(`   ${name.padEnd(25)}: ${address}`, 'green');
    });
    
    log('\n🔗 Links do Polygonscan:\n', 'cyan');
    Object.entries(deploymentAddresses).forEach(([name, address]) => {
      log(`   ${name}: https://polygonscan.com/address/${address}`, 'blue');
    });
    
    log('\n✅ Deploy inteligente concluído!', 'green');
    log('⚠️  IMPORTANTE: Atualize os endereços em src/config/contracts.ts', 'yellow');
    
  } catch (error) {
    log(`\n❌ ERRO durante o deploy: ${error.message}`, 'red');
    console.error(error);
    
    if (Object.keys(deploymentAddresses).length > 0) {
      log('\n💾 Salvando endereços parciais...', 'yellow');
      await saveDeploymentAddresses(deploymentAddresses);
    }
    
    process.exitCode = 1;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
