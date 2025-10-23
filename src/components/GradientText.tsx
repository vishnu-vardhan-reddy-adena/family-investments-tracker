'use client';

import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

interface GradientTextProps extends Omit<TypographyProps, 'variant'> {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
  gradient?: 'primary' | 'secondary' | 'full';
  animated?: boolean;
}

export function GradientText({
  children,
  variant = 'h1',
  gradient = 'full',
  animated = false,
  sx,
  ...props
}: GradientTextProps) {
  const gradients = {
    primary: 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 100%)',
    secondary: 'linear-gradient(135deg, #FF4FD8 0%, #FF9364 100%)',
    full: 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 33%, #FF4FD8 66%, #FF9364 100%)',
  };

  return (
    <Typography
      variant={variant}
      sx={{
        background: gradients[gradient],
        backgroundSize: animated ? '200% 200%' : '100% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
        animation: animated ? 'gradient-x 3s ease infinite' : 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}
