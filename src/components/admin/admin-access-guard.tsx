'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldX, AlertTriangle } from 'lucide-react';
import { getOwnershipChain } from '@/services/web3-api';
import { isLIPTOwner } from '@/services/web3-api';

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [ownershipChain, setOwnershipChain] = useState<{
    finalOwner: string;
    protocolControllerOwner: string | null;
    isOwnerTransferredToController: boolean;
  } | null>(null);

  const checkOwnerStatus = useCallback(async () => {
    setIsChecking(true);
    
    if (!isConnected || !userAddress) {
      setIsOwner(false);
      setIsChecking(false);
      return;
    }

    try {
      console.log('AdminAccessGuard: Verificando owner para:', userAddress);
      const ownerStatus = await isLIPTOwner(userAddress);
      console.log('AdminAccessGuard: Resultado da verificação:', ownerStatus);
      setIsOwner(ownerStatus);
      
      // Buscar a cadeia de ownership para mostrar informações na mensagem de erro
      try {
        const chain = await getOwnershipChain();
        setOwnershipChain({
          finalOwner: chain.finalOwner,
          protocolControllerOwner: chain.protocolControllerOwner,
          isOwnerTransferredToController: chain.isOwnerTransferredToController,
        });
      } catch (error) {
        console.error('Error fetching ownership chain:', error);
      }
    } catch (error: any) {
      console.error('Error checking owner status:', error);
      console.error('Error details:', error?.message, error?.stack);
      setIsOwner(false);
    } finally {
      setIsChecking(false);
    }
  }, [isConnected, userAddress]);

  useEffect(() => {
    checkOwnerStatus();
  }, [checkOwnerStatus]);

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando Acesso
            </CardTitle>
            <CardDescription>
              Verificando se você tem permissão para acessar a área administrativa...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não está conectado
  if (!isConnected) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você precisa conectar sua carteira para acessar a área administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Acesso Restrito</AlertTitle>
              <AlertDescription>
                A área administrativa é restrita apenas ao owner do contrato LIPT Token.
                Por favor, conecte a carteira do owner para continuar.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar para Página Principal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não é owner
  if (!isOwner) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar a área administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Acesso Restrito ao Owner</AlertTitle>
              <AlertDescription>
                Apenas o owner do contrato LIPT Token pode acessar a área administrativa.
                <br />
                <br />
                <strong>Carteira conectada:</strong>
                <br />
                <span className="font-mono text-xs">{userAddress}</span>
                <br />
                <br />
                <strong>⚠️ IMPORTANTE:</strong>
                <br />
                O contrato foi criado via Codex/Hardhat e após várias transferências, a propriedade foi transferida para o ProtocolController.
                <br />
                <br />
                Você precisa conectar a carteira que é o <strong>owner do ProtocolController</strong> para ter acesso.
                <br />
                <br />
                {ownershipChain?.protocolControllerOwner ? (
                  <>
                    <strong>📌 Carteira que você precisa conectar:</strong>
                    <br />
                    <span className="font-mono text-xs bg-yellow-500/20 px-2 py-1 rounded block mt-1 mb-2">
                      {ownershipChain.protocolControllerOwner}
                    </span>
                    <br />
                    Esta é a carteira que atualmente controla o ProtocolController (e indiretamente o LIPT Token).
                    <br />
                    <br />
                    <strong>Próximos passos:</strong>
                    <br />
                    1. Conecte essa carteira no MetaMask
                    <br />
                    2. Certifique-se de que está na rede Polygon Mainnet (Chain ID: 137)
                    <br />
                    3. Tente acessar novamente
                  </>
                ) : (
                  <>
                    <strong>Para descobrir qual carteira é o owner:</strong>
                    <br />
                    1. Verifique o console do navegador (F12) - os logs mostram o owner do ProtocolController
                    <br />
                    2. Ou acesse <code className="text-xs bg-muted px-1 py-0.5 rounded">/admin/settings</code> para ver as informações completas
                    <br />
                    3. Conecte essa carteira no MetaMask
                  </>
                )}
                <br />
                <br />
                <strong>Endereço do contrato LIPT Token:</strong>
                <br />
                <span className="font-mono text-xs">0x15F6CAfD1fE68B0BCddecb28a739d14dB38947e6</span>
                <br />
                <br />
                Se a rede não estiver configurada para Polygon Mainnet (Chain ID: 137), configure primeiro.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={checkOwnerStatus} variant="outline" className="flex-1">
                Verificar Novamente
              </Button>
              <Button onClick={() => router.push('/')} className="flex-1">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é owner, mostrar o conteúdo
  return <>{children}</>;
}


