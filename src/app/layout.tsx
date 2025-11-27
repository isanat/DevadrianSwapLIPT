import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from '@/context/i18n-context';
import { SWRProvider } from '@/context/swr-provider';
import { Web3Provider } from '@/context/web3-provider';
import { ThemeProvider } from '@/context/theme-provider';
import { Footer } from '@/components/layout/footer';

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
    <html lang="en" className="dark" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <I18nProvider>
              <SWRProvider>
                {children}
              </SWRProvider>
            </I18nProvider>
          </Web3Provider>
          <Toaster />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
