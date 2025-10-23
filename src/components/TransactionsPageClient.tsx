'use client';

import { AddInvestmentButton } from '@/components/AddInvestmentButton';
import { AddTransactionButton } from '@/components/AddTransactionButton';
import { TransactionsTable, type Transaction } from '@/components/TransactionsTable';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Button, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

interface TransactionsPageClientProps {
  initialTransactions: Transaction[];
}

export function TransactionsPageClient({ initialTransactions }: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTransactions = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/transactions/list');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleTransactionUpdate = useCallback(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const handleTransactionDelete = useCallback((deletedId: number) => {
    // Optimistically update UI
    setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
  }, []);

  // Calculate totals
  const totalInvested = transactions
    .filter((t) => t.action === 'BUY')
    .reduce((sum, t) => sum + t.totalCost, 0);

  const totalRealized = transactions.reduce((sum, t) => sum + t.realisedPL, 0);

  const totalSold = transactions
    .filter((t) => t.action === 'SELL')
    .reduce((sum, t) => sum + t.totalCost, 0);

  return (
    <>
      {/* Summary Cards */}
      <Box className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Invested */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
            border: '2px solid #4D79FF40',
            borderRadius: '20px',
            padding: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Total Invested
          </Typography>
          <Typography variant="h4" className="font-['Space_Grotesk'] font-bold text-[#4D79FF]">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            BUY transactions
          </Typography>
        </Box>

        {/* Total Realized */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1DD1A115 0%, #FFD93D15 100%)',
            border: '2px solid #1DD1A140',
            borderRadius: '20px',
            padding: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Total Realized P/L
          </Typography>
          <Typography
            variant="h4"
            className="font-['Space_Grotesk'] font-bold"
            sx={{ color: totalRealized >= 0 ? '#1DD1A1' : '#FF6B6B' }}
          >
            {totalRealized >= 0 ? '+' : ''}₹
            {totalRealized.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Profit & Loss
          </Typography>
        </Box>

        {/* Total Sold */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF6B6B15 0%, #FFD93D15 100%)',
            border: '2px solid #FF6B6B40',
            borderRadius: '20px',
            padding: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Total Sold
          </Typography>
          <Typography variant="h4" className="font-['Space_Grotesk'] font-bold text-[#FF6B6B]">
            ₹{totalSold.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SELL transactions
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Box className="flex items-center gap-3">
          <AddInvestmentButton onSuccess={handleTransactionUpdate} />
          <AddTransactionButton onSuccess={handleTransactionUpdate} />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{
              borderRadius: '16px',
              borderColor: '#4D79FF',
              color: '#4D79FF',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: '#4D79FF',
                background: '#4D79FF15',
              },
            }}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: '16px',
              borderColor: '#1DD1A1',
              color: '#1DD1A1',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: '#1DD1A1',
                background: '#1DD1A115',
              },
            }}
          >
            Export CSV
          </Button>
        </Box>

        <Button
          variant="text"
          onClick={refreshTransactions}
          disabled={refreshing}
          sx={{
            borderRadius: '12px',
            color: '#4D79FF',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Transactions Table */}
      <TransactionsTable
        transactions={transactions}
        onTransactionUpdate={handleTransactionUpdate}
        onTransactionDelete={handleTransactionDelete}
      />
    </>
  );
}
