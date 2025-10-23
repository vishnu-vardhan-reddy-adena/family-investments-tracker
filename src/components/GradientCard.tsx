'use client';

import { Card, CardProps } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientCardProps extends Omit<CardProps, 'variant'> {
  children: ReactNode;
  cardVariant?: 'border' | 'background' | 'glow';
  animated?: boolean;
}

export function GradientCard({
  children,
  cardVariant = 'border',
  animated = true,
  sx,
  ...props
}: GradientCardProps) {
  const variants = {
    border: {
      background: 'transparent',
      border: '2px solid transparent',
      backgroundImage:
        'linear-gradient(white, white), linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 33%, #FF4FD8 66%, #FF9364 100%)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 4px 20px rgba(140, 94, 255, 0.1)',
      '&:hover': {
        boxShadow: '0 8px 32px rgba(140, 94, 255, 0.2)',
      },
    },
    background: {
      background:
        'linear-gradient(135deg, rgba(77, 159, 255, 0.05) 0%, rgba(255, 147, 100, 0.05) 100%)',
      border: '1px solid rgba(140, 94, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(140, 94, 255, 0.1)',
      '&:hover': {
        background:
          'linear-gradient(135deg, rgba(77, 159, 255, 0.08) 0%, rgba(255, 147, 100, 0.08) 100%)',
        boxShadow: '0 8px 32px rgba(140, 94, 255, 0.15)',
      },
    },
    glow: {
      background: 'white',
      border: 'none',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(140, 94, 255, 0.15)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        background: 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 33%, #FF4FD8 66%, #FF9364 100%)',
        borderRadius: 'inherit',
        zIndex: -1,
        opacity: 0.3,
        filter: 'blur(10px)',
        transition: 'opacity 0.3s ease',
      },
      '&:hover::before': {
        opacity: 0.6,
      },
      '&:hover': {
        boxShadow: '0 8px 32px rgba(140, 94, 255, 0.3)',
      },
    },
  };

  const cardContent = (
    <Card
      sx={{
        borderRadius: '24px',
        padding: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(variants[cardVariant] as any),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );

  if (!animated) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      {cardContent}
    </motion.div>
  );
}
