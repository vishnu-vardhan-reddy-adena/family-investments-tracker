'use client';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import PieChartIcon from '@mui/icons-material/PieChart';
import SavingsIcon from '@mui/icons-material/Savings';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WorkIcon from '@mui/icons-material/Work';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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
  const [step, setStep] = useState<'select-type' | 'fill-form'>('select-type');
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
    {
      value: 'stock' as InvestmentType,
      label: 'Stock',
      icon: <ShowChartIcon sx={{ fontSize: 28 }} />,
      color: '#4D79FF',
    },
    {
      value: 'mutual_fund' as InvestmentType,
      label: 'Mutual Fund',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: '#1DD1A1',
    },
    {
      value: 'etf' as InvestmentType,
      label: 'ETF',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: '#FF6B6B',
    },
    {
      value: 'fixed_deposit' as InvestmentType,
      label: 'Fixed Deposit',
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: '#FFD93D',
    },
    {
      value: 'nps' as InvestmentType,
      label: 'NPS',
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: '#A78BFA',
    },
    {
      value: 'epfo' as InvestmentType,
      label: 'EPF/PF',
      icon: <WorkIcon sx={{ fontSize: 28 }} />,
      color: '#34D399',
    },
    {
      value: 'real_estate' as InvestmentType,
      label: 'Real Estate',
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: '#F59E0B',
    },
    {
      value: 'gold' as InvestmentType,
      label: 'Gold',
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: '#FBBF24',
    },
    {
      value: 'bond' as InvestmentType,
      label: 'Bond',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: '#8B5CF6',
    },
    {
      value: 'other' as InvestmentType,
      label: 'Other',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: '#6B7280',
    },
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
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Search failed:', response.statusText);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
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
    setStep('select-type');
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

  const handleTypeSelect = (type: InvestmentType) => {
    setFormData({ ...formData, investmentType: type });
    setStep('fill-form');
  };

  const handleBackToTypeSelection = () => {
    setStep('select-type');
    setError('');
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
            noOptionsText={
              searchQuery.length < 2
                ? 'Type at least 2 characters to search'
                : 'No stocks found. You can still enter manually below.'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Search ${investmentType === 'stock' ? 'Stock' : investmentType === 'etf' ? 'ETF' : 'Mutual Fund'}`}
                placeholder="Type symbol or company name..."
                helperText="Search for stocks or enter details manually below"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {step === 'fill-form' && (
            <Button
              onClick={handleBackToTypeSelection}
              sx={{
                minWidth: 'auto',
                color: 'white',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <ArrowBackIcon />
            </Button>
          )}
          <span>{step === 'select-type' ? 'Select Investment Type' : 'Add New Investment'}</span>
        </Box>
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
        {step === 'select-type' ? (
          // Step 1: Type Selection Screen
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Choose the type of investment you want to add
            </Typography>

            <Grid container spacing={2}>
              {investmentTypes.map((type) => (
                <Grid size={{ xs: 6, sm: 4 }} key={type.value}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: type.color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${type.color}40`,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleTypeSelect(type.value)}
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        minHeight: '140px',
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: `${type.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: type.color,
                        }}
                      >
                        {type.icon}
                      </Box>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        textAlign="center"
                        sx={{ color: 'text.primary' }}
                      >
                        {type.label}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          // Step 2: Form based on selected type
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
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        {step === 'fill-form' && (
          <>
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
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
