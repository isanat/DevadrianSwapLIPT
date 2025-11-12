'use client';

import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2, UserCircle } from 'lucide-react';
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
      <Button variant="outline" disabled className="gap-2">
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt="Wallet Avatar" />
                        <AvatarFallback><UserCircle/></AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='w-56'>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>Administrator</p>
                    <p className='text-xs leading-none text-muted-foreground'>{shortAddress}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyToClipboard}>
                    {t('wallet.copyAddress', { defaultValue: 'Copy Address' })}
                </DropdownMenuItem>
                 <DropdownMenuItem>
                    <a href="/" className='w-full'>Frontend</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => disconnect()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('wallet.disconnect')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => connect({ connector: injected() })} variant="secondary" className="gap-2">
      <Wallet className="h-4 w-4" />
      {t('wallet.connect')}
    </Button>
  );
}
