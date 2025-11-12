
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contractConfig } from '@/config/contracts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Percent, Save, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// This would be fetched from the contract
const MOCK_OWNER_ADDRESS = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"; // Vitalik's address as placeholder
const MOCK_PROTOCOL_PAUSED = false;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { chain } = useAccount();
    const currentChainId = chain?.id === 1 ? 'mainnet' : 'sepolia';
    const addresses = contractConfig.addresses[currentChainId];
    
    const [isPaused, setIsPaused] = useState(MOCK_PROTOCOL_PAUSED);

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
                        <CardTitle>Contract Ownership</CardTitle>
                        <CardDescription>View and manage the owner of the contracts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Current Owner</Label>
                             <div className="flex items-center gap-2">
                                <Input readOnly value={MOCK_OWNER_ADDRESS} className="font-mono text-xs bg-muted" />
                                 <Button variant="ghost" size="icon" onClick={() => copyToClipboard(MOCK_OWNER_ADDRESS)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-owner">Transfer Ownership</Label>
                            <Input id="new-owner" placeholder="0x..." />
                            <p className="text-xs text-muted-foreground">Enter the address of the new owner. This action is irreversible.</p>
                        </div>
                        <Button className="w-full" variant="outline">Transfer Ownership</Button>
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

