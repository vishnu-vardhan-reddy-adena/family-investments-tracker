'use client';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface AddInvestmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type InvestmentType =
  | 'stock'
  | 'mutual_fund'
  | 'etf'
  | 'fixed_deposit'
  | 'nps'
  | 'epfo'
  | 'real_estate'
  | 'gold'
  | 'bond'
  | 'other';

interface FormData {
  investmentType: InvestmentType;
  // Stock/ETF/MF fields
  symbol: string;
  companyName: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
  // FD/NPS/EPFO fields
  accountNumber: string;
  maturityDate: string;
  interestRate: string;
  maturityAmount: string;
  // Real Estate fields
  propertyType: string;
  location: string;
  areaSqft: string;
  // Common
  notes: string;
}

export function AddInvestmentModal({ open, onClose, onSuccess }: AddInvestmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    investmentType: 'stock',
    symbol: '',
    companyName: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    accountNumber: '',
    maturityDate: '',
    interestRate: '',
    maturityAmount: '',
    propertyType: '',
    location: '',
    areaSqft: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Common TextField styling for better visibility
  const textFieldStyles = {
    '& .MuiInputBase-input': {
      color: 'text.primary',
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
  };

  const investmentTypes = [
    { value: 'stock', label: 'Stock', icon: '📈' },
    { value: 'mutual_fund', label: 'Mutual Fund', icon: '💼' },
    { value: 'etf', label: 'ETF', icon: '📊' },
    { value: 'fixed_deposit', label: 'Fixed Deposit', icon: '🏦' },
    { value: 'nps', label: 'NPS', icon: '🛡️' },
    { value: 'epfo', label: 'EPF/PF', icon: '💰' },
    { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
    { value: 'gold', label: 'Gold', icon: '🪙' },
    { value: 'bond', label: 'Bond', icon: '📜' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const propertyTypes = ['Residential', 'Commercial', 'Land', 'Agricultural'];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSearchStock = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Mock search results - replace with actual API call
      const mockResults = [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2450.5 },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3580.75 },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1420.3 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1650.0 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 985.25 },
      ].filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleStockSelect = (stock: any) => {
    if (stock) {
      setFormData((prev) => ({
        ...prev,
        symbol: stock.symbol,
        companyName: stock.name,
        purchasePrice: stock.price.toString(),
      }));
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const validateForm = (): boolean => {
    const {
      investmentType,
      symbol,
      companyName,
      quantity,
      purchasePrice,
      accountNumber,
      maturityAmount,
    } = formData;

    if (['stock', 'etf', 'mutual_fund'].includes(investmentType)) {
      if (!symbol || !companyName || !quantity || !purchasePrice) {
        setError(
          'Please fill in all required fields (Symbol, Company Name, Quantity, Purchase Price)'
        );
        return false;
      }
      if (parseFloat(quantity) <= 0) {
        setError('Quantity must be greater than 0');
        return false;
      }
      if (parseFloat(purchasePrice) <= 0) {
        setError('Purchase price must be greater than 0');
        return false;
      }
    }

    if (['fixed_deposit', 'nps', 'epfo'].includes(investmentType)) {
      if (!accountNumber || !maturityAmount) {
        setError('Please fill in all required fields (Account Number, Amount)');
        return false;
      }
      if (parseFloat(maturityAmount) <= 0) {
        setError('Amount must be greater than 0');
        return false;
      }
    }

    if (investmentType === 'real_estate') {
      if (!formData.location || !formData.areaSqft || !purchasePrice) {
        setError('Please fill in all required fields (Location, Area, Purchase Price)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/investments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || data.details || 'Failed to add investment');
      }

      console.log('Investment added successfully:', data);
      // Success
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to add investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      investmentType: 'stock',
      symbol: '',
      companyName: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      accountNumber: '',
      maturityDate: '',
      interestRate: '',
      maturityAmount: '',
      propertyType: '',
      location: '',
      areaSqft: '',
      notes: '',
    });
    setError('');
    setSuccess(false);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const renderFields = () => {
    const { investmentType } = formData;

    // Stock/ETF/Mutual Fund fields
    if (['stock', 'etf', 'mutual_fund'].includes(investmentType)) {
      return (
        <>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option: any) =>
              typeof option === 'string' ? option : `${option.symbol} - ${option.name}`
            }
            inputValue={searchQuery}
            onInputChange={(e, newValue) => {
              setSearchQuery(newValue);
              handleSearchStock(newValue);
            }}
            onChange={(e, newValue: any) => handleStockSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Search ${investmentType === 'stock' ? 'Stock' : investmentType === 'etf' ? 'ETF' : 'Mutual Fund'}`}
                placeholder="Type symbol or company name..."
                sx={textFieldStyles}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#4D79FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option: any) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.name} • ₹{option.price}
                  </Typography>
                </Box>
              </Box>
            )}
          />

          <TextField
            label="Symbol / Code *"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value)}
            placeholder="e.g., RELIANCE"
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
            }}
          />

          <TextField
            label="Company / Fund Name *"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="e.g., Reliance Industries Ltd"
            fullWidth
            sx={textFieldStyles}
          />

          <Box className="grid grid-cols-2 gap-4">
            <TextField
              label="Quantity *"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="e.g., 100"
              InputProps={{
                inputProps: { min: 0, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />

            <TextField
              label="Purchase Price *"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              placeholder="e.g., 2450.50"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>

          <TextField
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={textFieldStyles}
          />
        </>
      );
    }

    // Fixed Deposit / NPS / EPF fields
    if (['fixed_deposit', 'nps', 'epfo'].includes(investmentType)) {
      return (
        <>
          <TextField
            label="Account Number *"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            placeholder="Enter account number"
            fullWidth
            sx={textFieldStyles}
          />

          <Box className="grid grid-cols-2 gap-4">
            <TextField
              label="Amount *"
              type="number"
              value={formData.maturityAmount}
              onChange={(e) => handleInputChange('maturityAmount', e.target.value)}
              placeholder="e.g., 50000"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />

            <TextField
              label="Interest Rate (%)"
              type="number"
              value={formData.interestRate}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              placeholder="e.g., 7.5"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { min: 0, max: 100, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>

          <Box className="grid grid-cols-2 gap-4">
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={textFieldStyles}
            />

            <TextField
              label="Maturity Date"
              type="date"
              value={formData.maturityDate}
              onChange={(e) => handleInputChange('maturityDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>
        </>
      );
    }

    // Real Estate fields
    if (investmentType === 'real_estate') {
      return (
        <>
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              label="Property Type"
            >
              {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Location *"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Mumbai, Maharashtra"
            fullWidth
            sx={textFieldStyles}
          />

          <Box className="grid grid-cols-2 gap-4">
            <TextField
              label="Area (sq.ft) *"
              type="number"
              value={formData.areaSqft}
              onChange={(e) => handleInputChange('areaSqft', e.target.value)}
              placeholder="e.g., 1200"
              InputProps={{
                inputProps: { min: 0, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />

            <TextField
              label="Purchase Price *"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              placeholder="e.g., 5000000"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0, step: '0.01' },
              }}
              fullWidth
              sx={textFieldStyles}
            />
          </Box>

          <TextField
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={textFieldStyles}
          />
        </>
      );
    }

    // Gold/Bond/Other - simple fields
    return (
      <>
        <TextField
          label="Name / Description *"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="e.g., 24K Gold Bar"
          fullWidth
          sx={textFieldStyles}
        />

        <Box className="grid grid-cols-2 gap-4">
          <TextField
            label="Quantity / Weight"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="e.g., 10"
            InputProps={{
              inputProps: { min: 0, step: '0.01' },
            }}
            fullWidth
            sx={textFieldStyles}
          />

          <TextField
            label="Purchase Price *"
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
            placeholder="e.g., 60000"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              inputProps: { min: 0, step: '0.01' },
            }}
            fullWidth
            sx={textFieldStyles}
          />
        </Box>

        <TextField
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={textFieldStyles}
        />
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
          color: 'white',
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Add New Investment
        <Button
          onClick={handleClose}
          sx={{
            minWidth: 'auto',
            color: 'white',
            '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Box className="flex flex-col gap-4">
          {success && (
            <Alert severity="success" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight={600}>
                ✅ Investment added successfully!
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight={600} className="mb-1">
                Error adding investment:
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Investment Type *</InputLabel>
            <Select
              value={formData.investmentType}
              onChange={(e) =>
                handleInputChange('investmentType', e.target.value as InvestmentType)
              }
              label="Investment Type *"
            >
              {investmentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {renderFields()}

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes..."
            multiline
            rows={3}
            fullWidth
            sx={textFieldStyles}
          />

          <Box
            sx={{
              background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
              border: '2px solid #4D79FF40',
              borderRadius: '16px',
              padding: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> After adding your investment, we'll automatically track its
              real-time performance using live market data!
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: '16px',
            borderColor: '#FF6B6B',
            color: '#FF6B6B',
            px: 4,
            py: 1.5,
            '&:hover': {
              borderColor: '#FF6B6B',
              background: '#FF6B6B15',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(77, 121, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(90deg, #2656FF 0%, #17B890 100%)',
              boxShadow: '0 6px 25px rgba(77, 121, 255, 0.4)',
            },
          }}
        >
          {loading ? 'Adding...' : 'Add Investment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
