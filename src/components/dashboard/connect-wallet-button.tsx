'use client';

import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { copy } from 'fs-extra';
import { useToast } from '@/hooks/use-toast';


export function ConnectWalletButton() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const copyToClipboard = () => {
    if(!address) return;
    navigator.clipboard.writeText(address);
    toast({
      title: t('referralProgram.copied'),
    });
  };

  if (isConnecting) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-background/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('wallet.connecting', {defaultValue: 'Connecting...'})}
      </Button>
    )
  }

  if (isConnected && address) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt="Wallet Avatar" />
                        <AvatarFallback>{shortAddress.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {shortAddress}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('wallet.myWallet', {defaultValue: 'My Wallet'})}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyToClipboard}>
                    {t('wallet.copyAddress', { defaultValue: 'Copy Address' })}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => disconnect()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('wallet.disconnect')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => connect({ connector: injected() })} variant="outline" className="gap-2 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
      <Wallet className="h-4 w-4" />
      {t('wallet.connect')}
    </Button>
  );
}
