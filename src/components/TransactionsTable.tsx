'use client';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
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
import { AddTransactionModal } from './AddTransactionModal';

export interface Transaction {
  id: number;
  dbId?: number; // Actual database ID
  investment_id?: string; // For editing
  date: string;
  company: string;
  action: 'BUY' | 'SELL' | 'DIVIDEND' | 'BONUS' | 'SPLIT' | 'SPIN-OFF' | 'INTEREST' | 'MATURITY';
  splitBonus: number;
  units: number;
  price: number;
  totalCost: number;
  realisedPL: number;
  type:
    | 'STOCK'
    | 'MUTUAL_FUND'
    | 'ETF'
    | 'FD'
    | 'NPS'
    | 'EPF'
    | 'REAL_ESTATE'
    | 'GOLD'
    | 'BOND'
    | 'OTHER';
  transaction_type?: string; // For editing (buy, sell, dividend, bonus, etc.)
  transaction_date?: string; // For editing
  notes?: string; // For editing
  charges_a?: number; // For editing
  charges_b?: number; // For editing
  quantity?: number; // For editing (alias of units)
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onTransactionUpdate?: () => void;
  onTransactionDelete?: (id: number) => void;
}

type SortField = 'date' | 'company' | 'price' | 'totalCost' | 'realisedPL';
type SortOrder = 'asc' | 'desc';

export function TransactionsTable({
  transactions,
  onTransactionUpdate,
  onTransactionDelete,
}: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterAction, setFilterAction] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      // Call callbacks to update UI without page reload
      onTransactionDelete?.(transactionToDelete.id);
      onTransactionUpdate?.();

      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  // Bulk selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = new Set(sortedTransactions.map((t) => t.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);

      // Clear selection and refresh
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
      onTransactionUpdate?.();
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('Failed to delete some transactions');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
  };

  const isSelected = (id: number) => selectedIds.has(id);
  const isAllSelected =
    sortedTransactions.length > 0 && selectedIds.size === sortedTransactions.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedTransactions.length;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return '#1DD1A1'; // Vibrant Teal
      case 'SELL':
        return '#FF6B6B'; // Coral Pink
      case 'DIVIDEND':
      case 'INTEREST':
        return '#FFD93D'; // Sunny Yellow
      case 'BONUS':
      case 'SPLIT':
        return '#A78BFA'; // Violet
      case 'MATURITY':
        return '#34D399'; // Green
      case 'SPIN-OFF':
        return '#F59E0B'; // Amber
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
      case 'FIXED_DEPOSIT':
        return '#FFD93D';
      case 'NPS':
        return '#A78BFA';
      case 'EPF':
      case 'EPFO':
        return '#34D399';
      case 'REAL_ESTATE':
        return '#F59E0B';
      case 'GOLD':
        return '#FBBF24';
      case 'BOND':
        return '#8B5CF6';
      case 'OTHER':
        return '#6B7280';
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
              <MenuItem value="FIXED_DEPOSIT">Fixed Deposit</MenuItem>
              <MenuItem value="NPS">NPS</MenuItem>
              <MenuItem value="EPF">EPF</MenuItem>
              <MenuItem value="EPFO">EPFO</MenuItem>
              <MenuItem value="REAL_ESTATE">Real Estate</MenuItem>
              <MenuItem value="GOLD">Gold</MenuItem>
              <MenuItem value="BOND">Bond</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
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
              <MenuItem value="SPLIT">Split</MenuItem>
              <MenuItem value="SPIN-OFF">Spin-off</MenuItem>
              <MenuItem value="INTEREST">Interest</MenuItem>
              <MenuItem value="MATURITY">Maturity</MenuItem>
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

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4D79FF15 0%, #FF6B6B15 100%)',
            border: '2px solid #4D79FF40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#4D79FF' }}>
            {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDeleteClick}
              sx={{
                borderRadius: '12px',
                borderColor: '#FF6B6B',
                color: '#FF6B6B',
                '&:hover': {
                  borderColor: '#FF6B6B',
                  background: '#FF6B6B15',
                },
              }}
            >
              Delete Selected
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedIds(new Set())}
              sx={{
                borderRadius: '12px',
                borderColor: '#A78BFA',
                color: '#A78BFA',
                '&:hover': {
                  borderColor: '#A78BFA',
                  background: '#A78BFA15',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

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
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    '&.MuiCheckbox-indeterminate': { color: 'white' },
                  }}
                />
              </TableCell>
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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
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
                    },
                    transition: 'all 0.2s ease',
                    bgcolor: isSelected(transaction.id) ? 'action.selected' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(transaction.id)}
                      onChange={() => handleSelectOne(transaction.id)}
                      sx={{
                        '&.Mui-checked': { color: '#4D79FF' },
                      }}
                    />
                  </TableCell>
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
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(transaction)}
                        sx={{
                          color: '#4D79FF',
                          '&:hover': { bgcolor: '#4D79FF15' },
                        }}
                        title="Edit transaction"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(transaction)}
                        sx={{
                          color: '#FF6B6B',
                          '&:hover': { bgcolor: '#FF6B6B15' },
                        }}
                        title="Delete transaction"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
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

      {/* Edit Transaction Modal */}
      {editTransaction && (
        <AddTransactionModal
          open={!!editTransaction}
          onClose={() => setEditTransaction(null)}
          onSuccess={() => {
            setEditTransaction(null);
            onTransactionUpdate?.();
          }}
          editTransaction={editTransaction}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '24px',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Delete Transaction
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this transaction?
            <br />
            <br />
            <strong>{transactionToDelete?.company}</strong>
            <br />
            {transactionToDelete?.action} - {transactionToDelete?.units} units @ ₹
            {transactionToDelete?.price}
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #EF5B5B 0%, #EFC92D 100%)',
              },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '24px',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Delete Multiple Transactions
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedIds.size}</strong> selected transaction
            {selectedIds.size > 1 ? 's' : ''}?
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleBulkDeleteCancel}
            disabled={bulkDeleting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            disabled={bulkDeleting}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #EF5B5B 0%, #EFC92D 100%)',
              },
            }}
          >
            {bulkDeleting ? 'Deleting...' : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
