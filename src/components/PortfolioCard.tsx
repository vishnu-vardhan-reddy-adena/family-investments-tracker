'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkIcon from '@mui/icons-material/Work';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface PortfolioCardProps {
  id: string;
  name: string;
  description?: string;
  isPrimary?: boolean;
}

export function PortfolioCard({ id, name, description, isPrimary }: PortfolioCardProps) {
  return (
    <Link href={`/portfolios/${id}`} className="block">
      <Card
        className="group relative overflow-hidden transition-all hover:-translate-y-2 hover:border-violet-400 hover:shadow-2xl"
        sx={{
          background: 'linear-gradient(to bottom right, #ffffff, rgba(139, 92, 246, 0.05))',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          cursor: 'pointer',
          '@media (prefers-color-scheme: dark)': {
            background: 'linear-gradient(to bottom right, #1a1a1a, rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          },
        }}
      >
        {/* Animated background blob */}
        <Box
          className="absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl transition-all group-hover:scale-150"
          sx={{
            background:
              'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
          }}
        />

        <CardContent className="relative">
          <div className="mb-3 flex items-start justify-between">
            <Box
              className="rounded-xl p-3 shadow-lg"
              sx={{
                background: 'linear-gradient(to bottom right, #8b5cf6, #a855f7)',
              }}
            >
              <WorkIcon className="h-6 w-6 text-white" />
            </Box>
            {isPrimary && (
              <Chip
                label="Primary"
                size="small"
                className="font-semibold"
                sx={{
                  background: 'linear-gradient(to right, #8b5cf6, #a855f7)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            )}
          </div>

          <Typography
            variant="h6"
            component="h3"
            className="mb-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            {name}
          </Typography>

          {description && (
            <Typography variant="body2" className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </Typography>
          )}

          <div className="flex items-center justify-between">
            <Typography
              variant="caption"
              className="text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              View Details
            </Typography>
            <ArrowForwardIcon className="h-5 w-5 text-violet-600 transition-transform group-hover:translate-x-1 dark:text-violet-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
