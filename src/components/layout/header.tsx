'use client';

import { DevAdrianSwapIcon } from '@/components/icons/devadrian-swap-icon';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/context/i18n-context';

export function Header() {
  const { t } = useI18n();

  const handleResetLayout = () => {
    const event = new CustomEvent('resetDashboardLayout');
    window.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <a href="/" className="flex items-center gap-2">
            <DevAdrianSwapIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">DevAdrian Swap</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="bg-background/50" onClick={handleResetLayout}>
                  <RotateCcw className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">{t('header.resetLayout')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('header.resetLayout')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
