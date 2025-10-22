import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const body = await request.json();
    const { transaction_type, quantity, price, total_amount, transaction_date, notes } = body;

    // Verify transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, investments(portfolio_id, portfolios(user_id))')
      .eq('id', id)
      .single();

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check ownership
    if ((existingTransaction.investments as any)?.portfolios?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        transaction_type: transaction_type?.toLowerCase(),
        quantity: quantity ? parseFloat(quantity) : undefined,
        price: price ? parseFloat(price) : undefined,
        total_amount: total_amount ? parseFloat(total_amount) : undefined,
        transaction_date,
        notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update transaction', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Transaction updated successfully', transaction: updatedTransaction },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;

    // Verify transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, investments(portfolio_id, portfolios(user_id))')
      .eq('id', id)
      .single();

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check ownership
    if ((existingTransaction.investments as any)?.portfolios?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete transaction
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete transaction', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
