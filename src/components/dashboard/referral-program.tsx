'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Gift, Users, Award, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/context/i18n-context';
import { HelpTooltip } from './help-tooltip';
import useSWR from 'swr';
import { getReferralData } from '@/services/mock-api';
import { useAccount } from 'wagmi';
import { Skeleton } from '../ui/skeleton';

export function ReferralDashboard() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { address: userAddress } = useAccount();
  const referralLink = userAddress ? `https://devadrianswap.com/invite?ref=${userAddress}` : "https://devadrianswap.com/invite?ref=...";

  const { data: referralData, isLoading } = useSWR(userAddress ? ['referral', userAddress] : null, () => getReferralData(userAddress!));

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: t('referralProgram.copied'),
      description: t('referralProgram.copiedDesc'),
    });
  };

  const network = referralData?.network || [];
  const totalTeamMembers = network.reduce((sum, ref) => sum + (ref?.members || 0), 0);
  const totalReferrals = referralData?.totalReferrals ?? 0;
  const totalRewards = referralData?.totalRewards ?? 0;

  return (
    <div className="space-y-8 h-full">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-6 w-6 text-primary" />
                        {t('referralProgram.title')}
                    </CardTitle>
                    <HelpTooltip
                        title={t('referralProgram.title')}
                        content={<p>{t('referralProgram.tooltip')}</p>}
                    />
                </div>
            </div>
          <CardDescription>{t('referralProgram.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="referral-link">{t('referralProgram.yourLink')}</Label>
              <div className="flex items-center space-x-2">
                  <Input id="referral-link" value={referralLink} readOnly className="bg-background/50" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                  </Button>
              </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> {t('referralProgram.totalReferrals')}</p>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Award size={16}/> {t('referralProgram.totalRewards')}</p>
                  <p className="text-2xl font-bold">{totalRewards.toLocaleString('en-US', { minimumFractionDigits: 2 })} LIPT</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> {t('referralProgram.totalTeam')}</p>
                  <p className="text-2xl font-bold">{totalTeamMembers}</p>
              </div>
          </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>{t('referralProgram.networkTitle')}</CardTitle>
            <CardDescription>{t('referralProgram.networkDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
                 </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {network.map((referral) => (
                    <div key={referral.id} className="p-4 bg-background/50 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold">{t('referralProgram.level')} {referral.level}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{t('referralProgram.members')}</span>
                                <span className="text-xl font-bold">{referral.members}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{t('referralProgram.commission')}</span>
                                <span className="text-xl font-bold text-primary">{(referral.commission ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
