'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Gift, Users, Award, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from '@/context/dashboard-context';
import { useI18n } from '@/context/i18n-context';

const mockReferrals = [
    { id: 1, level: 1, members: 5, commission: 120.50 },
    { id: 2, level: 2, members: 12, commission: 250.75 },
    { id: 3, level: 3, members: 25, commission: 480.00 },
    { id: 4, level: 4, members: 40, commission: 750.20 },
    { id: 5, level: 5, members: 60, commission: 1100.00 },
];

export function ReferralDashboard() {
  const { toast } = useToast();
  const { referrals, referralRewards } = useDashboard();
  const { t } = useI18n();
  const referralLink = "https://devadrianswap.com/invite?ref=user123";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: t('referralProgram.copied'),
      description: t('referralProgram.copiedDesc'),
    });
  };

  const totalTeamMembers = mockReferrals.reduce((sum, ref) => sum + ref.members, 0);

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            {t('referralProgram.title')}
          </CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> {t('referralProgram.totalReferrals')}</p>
                  <p className="text-2xl font-bold">{referrals}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Award size={16}/> {t('referralProgram.totalRewards')}</p>
                  <p className="text-2xl font-bold">{referralRewards.toLocaleString('en-US', { minimumFractionDigits: 2 })} LIPT</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> {t('referralProgram.totalTeam')}</p>
                  <p className="text-2xl font-bold">{totalTeamMembers}</p>
              </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>{t('referralProgram.networkTitle')}</CardTitle>
            <CardDescription>{t('referralProgram.networkDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {mockReferrals.map((referral) => (
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
                                <span className="text-xl font-bold text-primary">{referral.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
