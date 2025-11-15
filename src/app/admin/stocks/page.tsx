import ImportExcelButton from '@/components/ImportExcelButton';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { redirect } from 'next/navigation';

export default async function StocksMetadataPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all stock metadata with pagination
  let stockMetadata: any[] = [];
  let metadataStart = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch } = await supabase
      .from('stock_metadata')
      .select('*')
      .order('symbol', { ascending: true })
      .range(metadataStart, metadataStart + batchSize - 1);

    if (!batch || batch.length === 0) break;
    stockMetadata = [...stockMetadata, ...batch];
    if (batch.length < batchSize) break;
    metadataStart += batchSize;
  }

  // Get counts by category
  const totalStocks = stockMetadata.length;
  const withSector = stockMetadata.filter((s) => s.sector && s.sector !== 'N/A').length;
  const withIndustry = stockMetadata.filter((s) => s.industry && s.industry !== 'N/A').length;
  const largeCapCount = stockMetadata.filter((s) => s.market_cap_category === 'Large Cap').length;
  const midCapCount = stockMetadata.filter((s) => s.market_cap_category === 'Mid Cap').length;
  const smallCapCount = stockMetadata.filter((s) => s.market_cap_category === 'Small Cap').length;

  // Map Supabase user/profile to the Navbar's expected shape to satisfy stricter prop typing
  const navUser: {
    email?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    role?: 'admin' | 'user';
  } = {
    email: user.email ?? undefined,
    full_name: (profile as any)?.full_name ?? undefined,
    avatar_url: (profile as any)?.avatar_url ?? undefined,
    role: profile?.role === 'admin' ? 'admin' : profile?.role === 'user' ? 'user' : undefined,
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0F1419]">
      <Navbar user={navUser} />

      <Box className="container mx-auto px-4 py-8">
        {/* Header */}
        <Box className="mb-8">
          <Typography
            variant="h4"
            className="mb-2 font-['Space_Grotesk'] font-bold"
            sx={{
              background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Stock Metadata Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and view all stock metadata information
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
              border: '2px solid #4D79FF40',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Stocks
            </Typography>
            <Typography variant="h5" className="font-bold text-[#4D79FF]">
              {totalStocks}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #1DD1A115 0%, #FFD93D15 100%)',
              border: '2px solid #1DD1A140',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              With Sector
            </Typography>
            <Typography variant="h5" className="font-bold text-[#1DD1A1]">
              {withSector}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #FFD93D15 0%, #FF6B6B15 100%)',
              border: '2px solid #FFD93D40',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              With Industry
            </Typography>
            <Typography variant="h5" className="font-bold text-[#FFD93D]">
              {withIndustry}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #10B98115 0%, #059669 15 100%)',
              border: '2px solid #10B98140',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Large Cap
            </Typography>
            <Typography variant="h5" className="font-bold text-[#10B981]">
              {largeCapCount}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #F59E0B15 0%, #D97706 15 100%)',
              border: '2px solid #F59E0B40',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mid Cap
            </Typography>
            <Typography variant="h5" className="font-bold text-[#F59E0B]">
              {midCapCount}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #A78BFA15 0%, #7C3AED15 100%)',
              border: '2px solid #A78BFA40',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Small Cap
            </Typography>
            <Typography variant="h5" className="font-bold text-[#A78BFA]">
              {smallCapCount}
            </Typography>
          </Box>
        </Box>

        {/* Import Button */}
        <Box className="mb-6">
          <ImportExcelButton />
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #0F141915 0%, #1A1F2E15 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
                  '& th': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    fontFamily: 'Space Grotesk',
                    borderBottom: 'none',
                    py: 2,
                  },
                }}
              >
                <TableCell>Symbol</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Industry Type</TableCell>
                <TableCell>Market Cap Category</TableCell>
                <TableCell>Market Cap (Cr)</TableCell>
                <TableCell>Macro Indicator</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockMetadata.map((stock) => (
                <TableRow
                  key={stock.id}
                  sx={{
                    '& td': { color: 'white', borderColor: '#2D3748' },
                    '&:hover': { backgroundColor: '#252B4A' },
                  }}
                >
                  <TableCell>
                    <Typography className="font-semibold">{stock.symbol}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="text-sm">{stock.company_name}</Typography>
                  </TableCell>
                  <TableCell>
                    {stock.sector && stock.sector !== 'N/A' ? (
                      <Chip
                        label={stock.sector}
                        size="small"
                        sx={{
                          backgroundColor: '#4D79FF20',
                          color: '#4D79FF',
                          fontSize: '0.7rem',
                        }}
                      />
                    ) : (
                      <Typography className="text-xs text-gray-500">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography className="text-xs text-gray-300">
                      {stock.industry || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="text-xs text-gray-300">
                      {stock.industry_type || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {stock.market_cap_category && stock.market_cap_category !== 'N/A' ? (
                      <Chip
                        label={stock.market_cap_category}
                        size="small"
                        sx={{
                          backgroundColor:
                            stock.market_cap_category === 'Large Cap'
                              ? '#10B98120'
                              : stock.market_cap_category === 'Mid Cap'
                                ? '#F59E0B20'
                                : '#A78BFA20',
                          color:
                            stock.market_cap_category === 'Large Cap'
                              ? '#10B981'
                              : stock.market_cap_category === 'Mid Cap'
                                ? '#F59E0B'
                                : '#A78BFA',
                          fontSize: '0.7rem',
                        }}
                      />
                    ) : (
                      <Typography className="text-xs text-gray-500">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography className="text-xs text-gray-300">
                      {stock.market_cap
                        ? `₹${(parseFloat(stock.market_cap) / 100).toFixed(2)} Cr`
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="text-xs text-gray-300">
                      {stock.macro_economic_indicator || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="text-xs text-gray-400">
                      {stock.last_updated
                        ? new Date(stock.last_updated).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {stockMetadata.length === 0 && (
          <Box className="py-12 text-center">
            <Typography variant="h6" color="text.secondary">
              No stock metadata found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Import stock data using the button above
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
