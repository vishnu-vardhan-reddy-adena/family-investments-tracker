import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/portfolio/summary
 * Get portfolio summary for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all portfolios for the user
    const { data: portfolios, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id);

    if (portfolioError) {
      return NextResponse.json({ error: portfolioError.message }, { status: 500 });
    }

    // Fetch all investments for user's portfolios
    const portfolioIds = portfolios?.map((p) => p.id) || [];

    if (portfolioIds.length === 0) {
      return NextResponse.json({
        total_portfolios: 0,
        total_investments: 0,
        total_value: 0,
        total_invested: 0,
        profit_loss: 0,
        profit_loss_percent: 0,
        portfolios: [],
      });
    }

    const { data: investments, error: investmentError } = await supabase
      .from('investments')
      .select('*')
      .in('portfolio_id', portfolioIds);

    if (investmentError) {
      return NextResponse.json({ error: investmentError.message }, { status: 500 });
    }

    // Calculate totals
    let totalInvested = 0;
    let totalCurrent = 0;

    investments?.forEach((inv) => {
      const quantity = inv.quantity || 0;
      const purchasePrice = inv.purchase_price || 0;
      const currentPrice = inv.current_price || purchasePrice;

      totalInvested += quantity * purchasePrice;
      totalCurrent += quantity * currentPrice;
    });

    const profitLoss = totalCurrent - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return NextResponse.json({
      total_portfolios: portfolios?.length || 0,
      total_investments: investments?.length || 0,
      total_value: totalCurrent,
      total_invested: totalInvested,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      portfolios: portfolios,
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
