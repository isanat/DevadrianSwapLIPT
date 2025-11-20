/**
 * Blockchain Event Listener Service
 * 
 * Este serviço escuta eventos emitidos pelos contratos inteligentes
 * e os salva no banco de dados para consulta posterior.
 * 
 * Para executar este serviço:
 * 1. Como script standalone: `node --loader ts-node/esm src/services/blockchain/event-listener.ts`
 * 2. Como cron job: Adicionar ao crontab ou usar node-cron
 * 3. Como serviço systemd: Criar um arquivo .service
 */

import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import { CONTRACT_ADDRESSES } from '../../config/contracts';

// Cliente público para ler eventos
const publicClient = createPublicClient({
  chain: polygon,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'),
});

// Tipos de eventos que queremos escutar
const EVENTS_TO_WATCH = [
  // Staking Pool
  {
    contractAddress: CONTRACT_ADDRESSES.stakingPool,
    eventName: 'Stake',
    abi: parseAbiItem('event Stake(address indexed user, uint256 stakeId, uint256 amount, uint256 duration)'),
  },
  {
    contractAddress: CONTRACT_ADDRESSES.stakingPool,
    eventName: 'Unstake',
    abi: parseAbiItem('event Unstake(address indexed user, uint256 stakeId, uint256 amount, uint256 penalty)'),
  },
  {
    contractAddress: CONTRACT_ADDRESSES.stakingPool,
    eventName: 'RewardClaimed',
    abi: parseAbiItem('event RewardClaimed(address indexed user, uint256 amount)'),
  },
  // Mining Pool
  {
    contractAddress: CONTRACT_ADDRESSES.miningPool,
    eventName: 'MinerActivated',
    abi: parseAbiItem('event MinerActivated(address indexed user, uint256 minerId, uint256 cost, uint256 power)'),
  },
  {
    contractAddress: CONTRACT_ADDRESSES.miningPool,
    eventName: 'RewardsClaimed',
    abi: parseAbiItem('event RewardsClaimed(address indexed user, uint256 amount)'),
  },
  // Wheel of Fortune
  {
    contractAddress: CONTRACT_ADDRESSES.wheelOfFortune,
    eventName: 'WheelSpun',
    abi: parseAbiItem('event WheelSpun(address indexed player, uint256 betAmount, uint256 multiplier, uint256 winnings)'),
  },
  // Rocket Game
  {
    contractAddress: CONTRACT_ADDRESSES.rocketGame,
    eventName: 'RocketPlayed',
    abi: parseAbiItem('event RocketPlayed(address indexed player, uint256 betIndex, uint256 betAmount, uint256 crashPoint)'),
  },
  {
    contractAddress: CONTRACT_ADDRESSES.rocketGame,
    eventName: 'RocketCashedOut',
    abi: parseAbiItem('event RocketCashedOut(address indexed player, uint256 betIndex, uint256 multiplier, uint256 winnings)'),
  },
  // Lottery
  {
    contractAddress: CONTRACT_ADDRESSES.lottery,
    eventName: 'TicketsPurchased',
    abi: parseAbiItem('event TicketsPurchased(address indexed player, uint256 quantity, uint256 drawId)'),
  },
  {
    contractAddress: CONTRACT_ADDRESSES.lottery,
    eventName: 'PrizeClaimed',
    abi: parseAbiItem('event PrizeClaimed(address indexed player, uint256 drawId, uint256 amount)'),
  },
  // Referral Program
  {
    contractAddress: CONTRACT_ADDRESSES.referralProgram,
    eventName: 'ReferralReward',
    abi: parseAbiItem('event ReferralReward(address indexed referrer, address indexed referee, uint256 amount, uint256 level)'),
  },
];

/**
 * Envia um evento para a API para ser salvo no banco de dados
 */
async function saveEventToDatabase(eventData: any) {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.error('Failed to save event:', await response.text());
    } else {
      console.log('Event saved:', eventData.eventName);
    }
  } catch (error) {
    console.error('Error saving event to database:', error);
  }
}

/**
 * Escuta eventos de um contrato específico
 */
async function watchContractEvents(contractAddress: string, eventName: string, abi: any) {
  console.log(`Watching ${eventName} events from ${contractAddress}...`);

  // Escutar novos eventos em tempo real
  const unwatch = publicClient.watchEvent({
    address: contractAddress as any,
    event: abi,
    onLogs: async (logs) => {
      for (const log of logs) {
        const eventData = {
          eventName,
          contractAddress,
          blockNumber: log.blockNumber.toString(),
          transactionHash: log.transactionHash,
          args: log.args,
        };

        console.log('New event:', eventData);
        await saveEventToDatabase(eventData);
      }
    },
  });

  return unwatch;
}

/**
 * Busca eventos históricos de um contrato
 */
async function fetchHistoricalEvents(contractAddress: string, eventName: string, abi: any, fromBlock: bigint) {
  console.log(`Fetching historical ${eventName} events from block ${fromBlock}...`);

  try {
    const logs = await publicClient.getLogs({
      address: contractAddress as any,
      event: abi,
      fromBlock,
      toBlock: 'latest',
    });

    console.log(`Found ${logs.length} historical ${eventName} events`);

    for (const log of logs) {
      const eventData = {
        eventName,
        contractAddress,
        blockNumber: log.blockNumber.toString(),
        transactionHash: log.transactionHash,
        args: log.args,
      };

      await saveEventToDatabase(eventData);
    }
  } catch (error) {
    console.error(`Error fetching historical ${eventName} events:`, error);
  }
}

/**
 * Inicia o listener de eventos
 */
export async function startEventListener() {
  console.log('Starting blockchain event listener...');

  // Buscar eventos históricos dos últimos 1000 blocos
  const currentBlock = await publicClient.getBlockNumber();
  const fromBlock = currentBlock - 1000n;

  for (const event of EVENTS_TO_WATCH) {
    // Buscar eventos históricos
    await fetchHistoricalEvents(event.contractAddress, event.eventName, event.abi, fromBlock);

    // Iniciar escuta de novos eventos
    await watchContractEvents(event.contractAddress, event.eventName, event.abi);
  }

  console.log('Event listener started successfully!');
}

/**
 * Para o listener de eventos
 */
export function stopEventListener() {
  console.log('Stopping blockchain event listener...');
  // TODO: Implementar lógica de parada
}

// Se executado diretamente (não importado)
if (require.main === module) {
  startEventListener().catch(console.error);
}
