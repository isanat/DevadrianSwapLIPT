'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Gift, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerReferrer } from '@/services/web3-api';
import { Skeleton } from '@/components/ui/skeleton';

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { toast } = useToast();
  
  const [refAddress, setRefAddress] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setRefAddress(ref);
      
      // Verificar se já está registrado (se já tiver carteira conectada)
      if (isConnected && userAddress) {
        checkRegistrationStatus();
      }
    } else {
      setError('Link de convite inválido - parâmetro ref não encontrado');
    }
  }, [searchParams, isConnected, userAddress]);

  const checkRegistrationStatus = async () => {
    if (!userAddress || !refAddress) return;

    try {
      const { getReferralViewData } = await import('@/services/web3-api');
      const referralData = await getReferralViewData(userAddress as any);
      
      // Se já tiver um referrer, significa que já está registrado
      if (referralData?.referrer && referralData.referrer !== '0x0000000000000000000000000000000000000000') {
        setIsRegistered(true);
        
        // Se o referrer atual é diferente do ref da URL, mostrar aviso
        if (referralData.referrer.toLowerCase() !== refAddress.toLowerCase()) {
          setError(`Você já está registrado com outro referrer: ${referralData.referrer}`);
        }
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const handleRegisterReferrer = async () => {
    if (!userAddress || !refAddress) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Endereço de referrer inválido',
      });
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      await registerReferrer(userAddress, refAddress as any);
      
      setIsRegistered(true);
      toast({
        title: 'Sucesso!',
        description: 'Você foi registrado com sucesso no programa de afiliados!',
      });

      // Redirecionar para a página principal após 2 segundos
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error registering referrer:', error);
      setError(error.message || 'Erro ao registrar referrer. Você pode já estar registrado.');
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao registrar referrer',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (!refAddress) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-destructive" />
                Link Inválido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                O link de convite está inválido. Por favor, verifique o link e tente novamente.
              </p>
              <Button onClick={() => router.push('/')} className="w-full mt-4">
                Ir para Página Principal
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Convite de Afiliado</CardTitle>
            <CardDescription>
              Você foi convidado para participar do programa de afiliados!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isRegistered && (
              <div className="rounded-lg bg-green-500/10 p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Você já está registrado no programa de afiliados!</span>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-2">Referrer:</p>
              <p className="font-mono text-sm break-all">{refAddress}</p>
            </div>

            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para participar do programa de afiliados, você precisa conectar sua carteira primeiro.
                </p>
                <Button onClick={handleConnectWallet} className="w-full" size="lg">
                  Conectar Carteira
                </Button>
              </div>
            ) : isRegistered ? (
              <Button 
                onClick={() => router.push('/')} 
                className="w-full" 
                size="lg"
                variant="default"
              >
                Ir para Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleRegisterReferrer}
                disabled={isRegistering}
                className="w-full"
                size="lg"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar no Programa de Afiliados'
                )}
              </Button>
            )}

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              <p>
                Ao registrar, você receberá comissões quando seus indicados realizarem transações na plataforma.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Componente de fallback para Suspense
function InvitePageSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Exportar o componente principal com Suspense
export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageSkeleton />}>
      <InvitePageContent />
    </Suspense>
  );
}
