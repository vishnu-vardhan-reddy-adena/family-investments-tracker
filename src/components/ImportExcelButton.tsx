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
  LinearProgress,
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

export default function ImportExcelButton() {
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
          const stocks = jsonData.map((row: any) => {
            // Extract symbol from Ticker (format: "NSE:ABB" -> "ABB")
            let symbol =
              row.symbol ||
              row.Symbol ||
              row.SYMBOL ||
              row['Stock Symbol'] ||
              row.Ticker ||
              row['(Ticker)'];

            // If Ticker has format "NSE:SYMBOL", extract just the symbol
            if (symbol && symbol.includes(':')) {
              symbol = symbol.split(':')[1];
            }

            // Return all fields including metadata
            return {
              symbol: symbol,
              company_name:
                row.company_name ||
                row['Company Name'] ||
                row['Security Name'] ||
                row['(Security Name)'] ||
                row.name ||
                row.Name ||
                row.Company,
              current_price:
                row.current_price ||
                row.price ||
                row.Price ||
                row['Current Price'] ||
                row['(Current Price)'],
              isin: row.isin || row.ISIN || row['Security Id'] || row['(Security Id)'],
              security_code: row['Security Code'] || row['(Security Code)'],
              // Include all additional metadata fields
              Sector: row.Sector || row['(Sector)'],
              Industry: row.Industry || row['(Industry)'],
              'Industry Type': row['Industry Type'] || row['(Industry Type)'],
              'Company Type': row['Company Type'] || row['(Company Type)'],
              'Macro-Economic Indicator':
                row['Macro-Economic Indicator'] || row['(Macro-Economic Indicator)'],
              'Industry Subgroup Name':
                row['Industry Subgroup Name'] || row['(Industry Subgroup Name)'],
              'Market Capitalization':
                row['Market Capitalization'] || row['(Market Capitalization)'],
            };
          });

          resolve(stocks);
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
      const stocks = await parseExcelFile(file);

      if (stocks.length === 0) {
        throw new Error('No data found in the file');
      }

      // Validate data
      const invalidRows = stocks.filter((s) => !s.symbol || !s.company_name);
      if (invalidRows.length > 0) {
        throw new Error(
          `Found ${invalidRows.length} rows with missing symbol or company_name. Please check your Excel file format.`
        );
      }

      // Send to API
      const response = await fetch('/api/stocks/import-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stocks }),
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
        }}
      >
        Import Excel
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import Companies from Excel</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload your Excel file with company data
            </Typography>
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" display="block">
                <strong>Required columns:</strong> symbol, company_name
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Optional:</strong> current_price, isin
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Example: RELIANCE | Reliance Industries Ltd | 2450.50
              </Typography>
            </Alert>
          </Box>

          <Button
            variant="contained"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Choose Excel File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={loading}
            />
          </Button>

          {file && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </Alert>
          )}

          {loading && (
            <Box>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Importing data... Please wait.
              </Typography>
            </Box>
          )}

          {result && (
            <Box>
              <Alert severity={result.stats.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {result.message}
                </Typography>
                <Typography variant="caption" display="block">
                  ✓ Successful: {result.stats.successful}/{result.stats.total}
                </Typography>
                {result.stats.failed > 0 && (
                  <Typography variant="caption" display="block">
                    ✗ Failed: {result.stats.failed}
                  </Typography>
                )}
              </Alert>

              {result.errors && result.errors.length > 0 && (
                <Box
                  sx={{
                    maxHeight: '200px',
                    overflow: 'auto',
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="error" component="pre">
                    {result.errors.join('\n')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
