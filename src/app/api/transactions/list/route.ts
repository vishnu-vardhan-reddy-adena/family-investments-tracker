import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch transactions with investment details
    const { data: dbTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        `
        id,
        transaction_type,
        quantity,
        price,
        total_amount,
        transaction_date,
        notes,
        investments (
          id,
          investment_type,
          symbol,
          company_name
        )
      `
      )
      .order('transaction_date', { ascending: false });

    if (transactionsError) {
      return NextResponse.json({ error: transactionsError.message }, { status: 500 });
    }

    // Transform transactions
    const transactions = (dbTransactions || []).map((t: any) => ({
      id: t.id,
      investment_id: t.investments?.id || '',
      date: t.transaction_date || new Date().toISOString().split('T')[0],
      company: t.investments?.company_name || 'Unknown',
      action: t.transaction_type?.toUpperCase() || 'BUY',
      splitBonus: 1.0,
      units: parseFloat(t.quantity) || 0,
      price: parseFloat(t.price) || 0,
      totalCost: parseFloat(t.total_amount) || 0,
      realisedPL: 0.0,
      type: t.investments?.investment_type?.toUpperCase() || 'STOCK',
      transaction_type: t.transaction_type?.toLowerCase() || 'buy',
      transaction_date: t.transaction_date || new Date().toISOString().split('T')[0],
      notes: t.notes || '',
      charges_a: 0,
      charges_b: 0,
      quantity: parseFloat(t.quantity) || 0,
    }));

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
