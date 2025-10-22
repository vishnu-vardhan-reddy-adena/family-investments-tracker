import { AddTransactionButton } from '@/components/AddTransactionButton';
import { Navbar } from '@/components/Navbar';
import { TransactionsTable, type Transaction } from '@/components/TransactionsTable';
import { createClient } from '@/lib/supabase/server';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Button, Typography } from '@mui/material';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Fetch real transactions from database
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
    console.error('Error fetching transactions:', transactionsError);
  }

  // Transform database transactions to match Transaction interface
  const transactions: Transaction[] = (dbTransactions || []).map((t: any, index: number) => ({
    id: index + 1,
    date: t.transaction_date || new Date().toISOString().split('T')[0],
    company: t.investments?.company_name || 'Unknown',
    action: t.transaction_type?.toUpperCase() || 'BUY',
    splitBonus: 1.0,
    units: parseFloat(t.quantity) || 0,
    price: parseFloat(t.price) || 0,
    totalCost: parseFloat(t.total_amount) || 0,
    realisedPL: 0.0, // Calculate based on buy/sell
    type: t.investments?.investment_type?.toUpperCase() || 'STOCK',
  }));

  // Calculate totals
  const totalInvested = transactions
    .filter((t) => t.action === 'BUY')
    .reduce((sum, t) => sum + t.totalCost, 0);

  const totalRealized = transactions.reduce((sum, t) => sum + t.realisedPL, 0);

  const totalSold = transactions
    .filter((t) => t.action === 'SELL')
    .reduce((sum, t) => sum + t.totalCost, 0);

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F1419]">
      {/* Navigation Bar */}
      <Navbar
        user={{
          email: user.email,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: profile?.role,
        }}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Section */}
        <Box className="mb-8">
          <Box className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Box>
              <Typography
                variant="h3"
                className="mb-2 font-['Space_Grotesk'] font-bold"
                sx={{
                  background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                All Transactions 💸
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete history of all your investment transactions
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: '16px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#1DD1A1',
                  color: '#1DD1A1',
                  '&:hover': {
                    borderColor: '#1DD1A1',
                    background: '#1DD1A115',
                  },
                }}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: '16px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#4D79FF',
                  color: '#4D79FF',
                  '&:hover': {
                    borderColor: '#4D79FF',
                    background: '#4D79FF15',
                  },
                }}
              >
                Export
              </Button>
              <AddTransactionButton />
            </Box>
          </Box>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
                border: '2px solid #4D79FF40',
                borderRadius: '20px',
                padding: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Total Invested
              </Typography>
              <Typography
                variant="h4"
                className="font-['Space_Grotesk'] font-bold"
                sx={{ color: '#4D79FF' }}
              >
                ₹{totalInvested.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {transactions.filter((t) => t.action === 'BUY').length} buy transactions
              </Typography>
            </Box>

            <Box
              sx={{
                background: 'linear-gradient(135deg, #1DD1A115 0%, #34D39915 100%)',
                border: '2px solid #1DD1A140',
                borderRadius: '20px',
                padding: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Total Realized P/L
              </Typography>
              <Typography
                variant="h4"
                className="font-['Space_Grotesk'] font-bold"
                sx={{ color: totalRealized >= 0 ? '#1DD1A1' : '#FF6B6B' }}
              >
                {totalRealized >= 0 ? '+' : ''}₹{totalRealized.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalRealized >= 0 ? 'Profit' : 'Loss'}
              </Typography>
            </Box>

            <Box
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B15 0%, #FFD93D15 100%)',
                border: '2px solid #FF6B6B40',
                borderRadius: '20px',
                padding: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Total Sold
              </Typography>
              <Typography
                variant="h4"
                className="font-['Space_Grotesk'] font-bold"
                sx={{ color: '#FF6B6B' }}
              >
                ₹{totalSold.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {transactions.filter((t) => t.action === 'SELL').length} sell transactions
              </Typography>
            </Box>
          </div>
        </Box>

        {/* Transactions Table */}
        <TransactionsTable transactions={transactions} />
      </main>
    </div>
  );
}
