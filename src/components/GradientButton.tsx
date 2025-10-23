'use client';

import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'full';
  children: ReactNode;
  animated?: boolean;
}

export function GradientButton({
  variant = 'primary',
  children,
  animated = true,
  sx,
  ...props
}: GradientButtonProps) {
  const gradients = {
    primary: {
      background: 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 100%)',
      hover: 'linear-gradient(135deg, #2D7FFF 0%, #6C3EFF 100%)',
      shadow: '0 4px 20px rgba(77, 159, 255, 0.3)',
      hoverShadow: '0 8px 32px rgba(77, 159, 255, 0.5)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #FF4FD8 0%, #FF9364 100%)',
      hover: 'linear-gradient(135deg, #FF1FCA 0%, #FF7344 100%)',
      shadow: '0 4px 20px rgba(255, 79, 216, 0.3)',
      hoverShadow: '0 8px 32px rgba(255, 79, 216, 0.5)',
    },
    full: {
      background: 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 33%, #FF4FD8 66%, #FF9364 100%)',
      hover: 'linear-gradient(135deg, #2D7FFF 0%, #6C3EFF 33%, #FF1FCA 66%, #FF7344 100%)',
      shadow: '0 4px 20px rgba(140, 94, 255, 0.3)',
      hoverShadow: '0 8px 32px rgba(140, 94, 255, 0.5)',
    },
  };

  const currentGradient = gradients[variant];

  const buttonContent = (
    <Button
      sx={{
        background: currentGradient.background,
        borderRadius: '16px',
        px: 4,
        py: 1.5,
        fontWeight: 600,
        textTransform: 'none',
        color: '#FFFFFF',
        boxShadow: currentGradient.shadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          background: currentGradient.hover,
          boxShadow: currentGradient.hoverShadow,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s',
        },
        '&:hover::before': {
          left: '100%',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );

  if (!animated) {
    return buttonContent;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {buttonContent}
    </motion.div>
  );
}
