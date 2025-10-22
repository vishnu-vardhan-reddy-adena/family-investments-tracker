'use client';

import { Box, Card, CardContent, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data
const generateData = (period: string) => {
  const baseData = [
    { date: 'Jan', value: 45000, target: 40000 },
    { date: 'Feb', value: 52000, target: 45000 },
    { date: 'Mar', value: 48000, target: 50000 },
    { date: 'Apr', value: 61000, target: 55000 },
    { date: 'May', value: 58000, target: 60000 },
    { date: 'Jun', value: 72000, target: 65000 },
    { date: 'Jul', value: 69000, target: 70000 },
    { date: 'Aug', value: 83000, target: 75000 },
    { date: 'Sep', value: 78000, target: 80000 },
    { date: 'Oct', value: 92000, target: 85000 },
  ];

  if (period === '1M') {
    return baseData.slice(-4);
  } else if (period === '3M') {
    return baseData.slice(-12);
  } else if (period === '6M') {
    return baseData.slice(-24);
  }
  return baseData;
};

export function PortfolioChart() {
  const [period, setPeriod] = useState('1Y');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const data = generateData(period);

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod) setPeriod(newPeriod);
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'line' | 'area' | null
  ) => {
    if (newType) setChartType(newType);
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Box>
            <Typography variant="h5" className="font-bold">
              Portfolio Performance
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Track your investment growth over time
            </Typography>
          </Box>

          <Box className="flex gap-2">
            {/* Chart Type Toggle */}
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="area">Area</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
            </ToggleButtonGroup>

            {/* Period Toggle */}
            <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small">
              <ToggleButton value="1M">1M</ToggleButton>
              <ToggleButton value="3M">3M</ToggleButton>
              <ToggleButton value="6M">6M</ToggleButton>
              <ToggleButton value="1Y">1Y</ToggleButton>
              <ToggleButton value="ALL">ALL</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4D79FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4D79FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1DD1A1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1DD1A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F2E',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#F7FAFC', fontWeight: 600 }}
                itemStyle={{ color: '#A0AEC0' }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4D79FF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Current Value"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#1DD1A1"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorTarget)"
                name="Target"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F2E',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#F7FAFC', fontWeight: 600 }}
                itemStyle={{ color: '#A0AEC0' }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4D79FF"
                strokeWidth={3}
                dot={{ fill: '#4D79FF', r: 4 }}
                activeDot={{ r: 6 }}
                name="Current Value"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#1DD1A1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#1DD1A1', r: 3 }}
                name="Target"
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Stats */}
        <Box className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-4 dark:border-gray-700">
          <Box>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Total Invested
            </Typography>
            <Typography variant="h6" className="font-bold text-[#4D79FF]">
              ₹65,000
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Current Value
            </Typography>
            <Typography variant="h6" className="font-bold text-[#1DD1A1]">
              ₹92,000
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Total Gain
            </Typography>
            <Typography variant="h6" className="font-bold text-[#1DD1A1]">
              +₹27,000
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Return %
            </Typography>
            <Typography variant="h6" className="font-bold text-[#1DD1A1]">
              +41.54%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
