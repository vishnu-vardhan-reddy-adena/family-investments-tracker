import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      investment_id,
      transaction_type,
      quantity,
      price,
      total_amount,
      transaction_date,
      notes,
    } = body;

    // Validate required fields
    if (!investment_id || !transaction_type || !quantity || !price || !transaction_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the investment belongs to the user
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .select('id, portfolio_id, portfolios(user_id)')
      .eq('id', investment_id)
      .single();

    if (investmentError || !investment) {
      console.error('Investment error:', investmentError);
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Check if user owns this investment
    if ((investment.portfolios as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to add transaction to this investment' },
        { status: 403 }
      );
    }

    // Insert transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        investment_id,
        transaction_type: transaction_type.toLowerCase(),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        total_amount: parseFloat(total_amount),
        transaction_date,
        notes: notes || null,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction insert error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction', details: transactionError.message },
        { status: 500 }
      );
    }

    // Update investment quantity based on transaction type
    if (transaction_type.toLowerCase() === 'buy' || transaction_type.toLowerCase() === 'bonus') {
      // Increase quantity
      const { error: updateError } = await supabase.rpc('increment_investment_quantity', {
        investment_id,
        amount: parseFloat(quantity),
      });

      if (updateError) {
        console.error('Error updating investment quantity:', updateError);
        // Continue anyway, transaction is saved
      }
    } else if (transaction_type.toLowerCase() === 'sell') {
      // Decrease quantity
      const { error: updateError } = await supabase.rpc('decrement_investment_quantity', {
        investment_id,
        amount: parseFloat(quantity),
      });

      if (updateError) {
        console.error('Error updating investment quantity:', updateError);
        // Continue anyway, transaction is saved
      }
    }

    return NextResponse.json(
      { message: 'Transaction created successfully', transaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in add transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
