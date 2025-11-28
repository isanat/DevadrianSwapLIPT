/**
 * Script para TRANSFERIR ownership dos contratos filhos usando o ProtocolController
 * 
 * Este script usa o ProtocolController atual (que é owner dos contratos filhos)
 * para transferir ownership de volta para sua carteira.
 * 
 * ⚠️ IMPORTANTE: O ProtocolController ATUAL não tem funções proxy!
 * Este script vai falhar, mas mostra o que precisa ser feito.
 * 
 * SOLUÇÃO: Fazer deploy de um novo ProtocolController com funções proxy,
 * transferir ownership dos contratos filhos para ele, e então usar ele para
 * transferir ownership para sua carteira.
 */

const hre = require("hardhat");

const CONTRACT_ADDRESSES = {
  protocolController: '0x5BC8aB3884aFEf2D4c361856Bb24EC286B395263',
  stakingPool: '0x5B9F5e752596b7dFE1123EFdb5b86c2B7b86d8D3',
  miningPool: '0xb56BaAa0f328cf09734862142bF42bA291017a08',
  liptToken: '0x15F6CAfD1fE68B0BCddecb28a739d14dB38947e6',
  swapPool: '0xD22e4AcB94A063e929D0bA0b232475d297EE16c7',
  wheelOfFortune: '0x71aF40Dab1Eb76B0fAcB6A5eeC6B8F27e48d71be',
  rocketGame: '0x1a189De97DfDa1B7231B1aD1E6c1c7c6C8E71dC6',
  lottery: '0x4e67a5c97889863AC0794584f9c6e20F288fF1EA',
  referralProgram: '0x839a9B70FCb941Ce6357C95eacd38a617DaDaE5a',
};

const TARGET_WALLET = '0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903';

async function main() {
  console.log('⚠️  AVISO: Este script requer que o ProtocolController tenha funções proxy!');
  console.log('   O ProtocolController atual NÃO tem essas funções.\n');
  console.log('💡 SOLUÇÃO: Fazer deploy de um novo ProtocolController com funções proxy.\n');
  console.log('='.repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

