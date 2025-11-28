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
        
        // Verificar se é uma criação de contrato (to é null ou undefined)
        const isContractCreation = !tx.to || tx.to === null;
        
        if (isContractCreation) {
          console.log('ℹ️  Esta é uma transação de criação de contrato');
          console.log('   Para criação de contrato, não é possível usar provider.call()');
          console.log('   Verifique o erro nos logs do Hardhat ou no Polygonscan');
        } else {
          // Construir objeto de transação no formato correto para provider.call()
          // Remover campos undefined/null
          const callTx = {
            to: tx.to,
            from: tx.from,
            data: tx.data || "0x",
            value: tx.value || 0,
          };
          
          // Adicionar gasLimit apenas se disponível
          if (tx.gasLimit) {
            callTx.gasLimit = tx.gasLimit;
          } else if (tx.gas) {
            callTx.gasLimit = tx.gas;
          }
          
          // Tentar fazer a chamada novamente para ver o erro (no bloco anterior ao que falhou)
          const blockNumber = receipt.blockNumber > 0 ? receipt.blockNumber - 1 : "latest";
          try {
            const result = await hre.ethers.provider.call(callTx, blockNumber);
            console.log(`✅ Call bem-sucedido. Resultado: ${result}`);
          } catch (callError) {
            // O erro pode conter a mensagem de revert
            console.log(`⚠️  Erro ao chamar: ${callError.message}`);
            
            // Tentar extrair mensagem de revert se disponível
            if (callError.reason) {
              console.log(`   Razão do revert: ${callError.reason}`);
            }
            if (callError.data && callError.data !== callError.message) {
              console.log(`   Dados do erro: ${callError.data}`);
            }
            
            // Tentar decodificar erro se for um revert customizado
            if (callError.error) {
              console.log(`   Erro detalhado: ${JSON.stringify(callError.error, null, 2)}`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️  Erro ao obter detalhes: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
        }
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

