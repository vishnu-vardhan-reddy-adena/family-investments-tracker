'use client';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

interface InvestmentCardProps {
  type: string;
  icon: React.ReactNode;
  totalValue: number;
  change: number;
  changePercent: number;
  holdings: number;
  color: string;
}

export function InvestmentCard({
  type,
  icon,
  totalValue,
  change,
  changePercent,
  holdings,
  color,
}: InvestmentCardProps) {
  const isPositive = change >= 0;

  return (
    <Card
      className="group relative overflow-hidden"
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${color}40`,
        transition: 'all 0.3s ease',
        '&:hover': {
          border: `2px solid ${color}`,
        },
      }}
    >
      {/* Animated background blob */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          filter: 'blur(40px)',
          transition: 'all 0.5s ease',
          '.group:hover &': {
            transform: 'scale(1.5)',
          },
        }}
      />

      <CardContent className="relative z-10">
        {/* Header */}
        <Box className="mb-4 flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `${color}20`,
                color: color,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" className="font-semibold">
              {type}
            </Typography>
          </Box>
          <Chip
            label={`${holdings} Holdings`}
            size="small"
            sx={{
              background: `${color}15`,
              color: color,
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Value */}
        <Typography variant="h4" className="mb-2 font-bold" sx={{ color: color }}>
          ₹{totalValue.toLocaleString('en-IN')}
        </Typography>

        {/* Change */}
        <Box className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUpIcon sx={{ color: '#1DD1A1', fontSize: 20 }} />
          ) : (
            <TrendingDownIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? '#1DD1A1' : '#FF6B6B',
              fontWeight: 600,
            }}
          >
            {isPositive ? '+' : ''}₹{change.toLocaleString('en-IN')} ({isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </Typography>
        </Box>

        {/* Footer */}
        <Typography variant="caption" className="mt-2 block text-gray-500 dark:text-gray-400">
          Today's Change
        </Typography>
      </CardContent>
    </Card>
  );
}
