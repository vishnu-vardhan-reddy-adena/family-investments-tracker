import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      investmentType,
      symbol,
      companyName,
      quantity,
      purchasePrice,
      purchaseDate,
      accountNumber,
      maturityDate,
      interestRate,
      maturityAmount,
      propertyType,
      location,
      areaSqft,
      notes,
    } = body;

    console.log('Adding investment:', { investmentType, symbol, companyName, user: user.id });

    // Get or create default portfolio for user
    let { data: portfolio, error: portfolioFetchError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (portfolioFetchError) {
      console.error('Portfolio fetch error:', portfolioFetchError);
      return NextResponse.json(
        { error: 'Failed to fetch portfolio', details: portfolioFetchError.message },
        { status: 500 }
      );
    }

    if (!portfolio) {
      // Create default portfolio if it doesn't exist
      const { data: newPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: 'My Portfolio',
          description: 'Primary investment portfolio',
          is_primary: true,
        })
        .select('id')
        .single();

      if (portfolioError) {
        console.error('Portfolio creation error:', portfolioError);
        return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
      }

      portfolio = newPortfolio;
    }

    console.log('Using portfolio:', portfolio.id);

    // Prepare investment data
    const investmentData: any = {
      portfolio_id: portfolio.id,
      investment_type: investmentType,
      notes,
    };

    // Add type-specific fields
    if (['stock', 'etf', 'mutual_fund'].includes(investmentType)) {
      investmentData.symbol = symbol?.toUpperCase();
      investmentData.company_name = companyName;
      investmentData.quantity = parseFloat(quantity);
      investmentData.purchase_price = parseFloat(purchasePrice);
      investmentData.current_price = parseFloat(purchasePrice); // Initial current price
      investmentData.purchase_date = purchaseDate;
    }

    if (['fixed_deposit', 'nps', 'epfo'].includes(investmentType)) {
      investmentData.account_number = accountNumber;
      investmentData.maturity_amount = parseFloat(maturityAmount);
      investmentData.purchase_price = parseFloat(maturityAmount);
      investmentData.purchase_date = purchaseDate;
      if (maturityDate) investmentData.maturity_date = maturityDate;
      if (interestRate) investmentData.interest_rate = parseFloat(interestRate);
    }

    if (investmentType === 'real_estate') {
      investmentData.property_type = propertyType;
      investmentData.location = location;
      investmentData.area_sqft = parseFloat(areaSqft);
      investmentData.purchase_price = parseFloat(purchasePrice);
      investmentData.current_price = parseFloat(purchasePrice);
      investmentData.purchase_date = purchaseDate;
    }

    if (['gold', 'bond', 'other'].includes(investmentType)) {
      investmentData.company_name = companyName;
      investmentData.quantity = quantity ? parseFloat(quantity) : 1;
      investmentData.purchase_price = parseFloat(purchasePrice);
      investmentData.current_price = parseFloat(purchasePrice);
      investmentData.purchase_date = purchaseDate;
    }

    // Insert investment
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .insert(investmentData)
      .select()
      .single();

    if (investmentError) {
      console.error('Investment creation error:', investmentError);
      return NextResponse.json(
        { error: 'Failed to add investment', details: investmentError.message },
        { status: 500 }
      );
    }

    // Create initial transaction record
    const { error: transactionError } = await supabase.from('transactions').insert({
      investment_id: investment.id,
      transaction_type: 'buy',
      quantity: investmentData.quantity || 1,
      price: investmentData.purchase_price,
      total_amount: investmentData.purchase_price * (investmentData.quantity || 1),
      transaction_date: purchaseDate,
      notes: `Initial purchase`,
    });

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      // Don't fail if transaction creation fails, investment is already created
    }

    // Fetch live market data for stocks/ETFs
    if (['stock', 'etf'].includes(investmentType) && symbol) {
      try {
        // Trigger market data fetch (async, don't wait)
        fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stocks/${symbol}`,
          {
            method: 'GET',
          }
        ).catch((err) => console.error('Market data fetch error:', err));
      } catch (err) {
        console.error('Market data trigger error:', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        investment,
        message: 'Investment added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add investment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
