import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/events
 * Registra um evento da blockchain no banco de dados
 * 
 * Body:
 * - eventName: Nome do evento (ex: 'Stake', 'WheelSpun', etc.)
 * - contractAddress: Endereço do contrato que emitiu o evento
 * - blockNumber: Número do bloco
 * - transactionHash: Hash da transação
 * - args: Argumentos do evento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, contractAddress, blockNumber, transactionHash, args } = body;

    if (!eventName || !contractAddress || !blockNumber || !transactionHash || !args) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Salvar no banco de dados
    console.log('Event received:', {
      eventName,
      contractAddress,
      blockNumber,
      transactionHash,
      args,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Event registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering event:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
