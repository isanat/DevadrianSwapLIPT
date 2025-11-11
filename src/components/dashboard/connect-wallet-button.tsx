'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ConnectWalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { toast } = useToast();

  const handleConnect = () => {
    // This is a mock connection handler.
    // In a real app, you would integrate a library like ethers.js or wagmi.
    if (typeof window.ethereum !== 'undefined') {
      if (isConnected) {
        setIsConnected(false);
        setWalletAddress('');
        toast({ title: 'Wallet Disconnected' });
      } else {
        const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const displayAddress = `${mockAddress.substring(0, 6)}...${mockAddress.substring(mockAddress.length - 4)}`;
        setWalletAddress(displayAddress);
        setIsConnected(true);
        toast({ title: 'Wallet Connected Successfully!' });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'MetaMask Not Found',
        description: 'Please install the MetaMask browser extension.',
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
      {isConnected ? `${walletAddress}` : 'Connect Wallet'}
    </Button>
  );
}
