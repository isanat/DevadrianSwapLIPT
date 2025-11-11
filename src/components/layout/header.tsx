import { DevAdrianSwapIcon } from '@/components/icons/devadrian-swap-icon';
import { ConnectWalletButton } from '@/components/dashboard/connect-wallet-button';
import { LanguageSwitcher } from './language-switcher';

export function Header() {

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
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
