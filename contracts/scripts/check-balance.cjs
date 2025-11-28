/**
 * Script para verificar saldo POL antes do deploy
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const address = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(address);
  
  console.log(`\n💰 Deployer Address: ${address}`);
  console.log(`💰 Saldo: ${hre.ethers.formatEther(balance)} POL\n`);
  
  const minBalance = hre.ethers.parseEther("1"); // Mínimo 1 POL recomendado
  if (balance < minBalance) {
    console.log(`⚠️  AVISO: Saldo baixo! Recomendado: pelo menos 1 POL`);
    console.log(`   Saldo atual: ${hre.ethers.formatEther(balance)} POL\n`);
  } else {
    console.log(`✅ Saldo suficiente para deploy!\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

