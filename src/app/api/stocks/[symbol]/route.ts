import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/stocks/[symbol]
 * Fetch stock data for a specific symbol
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from market_data table
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Stock not found', details: error.message },
        { status: 404 }
      );
    }

    // Check if data is stale (older than 5 minutes)
    const lastUpdated = new Date(data.last_updated);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / 1000 / 60;

    return NextResponse.json({
      ...data,
      is_stale: diffMinutes > 5,
      minutes_old: Math.floor(diffMinutes),
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
