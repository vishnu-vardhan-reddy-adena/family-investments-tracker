import { MuiThemeProvider } from '@/components/MuiThemeProvider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrakInvests - Your AI-Powered Investment Tracker',
  description:
    'Track and manage your Indian investments with TrakInvests. Monitor stocks, mutual funds, ETFs, FDs, NPS, EPFO, and real estate all in one place with real-time NSE data.',
  icons: {
    icon: [{ url: '/icon.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/icon.jpg', type: 'image/jpeg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
