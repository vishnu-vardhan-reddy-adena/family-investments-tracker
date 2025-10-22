import { AddInvestmentButton } from '@/components/AddInvestmentButton';
import { InvestmentCard } from '@/components/InvestmentCard';
import { Navbar } from '@/components/Navbar';
import { PortfolioChart } from '@/components/PortfolioChart';
import { createClient } from '@/lib/supabase/server';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PieChartIcon from '@mui/icons-material/PieChart';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import { Box, Button, Typography } from '@mui/material';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Fetch real investments from database
  const { data: dbInvestments, error: investmentsError } = await supabase
    .from('investments')
    .select('*')
    .order('created_at', { ascending: false });

  if (investmentsError) {
    console.error('Error fetching investments:', investmentsError);
  }

  // Investment type configuration
  const investmentConfig: Record<
    string,
    { label: string; icon: React.ReactElement; color: string }
  > = {
    stock: {
      label: 'Stocks',
      icon: <ShowChartIcon sx={{ fontSize: 28 }} />,
      color: '#4D79FF', // Electric Blue
    },
    mutual_fund: {
      label: 'Mutual Funds',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: '#1DD1A1', // Vibrant Teal
    },
    etf: {
      label: 'ETFs',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: '#FF6B6B', // Coral Pink
    },
    fixed_deposit: {
      label: 'Fixed Deposits',
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: '#FFD93D', // Sunny Yellow
    },
    nps: {
      label: 'NPS',
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: '#A78BFA', // Violet
    },
    epfo: {
      label: 'EPF',
      icon: <WorkIcon sx={{ fontSize: 28 }} />,
      color: '#34D399', // Green
    },
    real_estate: {
      label: 'Real Estate',
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: '#F59E0B', // Amber
    },
    gold: {
      label: 'Gold',
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: '#FBBF24', // Yellow
    },
    bond: {
      label: 'Bonds',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: '#8B5CF6', // Purple
    },
    other: {
      label: 'Other',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: '#6B7280', // Gray
    },
  };

  // Group investments by type and calculate totals
  const investmentGroups: Record<
    string,
    { investments: any[]; totalValue: number; holdings: number }
  > = {};

  (dbInvestments || []).forEach((inv: any) => {
    const type = inv.investment_type || 'other';
    if (!investmentGroups[type]) {
      investmentGroups[type] = { investments: [], totalValue: 0, holdings: 0 };
    }
    investmentGroups[type].investments.push(inv);
    investmentGroups[type].totalValue += parseFloat(inv.current_value || inv.total_invested || 0);
    investmentGroups[type].holdings += 1;
  });

  // Create investment cards with real data
  const investments = Object.entries(investmentGroups).map(([type, data]) => {
    const config = investmentConfig[type] || investmentConfig.other;
    const totalInvested = data.investments.reduce(
      (sum, inv) => sum + parseFloat(inv.total_invested || 0),
      0
    );
    const change = data.totalValue - totalInvested;
    const changePercent = totalInvested > 0 ? (change / totalInvested) * 100 : 0;

    return {
      type: config.label,
      icon: config.icon,
      totalValue: data.totalValue,
      change: change,
      changePercent: changePercent,
      holdings: data.holdings,
      color: config.color,
    };
  });

  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalChange = investments.reduce((sum, inv) => sum + inv.change, 0);
  const totalChangePercent = ((totalChange / (totalValue - totalChange)) * 100).toFixed(2);

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
        {/* Welcome Section */}
        <Box className="mb-8">
          <Box className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                Welcome back, {profile?.full_name || 'Investor'}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track all your investments in one place
              </Typography>
            </Box>
            <AddInvestmentButton />
          </Box>

          {/* Total Portfolio Summary */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
              borderRadius: '24px',
              padding: { xs: 3, sm: 4 },
              color: 'white',
              boxShadow: '0 8px 30px rgba(77, 121, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />

            <Box className="relative z-10">
              <Typography variant="body2" className="mb-2 opacity-90">
                Total Portfolio Value
              </Typography>
              <Typography variant="h2" className="mb-3 font-['Space_Grotesk'] font-bold">
                ₹{totalValue.toLocaleString('en-IN')}
              </Typography>
              <Box className="flex items-center gap-2">
                <TrendingUpIcon />
                <Typography variant="h6" className="font-semibold">
                  {totalChange >= 0 ? '+' : ''}₹{totalChange.toLocaleString('en-IN')} (
                  {totalChange >= 0 ? '+' : ''}
                  {totalChangePercent}%)
                </Typography>
                <Typography variant="body2" className="opacity-80">
                  • Today
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Investment Cards Grid */}
        <Box className="mb-8">
          <Typography variant="h5" className="mb-4 font-['Space_Grotesk'] font-bold">
            Your Investments
          </Typography>
          {investments.length === 0 ? (
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
                border: '2px dashed #4D79FF40',
                borderRadius: '24px',
                padding: { xs: 4, sm: 6 },
                textAlign: 'center',
              }}
            >
              <ShowChartIcon
                sx={{ fontSize: 64, color: '#4D79FF', opacity: 0.5, marginBottom: 2 }}
              />
              <Typography variant="h6" className="mb-2 font-['Space_Grotesk'] font-bold">
                No investments yet
              </Typography>
              <Typography variant="body1" color="text.secondary" className="mb-4">
                Start tracking your portfolio by adding your first investment
              </Typography>
              <AddInvestmentButton />
            </Box>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {investments.map((investment) => (
                <InvestmentCard key={investment.type} {...investment} />
              ))}
            </div>
          )}
        </Box>

        {/* Portfolio Chart */}
        <Box className="mb-8">
          <PortfolioChart />
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FFD93D15 0%, #FF6B6B15 100%)',
            border: '2px solid #FFD93D40',
            borderRadius: '24px',
            padding: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="h5" className="mb-4 font-['Space_Grotesk'] font-bold">
            Quick Actions
          </Typography>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '16px',
                py: 2,
                borderColor: '#4D79FF',
                color: '#4D79FF',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#4D79FF',
                  background: '#4D79FF15',
                },
              }}
            >
              Buy Stock
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '16px',
                py: 2,
                borderColor: '#1DD1A1',
                color: '#1DD1A1',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1DD1A1',
                  background: '#1DD1A115',
                },
              }}
            >
              Add SIP
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '16px',
                py: 2,
                borderColor: '#FFD93D',
                color: '#FFD93D',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FFD93D',
                  background: '#FFD93D15',
                },
              }}
            >
              Create FD
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '16px',
                py: 2,
                borderColor: '#FF6B6B',
                color: '#FF6B6B',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FF6B6B',
                  background: '#FF6B6B15',
                },
              }}
            >
              View Reports
            </Button>
          </div>
        </Box>
      </main>
    </div>
  );
}
