
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contractConfig } from '@/config/contracts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Percent, Save, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getLIPTOwnerAddress, getOwnershipChain } from '@/services/web3-api';
import useSWR from 'swr';
import { ExternalLink } from 'lucide-react';

const MOCK_PROTOCOL_PAUSED = false;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { chain, address: userAddress, isConnected } = useAccount();
    const currentChainId = chain?.id === 137 ? 'mainnet' : 'amoy';
    const addresses = (contractConfig as any)[currentChainId] || {};
    
    const [isPaused, setIsPaused] = useState(MOCK_PROTOCOL_PAUSED);
    const { data: ownerAddress, isLoading: isLoadingOwner } = useSWR(
        isConnected ? 'lipt-owner-address' : null,
        () => getLIPTOwnerAddress(),
        { refreshInterval: 0 } // Não atualizar automaticamente
    );
    const { data: ownershipChain, isLoading: isLoadingOwnershipChain, mutate: refreshOwnershipChain } = useSWR(
        isConnected ? 'ownership-chain' : null,
        () => getOwnershipChain(),
        { refreshInterval: 0 }
    );

    const copyToClipboard = (address: string) => {
        navigator.clipboard.writeText(address);
        toast({ title: "Address copied to clipboard!" });
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground">Manage global protocol parameters and smart contract ownership.</p>
            </header>
            <main className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <Card className='lg:col-span-1'>
                    <CardHeader>
                        <CardTitle>Protocol Fees</CardTitle>
                        <CardDescription>Adjust fees that are collected by the protocol.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="swap-fee">Swap Fee (%)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="swap-fee" type="number" defaultValue="0.3" step="0.01" />
                                <Percent className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">The fee charged on every token swap.</p>
                        </div>
                        <Button className="w-full"><Save className="mr-2" /> Update Fees</Button>
                    </CardContent>
                </Card>

                <Card className='lg:col-span-1'>
                    <CardHeader>
                        <CardTitle>Emergency Controls</CardTitle>
                        <CardDescription>Manage the operational status of the protocol.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant={isPaused ? "destructive" : "default"}>
                            {isPaused ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                            <AlertTitle>{isPaused ? "Protocol is Paused" : "Protocol is Active"}</AlertTitle>
                            <AlertDescription>
                                {isPaused ? "All major functions like staking, swapping, and gaming are currently disabled." : "All systems are operational."}
                            </AlertDescription>
                        </Alert>
                        <Button 
                            className="w-full" 
                            variant={isPaused ? "default" : "destructive"}
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? "Resume Protocol" : "Pause Protocol"}
                        </Button>
                    </CardContent>
                </Card>

                 <Card className='lg:col-span-1'>
                    <CardHeader>
                        <CardTitle>Contract Ownership (LIPT Token)</CardTitle>
                        <CardDescription>View the ownership chain of the LIPT Token contract.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingOwnershipChain ? (
                            <div className="flex items-center gap-2 p-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Carregando cadeia de ownership...</span>
                            </div>
                        ) : ownershipChain ? (
                            <div className="space-y-4">
                                {/* Owner direto do LIPT Token */}
                                <div className="space-y-2">
                                    <Label>Owner Direto do LIPT Token</Label>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={ownershipChain.liptTokenOwner} className="font-mono text-xs bg-muted" />
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ownershipChain.liptTokenOwner)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <a 
                                            href={`https://polygonscan.com/address/${ownershipChain.liptTokenOwner}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    {ownershipChain.isOwnerTransferredToController && (
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                            ⚠️ Ownership foi transferido para o ProtocolController
                                        </p>
                                    )}
                                </div>

                                {/* Owner do ProtocolController (se aplicável) */}
                                {ownershipChain.isOwnerTransferredToController && ownershipChain.protocolControllerOwner && (
                                    <div className="space-y-2">
                                        <Label>Owner do ProtocolController</Label>
                                        <div className="flex items-center gap-2">
                                            <Input readOnly value={ownershipChain.protocolControllerOwner} className="font-mono text-xs bg-muted" />
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ownershipChain.protocolControllerOwner!)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <a 
                                                href={`https://polygonscan.com/address/${ownershipChain.protocolControllerOwner}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 hover:bg-muted rounded"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Owner Final (quem realmente controla) */}
                                <div className="space-y-2">
                                    <Label>Owner Final (Quem Controla)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={ownershipChain.finalOwner} className="font-mono text-xs bg-muted font-bold" />
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ownershipChain.finalOwner)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <a 
                                            href={`https://polygonscan.com/address/${ownershipChain.finalOwner}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    {userAddress && (
                                        <p className={`text-xs font-semibold ${ownershipChain.finalOwner.toLowerCase() === userAddress.toLowerCase() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {ownershipChain.finalOwner.toLowerCase() === userAddress.toLowerCase() 
                                                ? '✅ Você é o owner final (tem controle total)'
                                                : '❌ Você NÃO é o owner final'}
                                        </p>
                                    )}
                                </div>

                                {/* Informações sobre ProtocolController */}
                                {ownershipChain.isOwnerTransferredToController && (
                                    <div className="space-y-2">
                                        <Label>Endereço do ProtocolController</Label>
                                        <div className="flex items-center gap-2">
                                            <Input readOnly value={ownershipChain.protocolControllerAddress} className="font-mono text-xs bg-muted" />
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ownershipChain.protocolControllerAddress)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <a 
                                                href={`https://polygonscan.com/address/${ownershipChain.protocolControllerAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 hover:bg-muted rounded"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <Button onClick={() => refreshOwnershipChain()} variant="outline" className="w-full">
                                    Atualizar Informações
                                </Button>
                            </div>
                        ) : (
                            <Alert variant="destructive">
                                <AlertDescription className="text-xs">
                                    Não foi possível buscar a cadeia de ownership. Verifique sua conexão com a blockchain.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card className='md:col-span-2 lg:col-span-3'>
                    <CardHeader>
                        <CardTitle>Deployed Contract Addresses</CardTitle>
                        <CardDescription>
                            Reference addresses for the currently connected network <Badge>{currentChainId}</Badge>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(addresses).map(([name, address]) => (
                            <div key={name} className="space-y-1">
                                <Label className="capitalize text-muted-foreground">{name.replace(/([A-Z])/g, ' $1')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value={address} className="font-mono text-xs h-9 bg-muted" />
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(address)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}

