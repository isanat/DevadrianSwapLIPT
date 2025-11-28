/**
 * Script de Deploy Completo - DevAdrian Swap
 * 
 * Este script faz o deploy de TODOS os contratos revisados e completos,
 * seguindo boas práticas de segurança e organização.
 * 
 * Execute: npx hardhat run scripts/deploy-complete.cjs --network mainnet
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

async function verifyContract(name, address, constructorArgs = []) {
  try {
    log(`\n🔍 Verificando contrato ${name}...`, 'yellow');
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    log(`✅ ${name} verificado com sucesso!`, 'green');
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      log(`ℹ️  ${name} já está verificado`, 'blue');
      return true;
    }
    log(`⚠️  Erro ao verificar ${name}: ${error.message}`, 'yellow');
    return false;
  }
}

async function waitForConfirmations(txHash, confirmations = 1) {
  log(`   ⏳ Aguardando ${confirmations} confirmação(ões)...`, 'yellow');
  try {
    const receipt = await hre.ethers.provider.waitForTransaction(txHash, confirmations, 120000); // timeout 2 minutos
    log(`   ✅ Transação confirmada! Hash: ${txHash}`, 'green');
    return receipt;
  } catch (error) {
    log(`   ❌ Erro ao aguardar confirmações: ${error.message}`, 'red');
    throw error;
  }
}

async function deployWithTimeout(contractFactory, constructorArgs, contractName, timeout = 120000) {
  log(`   Deployando ${contractName}...`, 'yellow');
  const deployTx = await contractFactory.deploy(...constructorArgs);
  const txHash = await deployTx.deploymentTransaction()?.hash;
  log(`   ✅ Transação enviada! Hash: ${txHash || 'pending'}`, 'green');
  if (txHash) {
    log(`   🔗 Ver: https://polygonscan.com/tx/${txHash}`, 'cyan');
  }
  log(`   ⏳ Aguardando confirmação (máximo ${timeout/1000}s)...`, 'yellow');
  
  try {
    await deployTx.waitForDeployment({ timeout });
    const address = await deployTx.getAddress();
    log(`   ✅ ${contractName} confirmado em: ${address}`, 'green');
    return address;
  } catch (error) {
    log(`   ⚠️  Timeout aguardando confirmação de ${contractName}.`, 'yellow');
    if (txHash) {
      log(`   🔗 Verifique: https://polygonscan.com/tx/${txHash}`, 'cyan');
    }
    // Tentar obter endereço mesmo assim
    try {
      const address = await deployTx.getAddress();
      log(`   ✅ Endereço obtido: ${address}`, 'green');
      return address;
    } catch (e) {
      log(`   ❌ Não foi possível obter endereço. Erro: ${e.message}`, 'red');
      throw new Error(`${contractName} deployment failed. Check: https://polygonscan.com/tx/${txHash || 'N/A'}`);
    }
  }
}

async function saveDeploymentAddresses(addresses) {
  const deploymentFile = path.join(__dirname, '../deployment-addresses.json');
  const deploymentData = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    addresses: addresses
  };
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  log(`\n📝 Endereços salvos em: ${deploymentFile}`, 'cyan');
}

async function main() {
  logSection('🚀 INICIANDO DEPLOY COMPLETO - DevAdrian Swap');
  
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  
  log(`💰 Deployer: ${deployerAddress}`, 'cyan');
  log(`💰 Saldo: ${hre.ethers.formatEther(balance)} POL`, 'cyan');
  
  if (balance < hre.ethers.parseEther("0.1")) {
    log("⚠️  AVISO: Saldo baixo! Pode não ser suficiente para todos os deploys.", 'yellow');
  }
  
  const deploymentAddresses = {};
  
  try {
    // ============================================================================
    // 1. DEPLOY MOCKUSDT
    // ============================================================================
    logSection('1️⃣  Deploy MockUSDT');
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const initialSupply = hre.ethers.parseUnits("1000000000", 18); // 1 bilhão
    const mockUSDTAddress = await deployWithTimeout(MockUSDT, [initialSupply], 'MockUSDT');
    deploymentAddresses.mockUsdt = mockUSDTAddress;
    const mockUSDT = await MockUSDT.attach(mockUSDTAddress);
    
    // ============================================================================
    // 2. DEPLOY LIPT TOKEN
    // ============================================================================
    logSection('2️⃣  Deploy LIPT Token');
    const LIPTToken = await hre.ethers.getContractFactory("LIPTToken");
    const liptInitialSupply = hre.ethers.parseUnits("1000000000", 18); // 1 bilhão
    const liptTokenAddress = await deployWithTimeout(LIPTToken, [liptInitialSupply], 'LIPTToken');
    deploymentAddresses.liptToken = liptTokenAddress;
    
    // ============================================================================
    // 3. DEPLOY PROTOCOL CONTROLLER (COM FUNÇÕES PROXY)
    // ============================================================================
    logSection('3️⃣  Deploy ProtocolController (Com Funções Proxy)');
    const ProtocolController = await hre.ethers.getContractFactory("ProtocolController");
    const protocolControllerAddress = await deployWithTimeout(ProtocolController, [], 'ProtocolController');
    deploymentAddresses.protocolController = protocolControllerAddress;
    const protocolController = await ProtocolController.attach(protocolControllerAddress);
    
    // ============================================================================
    // 4. DEPLOY TAX HANDLER
    // ============================================================================
    logSection('4️⃣  Deploy TaxHandler');
    const TaxHandler = await hre.ethers.getContractFactory("TaxHandler");
    const taxHandlerAddress = await deployWithTimeout(TaxHandler, [liptTokenAddress], 'TaxHandler');
    deploymentAddresses.taxHandler = taxHandlerAddress;
    const taxHandler = await TaxHandler.attach(taxHandlerAddress);
    
    // ============================================================================
    // 5. DEPLOY SWAP POOL
    // ============================================================================
    logSection('5️⃣  Deploy DevAdrianSwapPool');
    const DevAdrianSwapPool = await hre.ethers.getContractFactory("DevAdrianSwapPool");
    const swapPoolAddress = await deployWithTimeout(DevAdrianSwapPool, [liptTokenAddress, deploymentAddresses.mockUsdt], 'DevAdrianSwapPool');
    deploymentAddresses.swapPool = swapPoolAddress;
    const swapPool = await DevAdrianSwapPool.attach(swapPoolAddress);
    
    // ============================================================================
    // 6. DEPLOY STAKING POOL
    // ============================================================================
    logSection('6️⃣  Deploy StakingPool');
    const StakingPool = await hre.ethers.getContractFactory("StakingPool");
    const stakingPoolAddress = await deployWithTimeout(StakingPool, [liptTokenAddress], 'StakingPool');
    deploymentAddresses.stakingPool = stakingPoolAddress;
    const stakingPool = await StakingPool.attach(stakingPoolAddress);
    
    // ============================================================================
    // 7. DEPLOY MINING POOL
    // ============================================================================
    logSection('7️⃣  Deploy MiningPool');
    const MiningPool = await hre.ethers.getContractFactory("MiningPool");
    const miningPoolAddress = await deployWithTimeout(MiningPool, [liptTokenAddress], 'MiningPool');
    deploymentAddresses.miningPool = miningPoolAddress;
    const miningPool = await MiningPool.attach(miningPoolAddress);
    
    // ============================================================================
    // 8. DEPLOY REFERRAL PROGRAM
    // ============================================================================
    logSection('8️⃣  Deploy ReferralProgram');
    const ReferralProgram = await hre.ethers.getContractFactory("ReferralProgram");
    const referralProgramAddress = await deployWithTimeout(ReferralProgram, [liptTokenAddress], 'ReferralProgram');
    deploymentAddresses.referralProgram = referralProgramAddress;
    const referralProgram = await ReferralProgram.attach(referralProgramAddress);
    
    // ============================================================================
    // 9. DEPLOY WHEEL OF FORTUNE
    // ============================================================================
    logSection('9️⃣  Deploy WheelOfFortune');
    const WheelOfFortune = await hre.ethers.getContractFactory("WheelOfFortune");
    const wheelOfFortuneAddress = await deployWithTimeout(WheelOfFortune, [liptTokenAddress], 'WheelOfFortune');
    deploymentAddresses.wheelOfFortune = wheelOfFortuneAddress;
    const wheelOfFortune = await WheelOfFortune.attach(wheelOfFortuneAddress);
    
    // ============================================================================
    // 10. DEPLOY ROCKET GAME
    // ============================================================================
    logSection('🔟 Deploy RocketGame');
    const RocketGame = await hre.ethers.getContractFactory("RocketGame");
    const rocketGameAddress = await deployWithTimeout(RocketGame, [liptTokenAddress], 'RocketGame');
    deploymentAddresses.rocketGame = rocketGameAddress;
    const rocketGame = await RocketGame.attach(rocketGameAddress);
    
    // ============================================================================
    // 11. DEPLOY LOTTERY
    // ============================================================================
    logSection('1️⃣1️⃣ Deploy Lottery');
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lotteryAddress = await deployWithTimeout(Lottery, [liptTokenAddress], 'Lottery');
    deploymentAddresses.lottery = lotteryAddress;
    const lottery = await Lottery.attach(lotteryAddress);
    
    // ============================================================================
    // 12. CONFIGURAÇÃO PÓS-DEPLOY
    // ============================================================================
    logSection('⚙️  Configuração Pós-Deploy');
    
    // 12.1. Configurar ProtocolController
    log("   Configurando ProtocolController com endereços...", 'yellow');
    const protocolController = await ProtocolController.attach(protocolControllerAddress);
    const tx1 = await protocolController.setLiptToken(liptTokenAddress);
    await waitForConfirmations(tx1.hash);
    const tx2 = await protocolController.setSwapPool(swapPoolAddress);
    await waitForConfirmations(tx2.hash);
    const tx3 = await protocolController.setStakingPool(stakingPoolAddress);
    await waitForConfirmations(tx3.hash);
    const tx4 = await protocolController.setMiningPool(miningPoolAddress);
    await waitForConfirmations(tx4.hash);
    const tx5 = await protocolController.setReferralProgram(referralProgramAddress);
    await waitForConfirmations(tx5.hash);
    const tx6 = await protocolController.setWheelOfFortune(wheelOfFortuneAddress);
    await waitForConfirmations(tx6.hash);
    const tx7 = await protocolController.setRocketGame(rocketGameAddress);
    await waitForConfirmations(tx7.hash);
    const tx8 = await protocolController.setLottery(lotteryAddress);
    await waitForConfirmations(tx8.hash);
    log("   ✅ ProtocolController configurado!", 'green');
    
    // 12.2. Configurar TaxHandler
    log("   Configurando TaxHandler...", 'yellow');
    const taxHandler = await TaxHandler.attach(taxHandlerAddress);
    const tx9 = await taxHandler.setLiquidityPoolAddress(swapPoolAddress);
    await waitForConfirmations(tx9.hash);
    log("   ✅ TaxHandler configurado!", 'green');
    
    // 12.3. Transferir Ownership para ProtocolController
    log("   Transferindo ownership dos contratos para ProtocolController...", 'yellow');
    const tx10 = await liptToken.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx10.hash);
    const tx11 = await swapPool.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx11.hash);
    const tx12 = await stakingPool.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx12.hash);
    const tx13 = await miningPool.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx13.hash);
    const tx14 = await referralProgram.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx14.hash);
    const tx15 = await wheelOfFortune.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx15.hash);
    const tx16 = await rocketGame.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx16.hash);
    const tx17 = await lottery.transferOwnership(protocolControllerAddress);
    await waitForConfirmations(tx17.hash);
    log("   ✅ Ownership transferido para ProtocolController!", 'green');
    
    // ============================================================================
    // 13. SALVAR ENDEREÇOS
    // ============================================================================
    logSection('💾 Salvando Endereços');
    await saveDeploymentAddresses(deploymentAddresses);
    
    // ============================================================================
    // 14. RESUMO FINAL
    // ============================================================================
    logSection('✅ DEPLOY COMPLETO!');
    log('\n📋 RESUMO DOS ENDEREÇOS:\n', 'cyan');
    Object.entries(deploymentAddresses).forEach(([name, address]) => {
      log(`   ${name.padEnd(25)}: ${address}`, 'green');
    });
    
    log('\n🔗 Links do Polygonscan:\n', 'cyan');
    Object.entries(deploymentAddresses).forEach(([name, address]) => {
      log(`   ${name}: https://polygonscan.com/address/${address}`, 'blue');
    });
    
    log('\n✅ Todos os contratos foram deployados e configurados com sucesso!', 'green');
    log('⚠️  IMPORTANTE: Atualize os endereços em src/config/contracts.ts', 'yellow');
    
  } catch (error) {
    log(`\n❌ ERRO durante o deploy: ${error.message}`, 'red');
    console.error(error);
    
    // Salvar endereços parciais em caso de erro
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

