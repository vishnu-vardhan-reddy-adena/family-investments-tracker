import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's investments
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select(
        `
        id,
        company_name,
        symbol,
        investment_type,
        quantity,
        portfolios!inner(user_id)
      `
      )
      .eq('portfolios.user_id', user.id)
      .order('company_name', { ascending: true });

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch investments', details: investmentsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ investments: investments || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in list investments:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
