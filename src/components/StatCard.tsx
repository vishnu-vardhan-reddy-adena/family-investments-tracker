'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  icon: 'wallet' | 'invested' | 'profit' | 'portfolios';
  gradient: string;
}

const iconMap = {
  wallet: AccountBalanceWalletIcon,
  invested: WorkIcon,
  profit: ShowChartIcon,
  portfolios: WorkIcon,
};

export function StatCard({ title, value, subtitle, trend, icon, gradient }: StatCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        '@media (prefers-color-scheme: dark)': {
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        },
      }}
    >
      {/* Animated background blob */}
      <Box
        className="absolute -top-4 -right-4 h-20 w-20 rounded-full blur-2xl sm:h-24 sm:w-24"
        sx={{
          background: gradient,
          opacity: 0.2,
        }}
      />

      <CardContent className="relative">
        <div className="mb-2 flex items-center justify-between">
          <Typography
            variant="body2"
            className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400"
          >
            {title}
          </Typography>
          <Box
            className="rounded-xl p-1.5 shadow-lg sm:p-2"
            sx={{
              background: gradient,
            }}
          >
            <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </Box>
        </div>

        <Typography
          variant="h4"
          component="div"
          className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
        >
          {value}
        </Typography>

        {(subtitle || trend) && (
          <div className="mt-2 flex items-center text-xs sm:text-sm">
            {trend && (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <TrendingUpIcon className="mr-1 h-4 w-4" />
                {trend}
              </span>
            )}
            {subtitle && <span className="ml-2 text-gray-500">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
