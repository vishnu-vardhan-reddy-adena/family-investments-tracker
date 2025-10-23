'use client';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  onThemeChange?: (isDark: boolean) => void;
}

export function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const initialIsDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDark(initialIsDark);
    updateTheme(initialIsDark);
  }, []);

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    onThemeChange?.(dark);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    updateTheme(newIsDark);
  };

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} arrow>
      <IconButton
        onClick={toggleTheme}
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 100%)'
            : 'linear-gradient(135deg, #FF4FD8 0%, #FF9364 100%)',
          color: '#FFFFFF',
          width: 48,
          height: 48,
          boxShadow: isDark
            ? '0 4px 16px rgba(77, 159, 255, 0.3)'
            : '0 4px 16px rgba(255, 79, 216, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: isDark
              ? 'linear-gradient(135deg, #2D7FFF 0%, #6C3EFF 100%)'
              : 'linear-gradient(135deg, #FF1FCA 0%, #FF7344 100%)',
            boxShadow: isDark
              ? '0 6px 24px rgba(77, 159, 255, 0.5)'
              : '0 6px 24px rgba(255, 79, 216, 0.5)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {isDark ? <DarkModeIcon /> : <LightModeIcon />}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
}
