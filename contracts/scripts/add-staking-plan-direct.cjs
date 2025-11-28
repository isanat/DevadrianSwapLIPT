/**
 * Script para ADICIONAR plano de staking DIRETAMENTE no contrato
 * 
 * Este script bypassa o problema de ownership chamando diretamente o contrato StakingPool
 * através do ProtocolController usando uma abordagem diferente.
 * 
 * ⚠️ IMPORTANTE: Este script NÃO vai funcionar se você não for owner do contrato StakingPool.
 * Como o owner é o ProtocolController, você precisa que o ProtocolController tenha funções proxy.
 * 
 * SOLUÇÃO ALTERNATIVA: Criar planos via script Hardhat usando a private key do ProtocolController
 * (mas o ProtocolController é um contrato, não uma carteira).
 * 
 * A única solução real é fazer deploy de um novo ProtocolController com funções proxy.
 */

const hre = require("hardhat");

const STAKING_POOL_ADDRESS = '0x5B9F5e752596b7dFE1123EFdb5b86c2B7b86d8D3';

const STAKING_POOL_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_duration', type: 'uint256' },
      { internalType: 'uint256', name: '_apy', type: 'uint256' }
    ],
    name: 'addStakingPlan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function main() {
  console.log('⚠️  Este script NÃO vai funcionar porque você não é owner direto do StakingPool.\n');
  console.log('💡 Solução: Fazer deploy de um novo ProtocolController com funções proxy.\n');
  
  // Este script serve apenas para documentar o problema
  console.log('Para adicionar planos de staking, você precisa:');
  console.log('1. Fazer deploy de um novo ProtocolController com funções proxy');
  console.log('2. Ou transferir ownership dos contratos filhos de volta para sua carteira');
  console.log('3. Ou usar o ProtocolController através de funções proxy');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

