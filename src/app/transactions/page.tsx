import { Navbar } from '@/components/Navbar';
import { TransactionsPageClient } from '@/components/TransactionsPageClient';
import { type Transaction } from '@/components/TransactionsTable';
import { createClient } from '@/lib/supabase/server';
import { Box, Typography } from '@mui/material';
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
    id: t.id, // Use actual database ID
    dbId: t.id, // Keep original database ID for editing
    investment_id: t.investments?.id || '', // Add investment_id for editing
    date: t.transaction_date || new Date().toISOString().split('T')[0],
    company: t.investments?.company_name || 'Unknown',
    action: t.transaction_type?.toUpperCase() || 'BUY',
    splitBonus: 1.0,
    units: parseFloat(t.quantity) || 0,
    price: parseFloat(t.price) || 0,
    totalCost: parseFloat(t.total_amount) || 0,
    realisedPL: 0.0, // Calculate based on buy/sell
    type: t.investments?.investment_type?.toUpperCase() || 'STOCK',
    transaction_type: t.transaction_type?.toLowerCase() || 'buy', // Add for editing
    transaction_date: t.transaction_date || new Date().toISOString().split('T')[0], // Add for editing
    notes: t.notes || '', // Add for editing
    charges_a: 0, // These might not be in current schema
    charges_b: 0,
  }));

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
          </Box>
        </Box>

        {/* Client Component with State Management */}
        <TransactionsPageClient initialTransactions={transactions} />
      </main>
    </div>
  );
}
