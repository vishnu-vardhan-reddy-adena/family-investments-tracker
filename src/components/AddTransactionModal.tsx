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
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
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

  // Load edit data
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        investment_id: editTransaction.investment_id || '',
        transaction_type: editTransaction.transaction_type?.toLowerCase() || 'buy',
        quantity: editTransaction.quantity?.toString() || '',
        price: editTransaction.price?.toString() || '',
        charges_a: editTransaction.charges_a?.toString() || '0',
        charges_b: editTransaction.charges_b?.toString() || '0',
        transaction_date:
          editTransaction.transaction_date || new Date().toISOString().split('T')[0],
        notes: editTransaction.notes || '',
      });
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
            {/* Investment Selection */}
            <Autocomplete
              value={selectedInvestment}
              onChange={(_, newValue) => {
                setSelectedInvestment(newValue);
                setFormData({ ...formData, investment_id: newValue?.id || '' });
              }}
              options={investments}
              getOptionLabel={(option) => `${option.company_name} (${option.symbol || 'N/A'})`}
              renderInput={(params) => (
                <TextField {...params} label="Company" required sx={textFieldStyles} />
              )}
              disabled={!!editTransaction}
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
                <MenuItem value="split">SPLIT</MenuItem>
                <MenuItem value="bonus">BONUS</MenuItem>
                <MenuItem value="dividend">DIVIDEND</MenuItem>
                <MenuItem value="spin-off">SPIN-OFF</MenuItem>
              </Select>
            </FormControl>

            {/* Units */}
            <TextField
              label="Units"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              inputProps={{ step: '0.0001', min: '0' }}
              sx={textFieldStyles}
            />

            {/* Price */}
            <TextField
              label="Price"
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
                  Prev. Units
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {calculatePrevUnits()}
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
