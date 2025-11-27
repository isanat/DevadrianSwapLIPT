'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { Loader2, Coins, ArrowRight, ShieldCheck, ShieldX, Copy } from 'lucide-react';
import { mintMockUSDT, transferLIPT, mintLIPT, isLIPTOwner, getTokenDecimals } from '@/services/web3-api';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { parseEther } from 'viem';

export default function AdminTokensPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { toast } = useToast();

  // Estados para MockUSDT
  const [mockUsdtToAddress, setMockUsdtToAddress] = useState('');
  const [mockUsdtAmount, setMockUsdtAmount] = useState('');
  const [isMintingMockUSDT, setIsMintingMockUSDT] = useState(false);

  // Estados para Transferir LIPT
  const [transferLiptToAddress, setTransferLiptToAddress] = useState('');
  const [transferLiptAmount, setTransferLiptAmount] = useState('');
  const [isTransferringLIPT, setIsTransferringLIPT] = useState(false);

  // Estados para Mintar LIPT
  const [mintLiptToAddress, setMintLiptToAddress] = useState('');
  const [mintLiptAmount, setMintLiptAmount] = useState('');
  const [isMintingLIPT, setIsMintingLIPT] = useState(false);
  const [isLIPTTokenOwner, setIsLIPTTokenOwner] = useState<boolean | null>(null);
  const [isCheckingOwner, setIsCheckingOwner] = useState(false);

  // Verificar se é owner do LIPT Token ao carregar
  useEffect(() => {
    if (userAddress && isConnected) {
      checkLIPTOwner();
    } else {
      setIsLIPTTokenOwner(null);
    }
  }, [userAddress, isConnected]);

  const checkLIPTOwner = async () => {
    if (!userAddress) return;
    
    setIsCheckingOwner(true);
    try {
      const isOwner = await isLIPTOwner(userAddress);
      setIsLIPTTokenOwner(isOwner);
    } catch (error: any) {
      console.error('Error checking owner:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível verificar se você é owner do contrato.',
      });
      setIsLIPTTokenOwner(false);
    } finally {
      setIsCheckingOwner(false);
    }
  };

  const handleMintMockUSDT = async () => {
    if (!userAddress || !isConnected) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Conecte sua carteira primeiro.',
      });
      return;
    }

    if (!mockUsdtToAddress || !mockUsdtAmount) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.',
      });
      return;
    }

    try {
      setIsMintingMockUSDT(true);
      
      // Validar endereço
      if (!/^0x[a-fA-F0-9]{40}$/.test(mockUsdtToAddress)) {
        throw new Error('Endereço inválido');
      }

      // Obter decimais do MockUSDT
      const decimals = await getTokenDecimals(CONTRACT_ADDRESSES.mockUsdt as any);
      const amountBigInt = parseEther(mockUsdtAmount);

      // Mintar MockUSDT
      const hash = await mintMockUSDT(userAddress, mockUsdtToAddress as any, amountBigInt);

      toast({
        title: 'Sucesso!',
        description: `MockUSDT mintado com sucesso! Hash: ${hash.substring(0, 10)}...`,
      });

      setMockUsdtToAddress('');
      setMockUsdtAmount('');
    } catch (error: any) {
      console.error('Error minting MockUSDT:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao mintar MockUSDT',
        description: error.message || 'Ocorreu um erro ao mintar MockUSDT.',
      });
    } finally {
      setIsMintingMockUSDT(false);
    }
  };

  const handleTransferLIPT = async () => {
    if (!userAddress || !isConnected) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Conecte sua carteira primeiro.',
      });
      return;
    }

    if (!transferLiptToAddress || !transferLiptAmount) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.',
      });
      return;
    }

    try {
      setIsTransferringLIPT(true);
      
      // Validar endereço
      if (!/^0x[a-fA-F0-9]{40}$/.test(transferLiptToAddress)) {
        throw new Error('Endereço inválido');
      }

      // Obter decimais do LIPT
      const decimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
      const amountBigInt = parseEther(transferLiptAmount);

      // Transferir LIPT
      const hash = await transferLIPT(userAddress, transferLiptToAddress as any, amountBigInt);

      toast({
        title: 'Sucesso!',
        description: `LIPT transferido com sucesso! Hash: ${hash.substring(0, 10)}...`,
      });

      setTransferLiptToAddress('');
      setTransferLiptAmount('');
    } catch (error: any) {
      console.error('Error transferring LIPT:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao transferir LIPT',
        description: error.message || 'Ocorreu um erro ao transferir LIPT. Verifique se você tem saldo suficiente.',
      });
    } finally {
      setIsTransferringLIPT(false);
    }
  };

  const handleMintLIPT = async () => {
    if (!userAddress || !isConnected) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Conecte sua carteira primeiro.',
      });
      return;
    }

    if (!mintLiptToAddress || !mintLiptAmount) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.',
      });
      return;
    }

    if (isLIPTTokenOwner === false) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você não é o owner do contrato LIPT Token. Apenas o owner pode mintar novos tokens.',
      });
      return;
    }

    try {
      setIsMintingLIPT(true);
      
      // Validar endereço
      if (!/^0x[a-fA-F0-9]{40}$/.test(mintLiptToAddress)) {
        throw new Error('Endereço inválido');
      }

      // Obter decimais do LIPT
      const decimals = await getTokenDecimals(CONTRACT_ADDRESSES.liptToken as any);
      const amountBigInt = parseEther(mintLiptAmount);

      // Mintar LIPT
      const hash = await mintLIPT(userAddress, mintLiptToAddress as any, amountBigInt);

      toast({
        title: 'Sucesso!',
        description: `LIPT mintado com sucesso! Hash: ${hash.substring(0, 10)}...`,
      });

      setMintLiptToAddress('');
      setMintLiptAmount('');
    } catch (error: any) {
      console.error('Error minting LIPT:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao mintar LIPT',
        description: error.message || 'Ocorreu um erro ao mintar LIPT. Verifique se você é o owner do contrato.',
      });
    } finally {
      setIsMintingLIPT(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Copiado!',
      description: 'Endereço copiado para a área de transferência.',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Administração de Tokens</h1>
        <p className="text-muted-foreground">Mintar e transferir tokens do sistema.</p>
      </header>

      {/* Status do Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Alert>
              <ShieldX className="h-4 w-4" />
              <AlertTitle>Conecte sua carteira</AlertTitle>
              <AlertDescription>Conecte sua carteira para verificar se você é owner dos contratos.</AlertDescription>
            </Alert>
          ) : isCheckingOwner ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando...</span>
            </div>
          ) : isLIPTTokenOwner ? (
            <Alert className="border-green-500">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Você é Owner do LIPT Token</AlertTitle>
              <AlertDescription>Você tem permissão para mintar novos tokens LIPT.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <ShieldX className="h-4 w-4" />
              <AlertTitle>Você não é Owner</AlertTitle>
              <AlertDescription>
                Você não é owner do contrato LIPT Token. Algumas funções podem não estar disponíveis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mintar MockUSDT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Mintar MockUSDT
          </CardTitle>
          <CardDescription>
            A função mint() do MockUSDT é pública - qualquer pessoa pode mintar tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mock-usdt-to">Endereço de Destino</Label>
            <div className="flex gap-2">
              <Input
                id="mock-usdt-to"
                placeholder="0x..."
                value={mockUsdtToAddress}
                onChange={(e) => setMockUsdtToAddress(e.target.value)}
                disabled={isMintingMockUSDT}
                className="font-mono"
              />
              {mockUsdtToAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyAddress(mockUsdtToAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Endereço que receberá os MockUSDT tokens</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mock-usdt-amount">Quantidade (MockUSDT)</Label>
            <Input
              id="mock-usdt-amount"
              type="number"
              placeholder="1000"
              value={mockUsdtAmount}
              onChange={(e) => setMockUsdtAmount(e.target.value)}
              disabled={isMintingMockUSDT}
            />
            <p className="text-xs text-muted-foreground">Quantidade de MockUSDT a ser mintada</p>
          </div>
          <Button
            className="w-full"
            onClick={handleMintMockUSDT}
            disabled={isMintingMockUSDT || !isConnected}
          >
            {isMintingMockUSDT ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mintando...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Mintar MockUSDT
              </>
            )}
          </Button>
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Contrato MockUSDT:</strong> {CONTRACT_ADDRESSES.mockUsdt}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6"
                onClick={() => copyAddress(CONTRACT_ADDRESSES.mockUsdt)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Transferir LIPT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transferir LIPT
          </CardTitle>
          <CardDescription>
            Transfere LIPT da sua carteira para outro endereço. Você precisa ter saldo suficiente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-lipt-to">Endereço de Destino</Label>
            <div className="flex gap-2">
              <Input
                id="transfer-lipt-to"
                placeholder="0x..."
                value={transferLiptToAddress}
                onChange={(e) => setTransferLiptToAddress(e.target.value)}
                disabled={isTransferringLIPT}
                className="font-mono"
              />
              {transferLiptToAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyAddress(transferLiptToAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Endereço que receberá os LIPT tokens</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-lipt-amount">Quantidade (LIPT)</Label>
            <Input
              id="transfer-lipt-amount"
              type="number"
              placeholder="1000"
              value={transferLiptAmount}
              onChange={(e) => setTransferLiptAmount(e.target.value)}
              disabled={isTransferringLIPT}
            />
            <p className="text-xs text-muted-foreground">Quantidade de LIPT a ser transferida da sua carteira</p>
          </div>
          <Button
            className="w-full"
            onClick={handleTransferLIPT}
            disabled={isTransferringLIPT || !isConnected}
          >
            {isTransferringLIPT ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferindo...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Transferir LIPT
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mintar LIPT (Owner Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Mintar LIPT (Owner Only)
          </CardTitle>
          <CardDescription>
            Mintar novos tokens LIPT. Apenas o owner do contrato pode executar esta função.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLIPTTokenOwner === false && (
            <Alert variant="destructive">
              <ShieldX className="h-4 w-4" />
              <AlertTitle>Acesso Negado</AlertTitle>
              <AlertDescription>
                Você não é owner do contrato LIPT Token. Esta função está disponível apenas para o owner.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="mint-lipt-to">Endereço de Destino</Label>
            <div className="flex gap-2">
              <Input
                id="mint-lipt-to"
                placeholder="0x..."
                value={mintLiptToAddress}
                onChange={(e) => setMintLiptToAddress(e.target.value)}
                disabled={isMintingLIPT || isLIPTTokenOwner === false}
                className="font-mono"
              />
              {mintLiptToAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyAddress(mintLiptToAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Endereço que receberá os novos tokens LIPT mintados</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mint-lipt-amount">Quantidade (LIPT)</Label>
            <Input
              id="mint-lipt-amount"
              type="number"
              placeholder="1000"
              value={mintLiptAmount}
              onChange={(e) => setMintLiptAmount(e.target.value)}
              disabled={isMintingLIPT || isLIPTTokenOwner === false}
            />
            <p className="text-xs text-muted-foreground">Quantidade de novos tokens LIPT a ser mintada</p>
          </div>
          <Button
            className="w-full"
            onClick={handleMintLIPT}
            disabled={isMintingLIPT || !isConnected || isLIPTTokenOwner === false}
          >
            {isMintingLIPT ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mintando...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Mintar LIPT
              </>
            )}
          </Button>
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Contrato LIPT Token:</strong> {CONTRACT_ADDRESSES.liptToken}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6"
                onClick={() => copyAddress(CONTRACT_ADDRESSES.liptToken)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

