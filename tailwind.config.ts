import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand gradient colors
        brand: {
          blue: '#4D9FFF',
          'blue-light': '#7DB9FF',
          'blue-dark': '#2D7FFF',
          purple: '#8C5EFF',
          'purple-light': '#A87EFF',
          'purple-dark': '#6C3EFF',
          pink: '#FF4FD8',
          'pink-light': '#FF7FE6',
          'pink-dark': '#FF1FCA',
          orange: '#FF9364',
          'orange-light': '#FFB394',
          'orange-dark': '#FF7344',
        },
        // Background colors
        bg: {
          light: '#F8F9FA',
          dark: '#121212',
          'paper-light': '#FFFFFF',
          'paper-dark': '#1E1E1E',
        },
        // Text colors
        text: {
          light: '#222222',
          dark: '#EDEDED',
          'secondary-light': '#64748B',
          'secondary-dark': '#94A3B8',
        },
      },
      backgroundImage: {
        // Gradient combinations
        'gradient-primary': 'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF4FD8 0%, #FF9364 100%)',
        'gradient-full':
          'linear-gradient(135deg, #4D9FFF 0%, #8C5EFF 33%, #FF4FD8 66%, #FF9364 100%)',
        'gradient-hover-primary': 'linear-gradient(135deg, #2D7FFF 0%, #6C3EFF 100%)',
        'gradient-hover-secondary': 'linear-gradient(135deg, #FF1FCA 0%, #FF7344 100%)',
        // Radial gradients for effects
        'radial-primary': 'radial-gradient(circle at center, #4D9FFF 0%, #8C5EFF 100%)',
        'radial-secondary': 'radial-gradient(circle at center, #FF4FD8 0%, #FF9364 100%)',
      },
      boxShadow: {
        'gradient-sm': '0 2px 8px rgba(77, 159, 255, 0.15)',
        'gradient-md': '0 4px 16px rgba(77, 159, 255, 0.25)',
        'gradient-lg': '0 8px 32px rgba(77, 159, 255, 0.35)',
        'gradient-xl': '0 12px 48px rgba(77, 159, 255, 0.45)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
