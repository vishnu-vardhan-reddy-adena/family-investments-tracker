'use client';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
}

interface ImportResponse {
  success: boolean;
  message: string;
  stats: ImportStats;
  errors?: string[];
}

export default function ImportTransactionsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
    setError(null);
    // Refresh the page to show new transactions
    if (result?.stats.successful && result.stats.successful > 0) {
      window.location.reload();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        setFile(null);
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Transform data to match API format
          // Expected columns: Date, Type, Symbol, Name, Buy/Sell Price, Shares
          const transactions = jsonData.map((row: any) => {
            // Extract symbol from Symbol field (format: "NSE:IOB" -> "IOB")
            let symbol = row.Symbol || row.symbol || row.Ticker || row.ticker;

            // If Symbol has format "NSE:SYMBOL", extract just the symbol
            if (symbol && symbol.includes(':')) {
              symbol = symbol.split(':')[1];
            }

            // Extract price and determine transaction type
            // Negative price means BUY, positive means SELL
            let rawPrice = row['Buy/Sell Price'] || row.Price || row.price || row['Price'];
            let type = row.Type || row.type || row['Transaction Type'];

            let numericPrice = 0;

            // Determine type from price sign if not explicitly provided
            if (typeof rawPrice === 'string') {
              const isNegative = rawPrice.includes('-');
              if (!type || type === 'BUY') {
                type = isNegative ? 'buy' : 'sell';
              }
              // Remove ₹, -, commas, spaces to get numeric value
              const cleanPrice = rawPrice.replace(/[₹\-,\s]/g, '');
              numericPrice = parseFloat(cleanPrice) || 0;
            } else if (typeof rawPrice === 'number') {
              // Excel might parse as number
              if (!type || type === 'BUY') {
                type = rawPrice < 0 ? 'buy' : 'sell';
              }
              numericPrice = Math.abs(rawPrice);
            }

            if (type) {
              type = type.toLowerCase();
            }

            return {
              date: row.Date || row.date || row['Transaction Date'],
              type: type,
              symbol: symbol,
              name: row.Name || row.name || row['Company Name'] || row['Stock Name'],
              price: numericPrice,
              shares: row.Shares || row.shares || row.Quantity || row.quantity,
            };
          });

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse Excel file
      const transactions = await parseExcelFile(file);

      if (transactions.length === 0) {
        throw new Error('No data found in the file');
      }

      // Validate data
      const invalidRows = transactions.filter((t) => !t.symbol || !t.type || !t.price || !t.shares);
      if (invalidRows.length > 0) {
        throw new Error(
          `Found ${invalidRows.length} rows with missing required fields. Required: Date, Type, Symbol, Price, Shares`
        );
      }

      // Send to API
      const response = await fetch('/api/transactions/import-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import data');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        Import Transactions
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import Transactions from Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload an Excel or CSV file with your transaction history.
              <br />
              <strong>Required columns:</strong> Date, Type, Symbol, Name, Buy/Sell Price, Shares
              <br />
              <strong>Date format:</strong> DD/MM/YYYY
              <br />
              <strong>Symbol format:</strong> NSE:SYMBOL or just SYMBOL
              <br />
              <strong>Price format:</strong> Negative (-₹26.30) = BUY, Positive (+₹26.30) = SELL
              <br />
              <strong>Type:</strong> Optional (auto-detected from price sign) or BUY, SELL, DIVIDEND
            </Typography>

            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="transaction-file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="transaction-file-upload">
              <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
                Choose File
              </Button>
            </label>

            {file && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selected: {file.name}
              </Typography>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Alert severity={result.stats.failed > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {result.message}
                </Typography>
                <Typography variant="body2">
                  Total: {result.stats.total} | Success: {result.stats.successful} | Failed:{' '}
                  {result.stats.failed}
                </Typography>
                {result.errors && result.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">Errors:</Typography>
                    {result.errors.slice(0, 5).map((err, idx) => (
                      <Typography key={idx} variant="caption" display="block">
                        • {err}
                      </Typography>
                    ))}
                    {result.errors.length > 5 && (
                      <Typography variant="caption">
                        ... and {result.errors.length - 5} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Alert>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!file || loading}
            color="primary"
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
