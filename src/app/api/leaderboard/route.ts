import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 * Retorna o ranking dos top usuários por comissão de referência
 * 
 * Query params:
 * - limit: (opcional) Número de usuários a retornar (padrão: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Buscar do banco de dados
    // Por enquanto, retornar dados mockados
    const mockLeaderboard = [
      {
        rank: 1,
        address: '0x1234...5678',
        totalCommission: 15000,
        referralCount: 25,
      },
      {
        rank: 2,
        address: '0xabcd...ef01',
        totalCommission: 12500,
        referralCount: 20,
      },
      {
        rank: 3,
        address: '0x9876...5432',
        totalCommission: 10000,
        referralCount: 18,
      },
      {
        rank: 4,
        address: '0xfedc...ba98',
        totalCommission: 8500,
        referralCount: 15,
      },
      {
        rank: 5,
        address: '0x1111...2222',
        totalCommission: 7000,
        referralCount: 12,
      },
      {
        rank: 6,
        address: '0x3333...4444',
        totalCommission: 5500,
        referralCount: 10,
      },
      {
        rank: 7,
        address: '0x5555...6666',
        totalCommission: 4000,
        referralCount: 8,
      },
      {
        rank: 8,
        address: '0x7777...8888',
        totalCommission: 3000,
        referralCount: 6,
      },
      {
        rank: 9,
        address: '0x9999...aaaa',
        totalCommission: 2000,
        referralCount: 4,
      },
      {
        rank: 10,
        address: '0xbbbb...cccc',
        totalCommission: 1000,
        referralCount: 2,
      },
    ];

    const topUsers = mockLeaderboard.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: topUsers,
      total: mockLeaderboard.length,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
