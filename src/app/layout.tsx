import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Tracker - Track Your Investments',
  description:
    'Comprehensive portfolio tracker for Indian stocks, mutual funds, ETFs, FDs, NPS, EPFO, and real estate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
