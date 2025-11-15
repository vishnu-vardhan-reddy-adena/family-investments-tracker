import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { redirect } from 'next/navigation';

// XIRR calculation helper function
function calculateXIRR(cashFlows: { date: Date; amount: number }[]): number {
  if (cashFlows.length < 2) return 0;

  // Newton-Raphson method to find IRR
  const guess = 0.1; // Initial guess: 10%
  let rate = guess;
  const tolerance = 0.0001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    const firstDate = cashFlows[0].date.getTime();

    for (const cf of cashFlows) {
      const days = (cf.date.getTime() - firstDate) / (1000 * 60 * 60 * 24);
      const years = days / 365;
      const factor = Math.pow(1 + rate, years);
      npv += cf.amount / factor;
      dnpv -= (cf.amount * years) / (factor * (1 + rate));
    }

    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    rate = newRate;
  }

  return 0; // Failed to converge
}

export default async function PortfolioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Fetch all transactions with investment details
  const { data: transactions, error: txnError } = await supabase
    .from('transactions')
    .select(
      `
      *,
      investments (
        id,
        symbol,
        company_name,
        investment_type
      )
    `
    )
    .order('transaction_date', { ascending: true });

  // Debug logging
  console.log('Transactions fetched:', transactions?.length || 0);
  if (txnError) {
    console.error('Error fetching transactions:', txnError);
  }
  if (transactions && transactions.length > 0) {
    console.log('Sample transaction:', transactions[0]);
  }

  // Fetch market data for current prices - fetch all in batches
  let marketData: any[] = [];
  let marketStart = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch } = await supabase
      .from('market_data')
      .select('*')
      .range(marketStart, marketStart + batchSize - 1);

    if (!batch || batch.length === 0) break;
    marketData = [...marketData, ...batch];
    if (batch.length < batchSize) break;
    marketStart += batchSize;
  }

  // Fetch stock metadata for sector information - fetch all in batches
  let stockMetadata: any[] = [];
  let metadataStart = 0;

  while (true) {
    const { data: batch } = await supabase
      .from('stock_metadata')
      .select('*')
      .range(metadataStart, metadataStart + batchSize - 1);

    if (!batch || batch.length === 0) break;
    stockMetadata = [...stockMetadata, ...batch];
    if (batch.length < batchSize) break;
    metadataStart += batchSize;
  }

  const metadataCount = stockMetadata.length;

  // Debug logging
  console.log('Stock metadata fetched:', stockMetadata?.length || 0);
  console.log('Total stock metadata count in DB:', metadataCount);
  if (stockMetadata && stockMetadata.length > 0) {
    console.log('Sample metadata:', stockMetadata[0]);
  }

  const marketDataMap = (marketData || []).reduce(
    (acc: any, data: any) => {
      acc[data.symbol] = data;
      return acc;
    },
    {} as Record<string, any>
  );

  const stockMetadataMap = (stockMetadata || []).reduce(
    (acc: any, data: any) => {
      acc[data.symbol] = data;
      return acc;
    },
    {} as Record<string, any>
  );

  console.log('Stock metadata map size:', Object.keys(stockMetadataMap).length);
  console.log('Stock metadata map sample keys:', Object.keys(stockMetadataMap).slice(0, 20));

  // Check if specific symbols exist
  const testSymbols = ['MTARTECH', 'AUBANK', 'IOB', 'RPOWER', 'SBIN'];
  testSymbols.forEach((sym) => {
    console.log(`Symbol ${sym} in metadata:`, sym in stockMetadataMap);
  });

  // Build portfolio from transactions
  const portfolioMap = new Map<string, any>();

  console.log('Total transactions to process:', transactions?.length || 0);

  (transactions || []).forEach((txn: any) => {
    // Get symbol from the investment relation
    const symbol = txn.investments?.symbol;
    if (!symbol) return;

    const investmentName = txn.investments?.company_name || symbol;
    const metadata = stockMetadataMap[symbol];

    const sector = metadata?.sector || 'N/A';
    const industry = metadata?.industry || 'N/A';
    const industryType = metadata?.industry_type || 'N/A';
    const industrySubgroup = metadata?.industry_sub_group || 'N/A';
    const macroEconomicIndicator = metadata?.macro_economic_indicator || 'N/A';

    // Calculate market cap dynamically if outstanding_shares is available
    const outstandingShares = metadata?.outstanding_shares
      ? parseFloat(metadata.outstanding_shares)
      : null;
    const currentMarketPrice = marketDataMap[symbol]?.current_price
      ? parseFloat(marketDataMap[symbol].current_price)
      : null;

    // Dynamic market cap = current_price × outstanding_shares (both in appropriate units)
    // outstanding_shares is in crores, current_price is per share
    // Result will be in crores
    const marketCap =
      outstandingShares && currentMarketPrice
        ? outstandingShares * currentMarketPrice
        : metadata?.market_cap
          ? parseFloat(metadata.market_cap)
          : null;

    const marketCapCategory = metadata?.market_cap_category || 'N/A';

    // Debug logging for first transaction
    if (!portfolioMap.has(symbol)) {
      console.log(`\nProcessing symbol: ${symbol}`);
      console.log('Metadata found:', metadata ? 'YES' : 'NO');
      if (metadata) {
        console.log('Metadata details:', {
          symbol: metadata.symbol,
          sector: metadata.sector,
          industry: metadata.industry,
          industry_type: metadata.industry_type,
          market_cap: metadata.market_cap,
        });
      }
      console.log('Extracted values:', {
        sector,
        industry,
        industryType,
        industrySubgroup,
        macroEconomicIndicator,
        marketCap,
        marketCapCategory,
      });
    }

    if (!portfolioMap.has(symbol)) {
      portfolioMap.set(symbol, {
        symbol,
        name: investmentName,
        sector,
        industry,
        industryType,
        industrySubgroup,
        macroEconomicIndicator,
        marketCap,
        marketCapCategory,
        buyTransactions: [],
        sellTransactions: [],
        dividendTransactions: [],
        totalQuantity: 0,
        totalInvested: 0,
        realizedPnL: 0,
        dividendIncome: 0,
      });
    }

    const position = portfolioMap.get(symbol);

    if (txn.transaction_type === 'buy') {
      position.buyTransactions.push(txn);
      position.totalQuantity += parseFloat(txn.quantity || 0);
      position.totalInvested += parseFloat(txn.total_amount || 0);
    } else if (txn.transaction_type === 'sell') {
      position.sellTransactions.push(txn);
      position.totalQuantity -= parseFloat(txn.quantity || 0);
      // Calculate realized P&L for this sell
      const quantitySold = parseFloat(txn.quantity || 0);
      const sellAmount = parseFloat(txn.total_amount || 0);
      // Simplified: use average buy price
      const avgBuyPrice =
        position.buyTransactions.length > 0
          ? position.buyTransactions.reduce(
              (sum: number, t: any) => sum + parseFloat(t.price || 0),
              0
            ) / position.buyTransactions.length
          : 0;
      const costBasis = quantitySold * avgBuyPrice;
      position.realizedPnL += sellAmount - costBasis;
      position.totalInvested -= costBasis; // Reduce invested amount by cost basis of sold shares
    } else if (txn.transaction_type === 'dividend') {
      position.dividendTransactions.push(txn);
      position.dividendIncome += parseFloat(txn.total_amount || 0);
    }
  });

  // Calculate portfolio metrics for each position
  const portfolioData = Array.from(portfolioMap.values())
    .filter((position) => position.totalQuantity > 0) // Only show positions with holdings
    .map((position) => {
      const marketInfo = marketDataMap[position.symbol];
      const currentPrice = parseFloat(marketInfo?.current_price || 0);
      const changePercent = parseFloat(marketInfo?.change_percent || 0);

      // Calculate average buy price from remaining shares
      const avgBuyPrice =
        position.totalInvested > 0 && position.totalQuantity > 0
          ? position.totalInvested / position.totalQuantity
          : 0;

      const currentValue = position.totalQuantity * currentPrice;
      const unrealizedPnL = currentValue - position.totalInvested;
      const unrealizedPnLPercent =
        position.totalInvested > 0 ? (unrealizedPnL / position.totalInvested) * 100 : 0;

      // Calculate days held (from first buy transaction)
      const firstBuyDate = position.buyTransactions[0]?.transaction_date;
      const daysHeld = firstBuyDate
        ? Math.floor(
            (new Date().getTime() - new Date(firstBuyDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      // Calculate XIRR
      const xirrCashFlows: { date: Date; amount: number }[] = [];

      // Add all buy transactions as negative cash flows
      position.buyTransactions.forEach((txn: any) => {
        xirrCashFlows.push({
          date: new Date(txn.transaction_date),
          amount: -parseFloat(txn.total_amount || 0),
        });
      });

      // Add all sell transactions as positive cash flows
      position.sellTransactions.forEach((txn: any) => {
        xirrCashFlows.push({
          date: new Date(txn.transaction_date),
          amount: parseFloat(txn.total_amount || 0),
        });
      });

      // Add all dividend transactions as positive cash flows
      position.dividendTransactions.forEach((txn: any) => {
        xirrCashFlows.push({
          date: new Date(txn.transaction_date),
          amount: parseFloat(txn.total_amount || 0),
        });
      });

      // Add current value as a positive cash flow (hypothetical sale today)
      xirrCashFlows.push({
        date: new Date(),
        amount: currentValue,
      });

      const xirrValue = calculateXIRR(xirrCashFlows);

      return {
        id: position.symbol,
        symbol: position.symbol,
        name: position.name,
        sector: position.sector,
        industry: position.industry,
        industryType: position.industryType,
        industrySubgroup: position.industrySubgroup,
        macroEconomicIndicator: position.macroEconomicIndicator,
        marketCap: position.marketCap,
        marketCapCategory: position.marketCapCategory,
        livePrice: currentPrice,
        units: position.totalQuantity,
        investedAmount: position.totalInvested,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        realizedPnL: position.realizedPnL,
        dividendIncome: position.dividendIncome,
        xirr: xirrValue,
        allocation: 0, // Will calculate after totals
        days: daysHeld,
        todayChange: changePercent,
      };
    });

  // Calculate totals
  const totalInvested = portfolioData.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrentValue = portfolioData.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalUnrealizedPnL = totalCurrentValue - totalInvested;
  const totalUnrealizedPnLPercent =
    totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;
  const totalRealizedPnL = portfolioData.reduce((sum, inv) => sum + inv.realizedPnL, 0);
  const totalDividend = portfolioData.reduce((sum, inv) => sum + inv.dividendIncome, 0);

  // Debug logging
  console.log('Portfolio data count:', portfolioData.length);
  console.log('Total invested:', totalInvested);
  if (portfolioData.length > 0) {
    console.log('Sample portfolio item:', portfolioData[0]);
  }

  // Calculate allocation percentages
  portfolioData.forEach((inv) => {
    inv.allocation = totalCurrentValue > 0 ? (inv.currentValue / totalCurrentValue) * 100 : 0;
  });

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      <Navbar
        user={{
          email: user.email,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: profile?.role,
        }}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        {/* Header with Index Info */}
        <Box className="mb-6 flex items-center justify-between">
          <Box className="flex gap-8">
            <Box>
              <Select
                value="NIFTY 50"
                size="small"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#2D3748' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="NIFTY 50">NIFTY 50</MenuItem>
                <MenuItem value="SENSEX">BSE SENSEX</MenuItem>
              </Select>
              <Typography variant="h5" className="mt-2 font-bold">
                ₹25,888.90
              </Typography>
            </Box>
            <Box>
              <Select
                value="BSE SENSEX"
                size="small"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#2D3748' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="NIFTY 50">NIFTY 50</MenuItem>
                <MenuItem value="BSE SENSEX">BSE SENSEX</MenuItem>
              </Select>
              <Typography variant="h5" className="mt-2 font-bold">
                ₹84,556.40
              </Typography>
            </Box>
          </Box>

          <Box className="flex gap-6">
            <Box className="text-center">
              <Typography variant="body2" className="text-gray-400">
                Realized Profit
              </Typography>
              <Typography variant="h6" className="font-bold">
                {formatCurrency(totalRealizedPnL)}
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2" className="text-gray-400">
                Realized Loss
              </Typography>
              <Typography variant="h6" className="font-bold">
                ₹0.00
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2" className="text-gray-400">
                Net Realized P/L
              </Typography>
              <Typography variant="h6" className="font-bold">
                {formatCurrency(totalRealizedPnL)}
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2" className="text-gray-400">
                Total Dividend
              </Typography>
              <Typography variant="h6" className="font-bold">
                {formatCurrency(totalDividend)}
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2" className="text-gray-400">
                Total Charges
              </Typography>
              <Typography variant="h6" className="font-bold">
                ₹0.00
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stocks Section */}
        <Box className="mb-6">
          <Box className="mb-4 flex items-center justify-between rounded-lg bg-[#1A1F3A] p-4">
            <Box className="flex items-center gap-4">
              <Typography variant="h6" className="font-bold">
                STOCKS
              </Typography>
              <Select
                value="All"
                size="small"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#2D3748' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Banks">Banks</MenuItem>
              </Select>
            </Box>

            <Box className="flex gap-6 text-sm">
              <Box>
                <Typography className="text-gray-400">Invested Amount</Typography>
                <Typography className="font-bold text-cyan-400">
                  {formatCurrency(totalInvested)}
                </Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Current Value</Typography>
                <Typography className="font-bold text-green-400">
                  {formatCurrency(totalCurrentValue)}
                </Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Unrealized P&L</Typography>
                <Typography
                  className={`font-bold ${totalUnrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {formatCurrency(totalUnrealizedPnL)}
                </Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Unrealized P&L(%)</Typography>
                <Typography
                  className={`font-bold ${totalUnrealizedPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {formatPercent(totalUnrealizedPnLPercent)}
                </Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Realized P&L</Typography>
                <Typography className="font-bold">{formatCurrency(totalRealizedPnL)}</Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Dividend Income</Typography>
                <Typography className="font-bold">{formatCurrency(totalDividend)}</Typography>
              </Box>
              <Box>
                <Typography className="text-gray-400">Updated on</Typography>
                <Typography className="text-sm font-bold">
                  {new Date().toLocaleDateString('en-GB')} |{' '}
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Typography className="font-bold text-green-400">100.00%</Typography>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: '#1A1F3A', backgroundImage: 'none' }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{ '& th': { color: '#9CA3AF', borderColor: '#2D3748', fontSize: '0.75rem' } }}
                >
                  <TableCell>Assets ({portfolioData.length})</TableCell>
                  <TableCell>Price Chart</TableCell>
                  <TableCell>Sector</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Industry Type</TableCell>
                  <TableCell>Industry Subgroup</TableCell>
                  <TableCell>Macro-Economic Indicator</TableCell>
                  <TableCell>Market Cap</TableCell>
                  <TableCell>Live Price</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Invested Amount</TableCell>
                  <TableCell>Current Value</TableCell>
                  <TableCell>Unrealized P&L</TableCell>
                  <TableCell>Unrealized P&L(%)</TableCell>
                  <TableCell>Realized P&L</TableCell>
                  <TableCell>Dividend Income</TableCell>
                  <TableCell>XIRR</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Allocation</TableCell>
                  <TableCell>Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolioData.map((stock) => (
                  <TableRow
                    key={stock.id}
                    sx={{
                      '& td': { color: 'white', borderColor: '#2D3748' },
                      '&:hover': { backgroundColor: '#252B4A' },
                    }}
                  >
                    <TableCell>
                      <Typography className="font-semibold">{stock.symbol}</Typography>
                      <Typography className="text-xs text-gray-400">{stock.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="h-8 w-20 bg-linear-to-r from-green-500/20 to-green-500/5" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stock.sector}
                        size="small"
                        sx={{
                          backgroundColor: '#2D3748',
                          color: '#9CA3AF',
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography className="text-xs text-gray-300">{stock.industry}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className="text-xs text-gray-300">
                        {stock.industryType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className="text-xs text-gray-300">
                        {stock.industrySubgroup}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className="text-xs text-gray-300">
                        {stock.macroEconomicIndicator}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography className="text-xs font-semibold text-gray-300">
                          {stock.marketCapCategory}
                        </Typography>
                        {stock.marketCap && (
                          <Typography className="text-xs text-gray-400">
                            ₹{stock.marketCap.toLocaleString('en-IN', { maximumFractionDigits: 2 })}{' '}
                            Cr
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography className="font-semibold">
                        {formatCurrency(stock.livePrice)}
                      </Typography>
                      <Box className="flex items-center gap-1 text-xs">
                        {stock.todayChange >= 0 ? (
                          <ArrowUpwardIcon sx={{ fontSize: 12, color: '#10B981' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 12, color: '#EF4444' }} />
                        )}
                        <Typography
                          className={stock.todayChange >= 0 ? 'text-green-400' : 'text-red-400'}
                        >
                          {formatPercent(stock.todayChange)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{stock.units}</TableCell>
                    <TableCell>{formatCurrency(stock.investedAmount)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(stock.currentValue)}
                    </TableCell>
                    <TableCell
                      className={stock.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}
                    >
                      {formatCurrency(stock.unrealizedPnL)}
                    </TableCell>
                    <TableCell
                      className={
                        stock.unrealizedPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {formatPercent(stock.unrealizedPnLPercent)}
                    </TableCell>
                    <TableCell>{formatCurrency(stock.realizedPnL)}</TableCell>
                    <TableCell>{formatCurrency(stock.dividendIncome)}</TableCell>
                    <TableCell className={stock.xirr >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stock.xirr.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {stock.unrealizedPnLPercent >= 0 ? (
                        <TrendingUpIcon sx={{ color: '#10B981' }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#EF4444' }} />
                      )}
                    </TableCell>
                    <TableCell>{stock.allocation.toFixed(2)}%</TableCell>
                    <TableCell>{stock.days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </div>
  );
}
