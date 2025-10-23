'use client';

import { CloudDownload, Refresh } from '@mui/icons-material';
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
import { useState } from 'react';

interface FetchStats {
  total: number;
  successful: number;
  failed: number;
}

interface FetchResponse {
  success: boolean;
  message: string;
  stats: FetchStats;
  errors?: string[];
}

interface StatusResponse {
  stocksInDatabase: number;
  lastUpdated: string | null;
  message: string;
}

export default function FetchNSEDataButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [result, setResult] = useState<FetchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/stocks/fetch-nse');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      console.error('Error fetching status:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setResult(null);
    setError(null);
    fetchStatus();
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setError(null);
  };

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/stocks/fetch-nse', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch NSE data');
      }

      setResult(data);
      // Refresh status after successful fetch
      await fetchStatus();
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
        startIcon={<CloudDownload />}
        onClick={handleOpen}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Fetch NSE Data
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Fetch NSE Stock Data</DialogTitle>
        <DialogContent>
          {status && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Alert severity={status.stocksInDatabase > 0 ? 'success' : 'info'}>
                <Typography variant="body2">
                  <strong>{status.stocksInDatabase}</strong> stocks in database
                </Typography>
                {status.lastUpdated && (
                  <Typography variant="caption" display="block">
                    Last updated: {new Date(status.lastUpdated).toLocaleString()}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {loading && (
            <Box>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Fetching data from NSE... This may take a minute.
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

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will fetch live data for top 50 NSE stocks (Nifty 50) from Yahoo Finance and update
            the market_data table. The process takes about 1-2 minutes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <Button
            onClick={handleFetchData}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          >
            {loading ? 'Fetching...' : result ? 'Refresh Data' : 'Fetch Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
