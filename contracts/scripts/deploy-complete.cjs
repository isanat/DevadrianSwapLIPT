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
  const receipt = await hre.ethers.provider.waitForTransaction(txHash, confirmations);
  log(`   ✅ Transação confirmada! Hash: ${txHash}`, 'green');
  return receipt;
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
    log("   Deployando MockUSDT...", 'yellow');
    const mockUSDT = await MockUSDT.deploy(initialSupply);
    await mockUSDT.waitForDeployment();
    const mockUSDTAddress = await mockUSDT.getAddress();
    deploymentAddresses.mockUsdt = mockUSDTAddress;
    log(`   ✅ MockUSDT deployado em: ${mockUSDTAddress}`, 'green');
    
    // ============================================================================
    // 2. DEPLOY LIPT TOKEN
    // ============================================================================
    logSection('2️⃣  Deploy LIPT Token');
    const LIPTToken = await hre.ethers.getContractFactory("LIPTToken");
    const liptInitialSupply = hre.ethers.parseUnits("1000000000", 18); // 1 bilhão
    log("   Deployando LIPTToken...", 'yellow');
    const liptToken = await LIPTToken.deploy(liptInitialSupply);
    await liptToken.waitForDeployment();
    const liptTokenAddress = await liptToken.getAddress();
    deploymentAddresses.liptToken = liptTokenAddress;
    log(`   ✅ LIPTToken deployado em: ${liptTokenAddress}`, 'green');
    
    // ============================================================================
    // 3. DEPLOY PROTOCOL CONTROLLER (COM FUNÇÕES PROXY)
    // ============================================================================
    logSection('3️⃣  Deploy ProtocolController (Com Funções Proxy)');
    const ProtocolController = await hre.ethers.getContractFactory("ProtocolController");
    log("   Deployando ProtocolController...", 'yellow');
    const protocolController = await ProtocolController.deploy();
    await protocolController.waitForDeployment();
    const protocolControllerAddress = await protocolController.getAddress();
    deploymentAddresses.protocolController = protocolControllerAddress;
    log(`   ✅ ProtocolController deployado em: ${protocolControllerAddress}`, 'green');
    
    // ============================================================================
    // 4. DEPLOY TAX HANDLER
    // ============================================================================
    logSection('4️⃣  Deploy TaxHandler');
    const TaxHandler = await hre.ethers.getContractFactory("TaxHandler");
    log("   Deployando TaxHandler...", 'yellow');
    const taxHandler = await TaxHandler.deploy(liptTokenAddress);
    await taxHandler.waitForDeployment();
    const taxHandlerAddress = await taxHandler.getAddress();
    deploymentAddresses.taxHandler = taxHandlerAddress;
    log(`   ✅ TaxHandler deployado em: ${taxHandlerAddress}`, 'green');
    
    // ============================================================================
    // 5. DEPLOY SWAP POOL
    // ============================================================================
    logSection('5️⃣  Deploy DevAdrianSwapPool');
    const DevAdrianSwapPool = await hre.ethers.getContractFactory("DevAdrianSwapPool");
    log("   Deployando DevAdrianSwapPool...", 'yellow');
    const swapPool = await DevAdrianSwapPool.deploy(liptTokenAddress, mockUSDTAddress);
    await swapPool.waitForDeployment();
    const swapPoolAddress = await swapPool.getAddress();
    deploymentAddresses.swapPool = swapPoolAddress;
    log(`   ✅ DevAdrianSwapPool deployado em: ${swapPoolAddress}`, 'green');
    
    // ============================================================================
    // 6. DEPLOY STAKING POOL
    // ============================================================================
    logSection('6️⃣  Deploy StakingPool');
    const StakingPool = await hre.ethers.getContractFactory("StakingPool");
    log("   Deployando StakingPool...", 'yellow');
    const stakingPool = await StakingPool.deploy(liptTokenAddress);
    await stakingPool.waitForDeployment();
    const stakingPoolAddress = await stakingPool.getAddress();
    deploymentAddresses.stakingPool = stakingPoolAddress;
    log(`   ✅ StakingPool deployado em: ${stakingPoolAddress}`, 'green');
    
    // ============================================================================
    // 7. DEPLOY MINING POOL
    // ============================================================================
    logSection('7️⃣  Deploy MiningPool');
    const MiningPool = await hre.ethers.getContractFactory("MiningPool");
    log("   Deployando MiningPool...", 'yellow');
    const miningPool = await MiningPool.deploy(liptTokenAddress);
    await miningPool.waitForDeployment();
    const miningPoolAddress = await miningPool.getAddress();
    deploymentAddresses.miningPool = miningPoolAddress;
    log(`   ✅ MiningPool deployado em: ${miningPoolAddress}`, 'green');
    
    // ============================================================================
    // 8. DEPLOY REFERRAL PROGRAM
    // ============================================================================
    logSection('8️⃣  Deploy ReferralProgram');
    const ReferralProgram = await hre.ethers.getContractFactory("ReferralProgram");
    log("   Deployando ReferralProgram...", 'yellow');
    const referralProgram = await ReferralProgram.deploy(liptTokenAddress);
    await referralProgram.waitForDeployment();
    const referralProgramAddress = await referralProgram.getAddress();
    deploymentAddresses.referralProgram = referralProgramAddress;
    log(`   ✅ ReferralProgram deployado em: ${referralProgramAddress}`, 'green');
    
    // ============================================================================
    // 9. DEPLOY WHEEL OF FORTUNE
    // ============================================================================
    logSection('9️⃣  Deploy WheelOfFortune');
    const WheelOfFortune = await hre.ethers.getContractFactory("WheelOfFortune");
    log("   Deployando WheelOfFortune...", 'yellow');
    const wheelOfFortune = await WheelOfFortune.deploy(liptTokenAddress);
    await wheelOfFortune.waitForDeployment();
    const wheelOfFortuneAddress = await wheelOfFortune.getAddress();
    deploymentAddresses.wheelOfFortune = wheelOfFortuneAddress;
    log(`   ✅ WheelOfFortune deployado em: ${wheelOfFortuneAddress}`, 'green');
    
    // ============================================================================
    // 10. DEPLOY ROCKET GAME
    // ============================================================================
    logSection('🔟 Deploy RocketGame');
    const RocketGame = await hre.ethers.getContractFactory("RocketGame");
    log("   Deployando RocketGame...", 'yellow');
    const rocketGame = await RocketGame.deploy(liptTokenAddress);
    await rocketGame.waitForDeployment();
    const rocketGameAddress = await rocketGame.getAddress();
    deploymentAddresses.rocketGame = rocketGameAddress;
    log(`   ✅ RocketGame deployado em: ${rocketGameAddress}`, 'green');
    
    // ============================================================================
    // 11. DEPLOY LOTTERY
    // ============================================================================
    logSection('1️⃣1️⃣ Deploy Lottery');
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    log("   Deployando Lottery...", 'yellow');
    const lottery = await Lottery.deploy(liptTokenAddress);
    await lottery.waitForDeployment();
    const lotteryAddress = await lottery.getAddress();
    deploymentAddresses.lottery = lotteryAddress;
    log(`   ✅ Lottery deployado em: ${lotteryAddress}`, 'green');
    
    // ============================================================================
    // 12. CONFIGURAÇÃO PÓS-DEPLOY
    // ============================================================================
    logSection('⚙️  Configuração Pós-Deploy');
    
    // 12.1. Configurar ProtocolController
    log("   Configurando ProtocolController com endereços...", 'yellow');
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

