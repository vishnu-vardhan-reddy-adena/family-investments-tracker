import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/transactions/import-excel
 * Import transactions from Excel/CSV format
 * Expected format: Date, Type, Symbol, Name, Buy/Sell Price, Shares
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactions } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected { transactions: Array }' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Get or create primary portfolio for user
    let { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (portfolioError || !portfolio) {
      // Create primary portfolio
      const { data: newPortfolio, error: createError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: 'Primary Portfolio',
          is_primary: true,
        })
        .select('id')
        .single();

      if (createError || !newPortfolio) {
        return NextResponse.json(
          { error: 'Failed to create portfolio', details: createError?.message },
          { status: 500 }
        );
      }
      portfolio = newPortfolio;
    }

    const portfolioId = portfolio.id;

    for (const txn of transactions) {
      try {
        const { date, type, symbol, name, price, shares } = txn;

        // Debug logging
        console.log('Processing transaction:', { symbol, type, price, shares, date });

        if (!symbol || !type || !price || !shares || !date) {
          errors.push(
            `Skipped row: Missing required fields (symbol: ${symbol}, type: ${type}, price: ${price}, shares: ${shares}, date: ${date})`
          );
          errorCount++;
          continue;
        }

        const upperSymbol = symbol.toUpperCase().trim();
        const txnType = type.toLowerCase();

        // Get or create investment
        let { data: investment, error: investmentError } = await supabase
          .from('investments')
          .select('id')
          .eq('portfolio_id', portfolioId)
          .eq('symbol', upperSymbol)
          .single();

        if (investmentError || !investment) {
          // Create investment
          const { data: newInvestment, error: createInvError } = await supabase
            .from('investments')
            .insert({
              portfolio_id: portfolioId,
              symbol: upperSymbol,
              company_name: name || upperSymbol,
              investment_type: 'stock',
              quantity: 0,
              purchase_price: Math.abs(parseFloat(price)),
              current_price: Math.abs(parseFloat(price)),
            })
            .select('id')
            .single();

          if (createInvError || !newInvestment) {
            errors.push(
              `Failed to create investment for ${upperSymbol}: ${createInvError?.message}`
            );
            errorCount++;
            continue;
          }
          investment = newInvestment;
        }

        const investmentId = investment.id;
        const quantity = parseFloat(shares);
        const unitPrice = Math.abs(parseFloat(price));
        const totalAmount = quantity * unitPrice;

        // Parse date - handle both string (DD/MM/YYYY) and Date object
        let transactionDate: string;
        if (date instanceof Date) {
          // Excel parsed as Date object
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          transactionDate = `${year}-${month}-${day}`;
        } else if (typeof date === 'string') {
          // String format: DD/MM/YYYY
          const [day, month, year] = date.split('/');
          transactionDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (typeof date === 'number') {
          // Excel serial date number
          const excelEpoch = new Date(1899, 11, 30);
          const dateObj = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          transactionDate = `${year}-${month}-${day}`;
        } else {
          errors.push(`Invalid date format for ${upperSymbol}: ${date}`);
          errorCount++;
          continue;
        }

        // Insert transaction
        const { error: txnError } = await supabase.from('transactions').insert({
          investment_id: investmentId,
          transaction_type: txnType,
          quantity: quantity,
          price: unitPrice,
          total_amount: totalAmount,
          transaction_date: transactionDate,
        });

        if (txnError) {
          errors.push(`Failed to insert transaction for ${upperSymbol}: ${txnError.message}`);
          errorCount++;
          continue;
        }

        successCount++;
      } catch (err: any) {
        errors.push(`Error processing row: ${err.message}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${successCount} successful, ${errorCount} failed`,
      stats: {
        total: transactions.length,
        successful: successCount,
        failed: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error importing transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
