'use client';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { AddInvestmentModal } from './AddInvestmentModal';

interface AddInvestmentButtonProps {
  onSuccess?: () => void;
}

export function AddInvestmentButton({ onSuccess }: AddInvestmentButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = () => {
    setModalOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setModalOpen(true)}
        sx={{
          background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
          borderRadius: '16px',
          px: 3,
          py: 1.5,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 20px rgba(77, 121, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(90deg, #2656FF 0%, #17B890 100%)',
            boxShadow: '0 6px 25px rgba(77, 121, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        Add Investment
      </Button>

      <AddInvestmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
