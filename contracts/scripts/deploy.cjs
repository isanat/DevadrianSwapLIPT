const hre = require("hardhat");

async function main() {
  // 1. Deploy MockUSDT (Simulação de USDT)
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy(hre.ethers.parseUnits("1000000000", 18));
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log(`MockUSDT deployed to: ${mockUSDTAddress}`);

  // 2. Deploy LIPTToken
  // Fornecimento inicial: 1 bilhão de tokens (com 18 decimais)
  const initialSupply = hre.ethers.parseUnits("1000000000", 18);
  const LIPTToken = await hre.ethers.getContractFactory("LIPTToken");
  const liptToken = await LIPTToken.deploy(initialSupply);
  await liptToken.waitForDeployment();
  const liptTokenAddress = await liptToken.getAddress();
  console.log(`LIPTToken deployed to: ${liptTokenAddress}`);

  // 3. Deploy ProtocolController
  const ProtocolController = await hre.ethers.getContractFactory("ProtocolController");
  const controller = await ProtocolController.deploy();
  await controller.waitForDeployment();
  const controllerAddress = await controller.getAddress();
  console.log(`ProtocolController deployed to: ${controllerAddress}`);

  // 4. Deploy TaxHandler
  const TaxHandler = await hre.ethers.getContractFactory("TaxHandler");
  const taxHandler = await TaxHandler.deploy(liptTokenAddress);
  await taxHandler.waitForDeployment();
  const taxHandlerAddress = await taxHandler.getAddress();
  console.log(`TaxHandler deployed to: ${taxHandlerAddress}`);

  // 5. Deploy DevAdrianSwapPool
  const DevAdrianSwapPool = await hre.ethers.getContractFactory("DevAdrianSwapPool");
  const swapPool = await DevAdrianSwapPool.deploy(liptTokenAddress, mockUSDTAddress);
  await swapPool.waitForDeployment();
  const swapPoolAddress = await swapPool.getAddress();
  console.log(`DevAdrianSwapPool deployed to: ${swapPoolAddress}`);

  // 6. Deploy StakingPool
  const StakingPool = await hre.ethers.getContractFactory("StakingPool");
  const stakingPool = await StakingPool.deploy(liptTokenAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log(`StakingPool deployed to: ${stakingPoolAddress}`);

  // 7. Deploy MiningPool
  const MiningPool = await hre.ethers.getContractFactory("MiningPool");
  const miningPool = await MiningPool.deploy(liptTokenAddress);
  await miningPool.waitForDeployment();
  const miningPoolAddress = await miningPool.getAddress();
  console.log(`MiningPool deployed to: ${miningPoolAddress}`);

  // 8. Deploy ReferralProgram
  const ReferralProgram = await hre.ethers.getContractFactory("ReferralProgram");
  const referralProgram = await ReferralProgram.deploy(liptTokenAddress);
  await referralProgram.waitForDeployment();
  const referralProgramAddress = await referralProgram.getAddress();
  console.log(`ReferralProgram deployed to: ${referralProgramAddress}`);

  // 9. Deploy WheelOfFortune
  const WheelOfFortune = await hre.ethers.getContractFactory("WheelOfFortune");
  const wheelOfFortune = await WheelOfFortune.deploy(liptTokenAddress);
  await wheelOfFortune.waitForDeployment();
  const wheelOfFortuneAddress = await wheelOfFortune.getAddress();
  console.log(`WheelOfFortune deployed to: ${wheelOfFortuneAddress}`);

  // 10. Deploy RocketGame
  const RocketGame = await hre.ethers.getContractFactory("RocketGame");
  const rocketGame = await RocketGame.deploy(liptTokenAddress);
  await rocketGame.waitForDeployment();
  const rocketGameAddress = await rocketGame.getAddress();
  console.log(`RocketGame deployed to: ${rocketGameAddress}`);

  // 11. Deploy Lottery
  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(liptTokenAddress);
  await lottery.waitForDeployment();
  const lotteryAddress = await lottery.getAddress();
  console.log(`Lottery deployed to: ${lotteryAddress}`);

  // --- Configuração Pós-Implantação (Post-Deployment Configuration) ---

  console.log("\n--- Starting Post-Deployment Configuration ---");

  // 1. Configurar o ProtocolController com os endereços dos contratos
  console.log("Setting ProtocolController addresses...");
  await controller.setLiptToken(liptTokenAddress);
  await controller.setSwapPool(swapPoolAddress);
  await controller.setStakingPool(stakingPoolAddress);
  await controller.setMiningPool(miningPoolAddress);
  await controller.setReferralProgram(referralProgramAddress);
  await controller.setWheelOfFortune(wheelOfFortuneAddress);
  await controller.setRocketGame(rocketGameAddress);
  await controller.setLottery(lotteryAddress);
  console.log("ProtocolController configured.");

  // 2. Configurar o LIPTToken para excluir o TaxHandler da taxa (se necessário)
  // Como o TaxHandler usa safeTransferFrom, o LIPTToken não precisa saber dele.

  // 3. Configurar o TaxHandler com o endereço do SwapPool para a taxa LP
  console.log("Setting TaxHandler Liquidity Pool address...");
  await taxHandler.setLiquidityPoolAddress(swapPoolAddress);
  console.log("TaxHandler configured.");

  // 4. Transferir a propriedade dos contratos para o ProtocolController
  // Isso permite que o Owner (via Controller) gerencie os contratos.
  console.log("Transferring ownership to ProtocolController...");
  await liptToken.transferOwnership(controllerAddress);
  await swapPool.transferOwnership(controllerAddress);
  await stakingPool.transferOwnership(controllerAddress);
  await miningPool.transferOwnership(controllerAddress);
  await referralProgram.transferOwnership(controllerAddress);
  await wheelOfFortune.transferOwnership(controllerAddress);
  await rocketGame.transferOwnership(controllerAddress);
  await lottery.transferOwnership(controllerAddress);
  console.log("Ownership transferred to ProtocolController.");

  console.log("\nDeployment and Configuration Complete!");
  console.log("Please save the following addresses for frontend integration:");
  console.log(`LIPTToken: ${liptTokenAddress}`);
  console.log(`MockUSDT: ${mockUSDTAddress}`);
  console.log(`ProtocolController: ${controllerAddress}`);
  console.log(`TaxHandler: ${taxHandlerAddress}`);
  console.log(`DevAdrianSwapPool: ${swapPoolAddress}`);
  console.log(`StakingPool: ${stakingPoolAddress}`);
  console.log(`MiningPool: ${miningPoolAddress}`);
  console.log(`ReferralProgram: ${referralProgramAddress}`);
  console.log(`WheelOfFortune: ${wheelOfFortuneAddress}`);
  console.log(`RocketGame: ${rocketGameAddress}`);
  console.log(`Lottery: ${lotteryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
