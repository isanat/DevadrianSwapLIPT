'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';

export function ConnectWalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const handleConnect = () => {
    if (typeof window.ethereum !== 'undefined') {
      if (isConnected) {
        setIsConnected(false);
        toast({ title: t('wallet.disconnect') });
      } else {
        setIsConnected(true);
        toast({ title: t('wallet.connected') });
      }
    } else {
      toast({
        variant: 'destructive',
        title: t('wallet.metaMaskNotFound'),
        description: t('wallet.installMetaMask'),
      });
    }
  };
  
  useEffect(() => {
    // This effect runs only on the client-side after hydration
    // It's a safe place to interact with `window` or other browser-specific APIs
  }, []);

  return (
    <Button onClick={handleConnect} variant="outline" className="gap-2 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
      <Wallet className="h-4 w-4" />
      {isConnected ? t('wallet.connected') : t('wallet.connect')}
    </Button>
  );
}
