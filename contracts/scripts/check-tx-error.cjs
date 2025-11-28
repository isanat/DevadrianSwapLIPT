/**
 * Script para verificar o erro de uma transação no Polygonscan
 * Execute: npx hardhat run scripts/check-tx-error.cjs --network mainnet
 */

const hre = require("hardhat");

const TX_HASH = "0x692c8ab485a628efd278ddacdc7551317a98050142051e23f9fcd1fa06526480";

async function main() {
  console.log('\n🔍 VERIFICANDO ERRO NA TRANSAÇÃO\n');
  console.log('='.repeat(80));
  console.log(`Hash: ${TX_HASH}`);
  console.log(`🔗 Polygonscan: https://polygonscan.com/tx/${TX_HASH}\n`);

  try {
    const receipt = await hre.ethers.provider.getTransactionReceipt(TX_HASH);
    
    if (!receipt) {
      console.log('❌ Transação não encontrada ou ainda não foi minerada');
      return;
    }

    console.log(`📊 Status: ${receipt.status === 1 ? '✅ SUCESSO' : '❌ FALHOU'}`);
    console.log(`📦 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);
    console.log(`💰 Gas price: ${receipt.gasPrice?.toString()} wei`);
    
    if (receipt.status === 0) {
      console.log('\n❌ A TRANSAÇÃO FALHOU (REVERTED)\n');
      
      // Tentar obter a razão do revert
      try {
        const tx = await hre.ethers.provider.getTransaction(TX_HASH);
        console.log('🔍 Tentando obter razão do revert...');
        
        // Tentar fazer a chamada novamente para ver o erro
        const code = await hre.ethers.provider.call(tx);
        console.log(`Code retornado: ${code}`);
      } catch (error) {
        console.log(`⚠️  Erro ao obter detalhes: ${error.message}`);
      }
      
      console.log('\n💡 POSSÍVEIS CAUSAS:');
      console.log('   1. Gas insuficiente');
      console.log('   2. Erro no construtor do contrato');
      console.log('   3. Contrato muito grande (limite de 24KB)');
      console.log('   4. Problema na compilação');
      
    } else {
      console.log('\n✅ TRANSAÇÃO FOI BEM-SUCEDIDA\n');
      console.log(`📄 Contrato criado: ${receipt.contractAddress || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar transação:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

