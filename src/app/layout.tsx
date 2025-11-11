import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DashboardProvider } from '@/context/dashboard-context';
import { I18nProvider } from '@/context/i18n-context';

export const metadata: Metadata = {
  title: 'DevAdrian Swap',
  description: 'The premier DeFi platform for token staking and liquidity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <I18nProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
