'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Investment {
  id: string;
  company_name: string;
  symbol: string;
  investment_type: string;
  quantity: number;
}

interface TransactionFormData {
  investment_type: string;
  investment_id: string;
  transaction_type: string;
  quantity: string;
  price: string;
  charges_a: string;
  charges_b: string;
  transaction_date: string;
  notes: string;
}

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editTransaction?: any;
}

export function AddTransactionModal({
  open,
  onClose,
  onSuccess,
  editTransaction,
}: AddTransactionModalProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    investment_type: '',
    investment_id: '',
    transaction_type: 'buy',
    quantity: '',
    price: '',
    charges_a: '0',
    charges_b: '0',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // TextField styling for visibility
  const textFieldStyles = {
    '& .MuiInputBase-input': {
      color: 'text.primary',
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(77, 121, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(77, 121, 255, 0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4D79FF',
      },
    },
  };

  // Fetch investments on mount
  useEffect(() => {
    if (open) {
      fetchInvestments();
    }
  }, [open]);

  // Filter investments when investment type changes
  useEffect(() => {
    if (formData.investment_type) {
      const filtered = investments.filter(
        (inv) => inv.investment_type === formData.investment_type
      );
      setFilteredInvestments(filtered);
    } else {
      setFilteredInvestments(investments);
    }
  }, [formData.investment_type, investments]);

  // Load edit data
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        investment_type: editTransaction.investment_type || '',
        investment_id: editTransaction.investment_id || '',
        transaction_type:
          editTransaction.transaction_type?.toLowerCase() ||
          editTransaction.action?.toLowerCase() ||
          'buy',
        quantity: (editTransaction.quantity || editTransaction.units)?.toString() || '',
        price: editTransaction.price?.toString() || '',
        charges_a: editTransaction.charges_a?.toString() || '0',
        charges_b: editTransaction.charges_b?.toString() || '0',
        transaction_date:
          editTransaction.transaction_date ||
          editTransaction.date ||
          new Date().toISOString().split('T')[0],
        notes: editTransaction.notes || '',
      });

      // Fetch investments to find and set the selected investment
      fetch('/api/investments/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.investments) {
            const investment = data.investments.find(
              (inv: Investment) => inv.id === editTransaction.investment_id
            );
            if (investment) {
              setSelectedInvestment(investment);
            }
          }
        })
        .catch((err) => console.error('Error loading investment for edit:', err));
    }
  }, [editTransaction]);

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments/list');
      if (response.ok) {
        const data = await response.json();
        setInvestments(data.investments || []);
      }
    } catch (err) {
      console.error('Error fetching investments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const quantity = parseFloat(formData.quantity);
      const price = parseFloat(formData.price);
      const charges_a = parseFloat(formData.charges_a || '0');
      const charges_b = parseFloat(formData.charges_b || '0');
      const total_amount = quantity * price + charges_a + charges_b;

      const payload = {
        investment_id: formData.investment_id,
        transaction_type: formData.transaction_type,
        quantity,
        price,
        total_amount,
        charges_a,
        charges_b,
        transaction_date: formData.transaction_date,
        notes: formData.notes,
      };

      const url = editTransaction
        ? `/api/transactions/${editTransaction.id}`
        : '/api/transactions/add';

      const response = await fetch(url, {
        method: editTransaction ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save transaction');
      }

      setSuccess(editTransaction ? 'Transaction updated!' : 'Transaction added successfully!');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      investment_type: '',
      investment_id: '',
      transaction_type: 'buy',
      quantity: '',
      price: '',
      charges_a: '0',
      charges_b: '0',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSelectedInvestment(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const calculatePrevUnits = () => {
    return selectedInvestment?.quantity || 0;
  };

  const calculateTotalPrice = () => {
    const quantity = parseFloat(formData.quantity || '0');
    const price = parseFloat(formData.price || '0');
    const charges_a = parseFloat(formData.charges_a || '0');
    const charges_b = parseFloat(formData.charges_b || '0');
    return (quantity * price + charges_a + charges_b).toFixed(2);
  };

  const calculateTotalCharges = () => {
    const charges_a = parseFloat(formData.charges_a || '0');
    const charges_b = parseFloat(formData.charges_b || '0');
    return (charges_a + charges_b).toFixed(2);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {editTransaction ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Investment Type Selection */}
            <FormControl fullWidth required>
              <InputLabel>Investment Type</InputLabel>
              <Select
                value={formData.investment_type}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    investment_type: e.target.value,
                    investment_id: '', // Reset investment when type changes
                  });
                  setSelectedInvestment(null); // Clear selected investment
                }}
                label="Investment Type"
                disabled={!!editTransaction}
                sx={textFieldStyles}
              >
                <MenuItem value="">
                  <em>Select investment type first</em>
                </MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
                <MenuItem value="etf">ETF</MenuItem>
                <MenuItem value="fixed_deposit">Fixed Deposit</MenuItem>
                <MenuItem value="nps">NPS</MenuItem>
                <MenuItem value="epfo">EPF/PF</MenuItem>
                <MenuItem value="real_estate">Real Estate</MenuItem>
                <MenuItem value="gold">Gold</MenuItem>
                <MenuItem value="bond">Bond</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Investment Selection */}
            <Autocomplete
              value={selectedInvestment}
              onChange={(_, newValue) => {
                setSelectedInvestment(newValue);
                setFormData({ ...formData, investment_id: newValue?.id || '' });
              }}
              options={filteredInvestments}
              disabled={!formData.investment_type || !!editTransaction}
              getOptionLabel={(option) => {
                const symbol = option.symbol ? ` (${option.symbol})` : '';
                return `${option.company_name}${symbol}`;
              }}
              groupBy={(option) => option.investment_type?.toUpperCase() || 'OTHER'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Investment"
                  required
                  sx={textFieldStyles}
                  helperText={
                    !formData.investment_type
                      ? 'Please select investment type first'
                      : filteredInvestments.length === 0
                        ? `No ${formData.investment_type} investments found. Add one first.`
                        : `${filteredInvestments.length} ${formData.investment_type} investment(s) available`
                  }
                />
              )}
            />

            {/* Transaction Date */}
            <TextField
              label="Date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />

            {/* Action Type */}
            <FormControl fullWidth required>
              <InputLabel>Action</InputLabel>
              <Select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                label="Action"
                sx={textFieldStyles}
              >
                <MenuItem value="buy">BUY</MenuItem>
                <MenuItem value="sell">SELL</MenuItem>

                {/* Stock/ETF/MF specific actions */}
                {(selectedInvestment?.investment_type === 'stock' ||
                  selectedInvestment?.investment_type === 'etf') && (
                  <>
                    <MenuItem value="split">SPLIT</MenuItem>
                    <MenuItem value="bonus">BONUS</MenuItem>
                    <MenuItem value="dividend">DIVIDEND</MenuItem>
                    <MenuItem value="spin-off">SPIN-OFF</MenuItem>
                  </>
                )}

                {/* Mutual Fund specific */}
                {selectedInvestment?.investment_type === 'mutual_fund' && (
                  <MenuItem value="dividend">DIVIDEND</MenuItem>
                )}

                {/* FD/NPS/EPFO specific actions */}
                {(selectedInvestment?.investment_type === 'fixed_deposit' ||
                  selectedInvestment?.investment_type === 'nps' ||
                  selectedInvestment?.investment_type === 'epfo') && (
                  <>
                    <MenuItem value="interest">INTEREST</MenuItem>
                    <MenuItem value="maturity">MATURITY</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>

            {/* Units/Quantity */}
            <TextField
              label={
                selectedInvestment?.investment_type === 'stock' ||
                selectedInvestment?.investment_type === 'etf' ||
                selectedInvestment?.investment_type === 'mutual_fund'
                  ? 'Units'
                  : 'Quantity'
              }
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              inputProps={{ step: '0.0001', min: '0' }}
              sx={textFieldStyles}
            />

            {/* Price */}
            <TextField
              label={
                selectedInvestment?.investment_type === 'mutual_fund'
                  ? 'NAV (Net Asset Value)'
                  : selectedInvestment?.investment_type === 'fixed_deposit'
                    ? 'Amount'
                    : 'Price per Unit'
              }
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              inputProps={{ step: '0.01', min: '0' }}
              sx={textFieldStyles}
            />

            {/* Charges A */}
            <TextField
              label="Charges (A)"
              type="number"
              value={formData.charges_a}
              onChange={(e) => setFormData({ ...formData, charges_a: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
              sx={textFieldStyles}
            />

            {/* Charges B */}
            <TextField
              label="Charges (B)"
              type="number"
              value={formData.charges_b}
              onChange={(e) => setFormData({ ...formData, charges_b: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
              sx={textFieldStyles}
            />

            {/* Calculated Fields */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
                borderRadius: '16px',
                padding: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Holding
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {calculatePrevUnits()}{' '}
                  {selectedInvestment?.investment_type === 'stock' ||
                  selectedInvestment?.investment_type === 'etf'
                    ? 'units'
                    : 'qty'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Price
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₹{calculateTotalPrice()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Charges
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₹{calculateTotalCharges()}
                </Typography>
              </Box>
            </Box>

            {/* Notes */}
            <TextField
              label="Notes (Optional)"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              sx={textFieldStyles}
            />

            {/* Error/Success Messages */}
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2">
                {success}
              </Typography>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
                color: 'white',
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3D69EF 0%, #0DC191 100%)',
                },
              }}
            >
              {loading ? 'Saving...' : editTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
