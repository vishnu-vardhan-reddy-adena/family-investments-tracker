'use client';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { AddTransactionModal } from './AddTransactionModal';

interface AddTransactionButtonProps {
  onSuccess?: () => void;
}

export function AddTransactionButton({ onSuccess }: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{
          background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
          color: 'white',
          borderRadius: '16px',
          px: 3,
          py: 1.5,
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: '0 4px 15px rgba(77, 121, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3D69EF 0%, #0DC191 100%)',
            boxShadow: '0 6px 20px rgba(77, 121, 255, 0.4)',
          },
        }}
      >
        Add Transaction
      </Button>
      <AddTransactionModal open={open} onClose={() => setOpen(false)} onSuccess={handleSuccess} />
    </>
  );
}
