import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stocks/import-excel
 * Import stock data from Excel/CSV format
 * Expected format: symbol, company_name, current_price (optional)
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

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Failed to verify user permissions' }, { status: 500 });
    }

    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required to import Excel data' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { stocks } = body;

    if (!stocks || !Array.isArray(stocks)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected { stocks: Array }' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const stock of stocks) {
      try {
        const { symbol, company_name, current_price, isin, security_code } = stock;

        if (!symbol || !company_name) {
          throw new Error('Missing required fields: symbol and company_name');
        }

        const upperSymbol = symbol.toUpperCase().trim();

        // Insert or update stock in market_data
        const { error: upsertError } = await supabase.from('market_data').upsert(
          {
            symbol: upperSymbol,
            isin: isin || null,
            company_name: company_name.trim(),
            current_price: current_price ? parseFloat(current_price) : null,
            previous_close: current_price ? parseFloat(current_price) : null,
            change_percent: 0,
            volume: 0,
            data_source: 'Manual Import',
            last_updated: new Date().toISOString(),
            raw_data: stock,
          },
          {
            onConflict: 'symbol',
          }
        );

        if (upsertError) {
          throw upsertError;
        }

        // Also insert/update stock metadata if additional fields are present
        const metadata: any = {
          symbol: upperSymbol,
          company_name: company_name.trim(),
          last_updated: new Date().toISOString(),
        };

        // Map NSE export fields to stock_metadata columns
        if (stock['Sector'] || stock['(Sector)']) {
          metadata.sector = stock['Sector'] || stock['(Sector)'];
        }
        if (stock['Industry'] || stock['(Industry)']) {
          metadata.industry = stock['Industry'] || stock['(Industry)'];
        }
        if (stock['Industry Type'] || stock['(Industry Type)']) {
          metadata.industry_type = stock['Industry Type'] || stock['(Industry Type)'];
        }
        if (stock['Company Type'] || stock['(Company Type)']) {
          metadata.market_cap_category = stock['Company Type'] || stock['(Company Type)'];
        }
        if (stock['Macro-Economic Indicator'] || stock['(Macro-Economic Indicator)']) {
          metadata.macro_economic_indicator =
            stock['Macro-Economic Indicator'] || stock['(Macro-Economic Indicator)'];
        }
        if (stock['Industry Subgroup Name'] || stock['(Industry Subgroup Name)']) {
          metadata.industry_sub_group =
            stock['Industry Subgroup Name'] || stock['(Industry Subgroup Name)'];
        }
        if (stock['Market Capitalization'] || stock['(Market Capitalization)']) {
          const marketCap = parseFloat(
            stock['Market Capitalization'] || stock['(Market Capitalization)']
          );
          if (!isNaN(marketCap)) {
            metadata.market_cap = marketCap;
          }
        }

        // Only upsert metadata if we have additional fields beyond symbol and company_name
        if (Object.keys(metadata).length > 3) {
          const { error: metadataError } = await supabase.from('stock_metadata').upsert(metadata, {
            onConflict: 'symbol',
          });

          if (metadataError) {
            console.warn(
              `Warning: Failed to update metadata for ${upperSymbol}:`,
              metadataError.message
            );
            // Don't fail the whole import if metadata update fails
          }
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        const errorMsg = `${stock.symbol || 'Unknown'}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`✗ Failed ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Excel import completed',
      stats: {
        total: stocks.length,
        successful: successCount,
        failed: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error importing Excel data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import Excel data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stocks/import-excel
 * Returns instructions and sample format
 */
export async function GET() {
  return NextResponse.json({
    instructions: 'POST endpoint to import stock data from Excel',
    requiredFields: ['symbol', 'company_name'],
    optionalFields: ['current_price', 'isin'],
    sampleFormat: [
      {
        symbol: 'RELIANCE',
        company_name: 'Reliance Industries Ltd',
        current_price: 2450.5,
      },
      {
        symbol: 'TCS',
        company_name: 'Tata Consultancy Services Ltd',
        current_price: 3650.75,
      },
    ],
    usage: 'POST /api/stocks/import-excel with JSON body: { stocks: [...] }',
  });
}
