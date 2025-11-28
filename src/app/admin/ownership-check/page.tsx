'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { getContractOwnerAddress, checkContractOwner, isLIPTOwner, getOwnershipChain } from '@/services/web3-api';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { Address } from 'viem';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OwnershipResult {
  contractName: string;
  contractAddress: string;
  owner: string | null;
  isYourWallet: boolean;
  canManage: boolean;
  error?: string;
}

export default function OwnershipCheckPage() {
  const { address: userAddress } = useAccount();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<OwnershipResult[]>([]);
  const [protocolControllerOwner, setProtocolControllerOwner] = useState<string | null>(null);
  const [isProtocolControllerOwner, setIsProtocolControllerOwner] = useState<boolean>(false);

  const contracts = [
    { name: 'LIPT Token', address: CONTRACT_ADDRESSES.liptToken },
    { name: 'Mock USDT', address: CONTRACT_ADDRESSES.mockUsdt },
    { name: 'Staking Pool', address: CONTRACT_ADDRESSES.stakingPool },
    { name: 'Mining Pool', address: CONTRACT_ADDRESSES.miningPool },
    { name: 'Swap Pool', address: CONTRACT_ADDRESSES.swapPool },
    { name: 'Wheel of Fortune', address: CONTRACT_ADDRESSES.wheelOfFortune },
    { name: 'Rocket Game', address: CONTRACT_ADDRESSES.rocketGame },
    { name: 'Lottery', address: CONTRACT_ADDRESSES.lottery },
    { name: 'Referral Program', address: CONTRACT_ADDRESSES.referralProgram },
  ];

  const checkAllOwnerships = async () => {
    if (!userAddress) {
      alert('Conecte sua carteira primeiro!');
      return;
    }

    setIsChecking(true);
    const resultsArray: OwnershipResult[] = [];

    try {
      // Verificar ProtocolController primeiro
      const pcOwner = await getContractOwnerAddress(CONTRACT_ADDRESSES.protocolController as Address);
      setProtocolControllerOwner(pcOwner);
      
      const isPCOwner = await isLIPTOwner(userAddress as Address);
      setIsProtocolControllerOwner(isPCOwner);

      // Verificar cada contrato
      for (const contract of contracts) {
        if (!contract.address) continue;

        try {
          const owner = await getContractOwnerAddress(contract.address as Address);
          const canManage = await checkContractOwner(contract.address as Address, userAddress as Address);
          const isYourWallet = owner?.toLowerCase() === userAddress.toLowerCase();

          resultsArray.push({
            contractName: contract.name,
            contractAddress: contract.address as string,
            owner: owner || 'Desconhecido',
            isYourWallet,
            canManage,
          });
        } catch (error: any) {
          resultsArray.push({
            contractName: contract.name,
            contractAddress: contract.address as string,
            owner: null,
            isYourWallet: false,
            canManage: false,
            error: error.message,
          });
        }
      }

      // Verificar ProtocolController também
      resultsArray.push({
        contractName: 'ProtocolController',
        contractAddress: CONTRACT_ADDRESSES.protocolController as string,
        owner: pcOwner,
        isYourWallet: isPCOwner,
        canManage: isPCOwner,
      });

      setResults(resultsArray);
    } catch (error: any) {
      console.error('Erro ao verificar ownership:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Verificação de Ownership</h1>
        <p className="text-muted-foreground">Verifique quem é o owner de cada contrato e se você pode gerenciá-los.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Ownership</CardTitle>
          <CardDescription>
            Clique no botão abaixo para verificar o ownership de todos os contratos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userAddress && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Carteira Conectada</AlertTitle>
              <AlertDescription>
                {userAddress}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={checkAllOwnerships} 
            disabled={!userAddress || isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Todos os Contratos'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Resultados:</h3>
              
              {isProtocolControllerOwner && (
                <Alert className="border-green-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>✅ Você é Owner do ProtocolController</AlertTitle>
                  <AlertDescription>
                    Se os contratos foram transferidos para o ProtocolController, você pode gerenciá-los.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <Card key={index} className={result.canManage ? 'border-green-500' : 'border-red-500'}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{result.contractName}</CardTitle>
                        {result.canManage ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Endereço: </span>
                        <span className="text-xs font-mono">{result.contractAddress}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Owner Atual: </span>
                        <span className="text-xs font-mono">{result.owner || 'Erro ao buscar'}</span>
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-500">
                          Erro: {result.error}
                        </div>
                      )}
                      <div>
                        {result.canManage ? (
                          <span className="text-sm text-green-500 font-medium">✅ Você pode gerenciar este contrato</span>
                        ) : (
                          <span className="text-sm text-red-500 font-medium">❌ Você NÃO pode gerenciar este contrato</span>
                        )}
                      </div>
                      <div>
                        <a 
                          href={`https://polygonscan.com/address/${result.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Ver no Polygonscan →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Próximos Passos</AlertTitle>
                <AlertDescription>
                  {results.filter(r => r.canManage).length === 0 ? (
                    <>
                      Você não é owner de nenhum contrato. Para resolver isso:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Se você tem acesso às private keys das carteiras owners, use o script Hardhat para transferir</li>
                        <li>Se os contratos foram transferidos para ProtocolController, você precisa ser owner do ProtocolController</li>
                        <li>Se não tiver acesso, pode ser necessário fazer deploy de novos contratos</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      Você pode gerenciar {results.filter(r => r.canManage).length} de {results.length} contratos.
                      Use a interface admin para criar planos e configurar os contratos.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

