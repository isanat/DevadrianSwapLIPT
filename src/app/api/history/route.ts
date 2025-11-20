import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/history
 * Retorna o histórico de transações de um usuário
 * 
 * Query params:
 * - userAddress: Endereço da carteira do usuário
 * - type: (opcional) Filtrar por tipo de transação (stake, mining, game, liquidity, lottery, referral)
 * - limit: (opcional) Número máximo de resultados (padrão: 50)
 * - offset: (opcional) Offset para paginação (padrão: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      );
    }

    // TODO: Buscar do banco de dados
    // Por enquanto, retornar dados mockados
    const mockHistory = [
      {
        id: '1',
        type: 'stake',
        timestamp: new Date().toISOString(),
        amount: 1000,
        details: { duration: 30, apy: 15 },
      },
      {
        id: '2',
        type: 'game',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        amount: 100,
        details: { game: 'wheel', multiplier: 1.5, winnings: 150 },
      },
    ];

    // Filtrar por tipo se especificado
    const filtered = type
      ? mockHistory.filter((tx) => tx.type === type)
      : mockHistory;

    // Aplicar paginação
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total: filtered.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
