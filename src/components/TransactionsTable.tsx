'use client';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export interface Transaction {
  id: number;
  date: string;
  company: string;
  action: 'BUY' | 'SELL' | 'DIVIDEND' | 'BONUS';
  splitBonus: number;
  units: number;
  price: number;
  totalCost: number;
  realisedPL: number;
  type: 'STOCK' | 'MUTUAL_FUND' | 'ETF' | 'FD' | 'NPS' | 'EPF';
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

type SortField = 'date' | 'company' | 'price' | 'totalCost' | 'realisedPL';
type SortOrder = 'asc' | 'desc';

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterAction, setFilterAction] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || transaction.type === filterType;
    const matchesAction = filterAction === 'All' || transaction.action === filterAction;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(transaction.date) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(transaction.date) <= new Date(dateTo);
    }

    return matchesSearch && matchesType && matchesAction && matchesDate;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'company':
        comparison = a.company.localeCompare(b.company);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'totalCost':
        comparison = a.totalCost - b.totalCost;
        break;
      case 'realisedPL':
        comparison = a.realisedPL - b.realisedPL;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return '#1DD1A1'; // Vibrant Teal
      case 'SELL':
        return '#FF6B6B'; // Coral Pink
      case 'DIVIDEND':
        return '#FFD93D'; // Sunny Yellow
      case 'BONUS':
        return '#A78BFA'; // Violet
      default:
        return '#4D79FF'; // Electric Blue
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STOCK':
        return '#4D79FF';
      case 'MUTUAL_FUND':
        return '#1DD1A1';
      case 'ETF':
        return '#FF6B6B';
      case 'FD':
        return '#FFD93D';
      case 'NPS':
        return '#A78BFA';
      case 'EPF':
        return '#34D399';
      default:
        return '#4D79FF';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Box>
      {/* Filters Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
          border: '2px solid #4D79FF40',
          borderRadius: '24px',
          padding: { xs: 2, sm: 3 },
          mb: 3,
        }}
      >
        <Box className="mb-4 flex items-center gap-2">
          <FilterListIcon sx={{ color: '#4D79FF' }} />
          <Typography variant="h6" className="font-['Space_Grotesk'] font-bold">
            Filters
          </Typography>
        </Box>

        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Sort By */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Sort By
            </Typography>
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              sx={{
                borderRadius: '12px',
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4D79FF40',
                },
              }}
            >
              <MenuItem value="date">LATEST</MenuItem>
              <MenuItem value="company">Company</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="totalCost">Total Cost</MenuItem>
              <MenuItem value="realisedPL">Realised P/L</MenuItem>
            </Select>
          </FormControl>

          {/* Type Filter */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Type
            </Typography>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                borderRadius: '12px',
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1DD1A140',
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="STOCK">Stock</MenuItem>
              <MenuItem value="MUTUAL_FUND">Mutual Fund</MenuItem>
              <MenuItem value="ETF">ETF</MenuItem>
              <MenuItem value="FD">FD</MenuItem>
              <MenuItem value="NPS">NPS</MenuItem>
              <MenuItem value="EPF">EPF</MenuItem>
            </Select>
          </FormControl>

          {/* Action Filter */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Action
            </Typography>
            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              sx={{
                borderRadius: '12px',
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B6B40',
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
              <MenuItem value="DIVIDEND">Dividend</MenuItem>
              <MenuItem value="BONUS">Bonus</MenuItem>
            </Select>
          </FormControl>

          {/* Date From */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Filter From Date
            </Typography>
            <TextField
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFD93D40',
                },
              }}
            />
          </FormControl>

          {/* Date To */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Filter To Date
            </Typography>
            <TextField
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFD93D40',
                },
              }}
            />
          </FormControl>

          {/* Search */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" className="mb-1 font-semibold">
              Search
            </Typography>
            <TextField
              size="small"
              placeholder="Search company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#4D79FF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#A78BFA40',
                },
              }}
            />
          </FormControl>
        </Box>

        {/* Clear Filters Button */}
        <Box className="mt-4 flex justify-end">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchQuery('');
              setFilterType('All');
              setFilterAction('All');
              setDateFrom('');
              setDateTo('');
            }}
            sx={{
              borderRadius: '12px',
              borderColor: '#4D79FF',
              color: '#4D79FF',
              '&:hover': {
                borderColor: '#4D79FF',
                background: '#4D79FF15',
              },
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* Transactions Table */}
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
              <TableCell
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => handleSort('date')}
              >
                <Box className="flex items-center gap-1">
                  Date
                  {sortField === 'date' &&
                    (sortOrder === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => handleSort('company')}
              >
                <Box className="flex items-center gap-1">
                  Company
                  {sortField === 'company' &&
                    (sortOrder === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell>Action</TableCell>
              <TableCell align="right">Split/Bonus</TableCell>
              <TableCell align="right">Units</TableCell>
              <TableCell
                align="right"
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => handleSort('price')}
              >
                <Box className="flex items-center justify-end gap-1">
                  Price
                  {sortField === 'price' &&
                    (sortOrder === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => handleSort('totalCost')}
              >
                <Box className="flex items-center justify-end gap-1">
                  Total Cost
                  {sortField === 'totalCost' &&
                    (sortOrder === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => handleSort('realisedPL')}
              >
                <Box className="flex items-center justify-end gap-1">
                  Realised P/L %
                  {sortField === 'realisedPL' &&
                    (sortOrder === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mt-2">
                    Try adjusting your filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction, index) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: 'action.hover',
                    },
                    '&:hover': {
                      bgcolor: 'action.selected',
                      cursor: 'pointer',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{formatDate(transaction.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {transaction.company}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.action}
                      size="small"
                      sx={{
                        bgcolor: `${getActionColor(transaction.action)}20`,
                        color: getActionColor(transaction.action),
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {transaction.splitBonus.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {transaction.units.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    ₹{transaction.price.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    ₹{transaction.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color:
                        transaction.realisedPL > 0
                          ? '#1DD1A1'
                          : transaction.realisedPL < 0
                            ? '#FF6B6B'
                            : 'text.primary',
                    }}
                  >
                    ₹{transaction.realisedPL.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transaction.type}
                      size="small"
                      sx={{
                        bgcolor: `${getTypeColor(transaction.type)}20`,
                        color: getTypeColor(transaction.type),
                        fontWeight: 600,
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                  >
                    {transaction.id}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Results Count */}
      <Box className="mt-4 flex items-center justify-between">
        <Typography variant="body2" color="text.secondary">
          Showing {sortedTransactions.length} of {transactions.length} transactions
        </Typography>
        {sortedTransactions.length < transactions.length && (
          <Typography variant="body2" sx={{ color: '#4D79FF', fontWeight: 600 }}>
            {transactions.length - sortedTransactions.length} filtered out
          </Typography>
        )}
      </Box>
    </Box>
  );
}
