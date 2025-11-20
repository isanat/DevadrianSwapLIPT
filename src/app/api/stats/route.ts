import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stats
 * Retorna estatísticas agregadas da plataforma
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Buscar do banco de dados e dos contratos
    // Por enquanto, retornar dados mockados
    const mockStats = {
      tvl: 5000000, // Total Value Locked em LIPT
      totalStaked: 3000000, // Total em staking
      totalMining: 1000000, // Total em mining
      totalLiquidity: 1000000, // Total em liquidez
      totalUsers: 1250, // Total de usuários únicos
      totalTransactions: 15000, // Total de transações
      gameStats: {
        wheelOfFortune: {
          totalPlays: 5000,
          totalWagered: 500000,
          totalWinnings: 450000,
          houseEdge: 0.02, // 2%
        },
        liptRocket: {
          totalPlays: 3000,
          totalWagered: 300000,
          totalWinnings: 270000,
          houseEdge: 0.02, // 2%
        },
      },
      lotteryStats: {
        currentPrizePool: 50000,
        totalTicketsSold: 10000,
        nextDrawIn: 3600, // segundos
      },
      referralStats: {
        totalCommissionsPaid: 100000,
        activeReferrers: 500,
      },
    };

    return NextResponse.json({
      success: true,
      data: mockStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
