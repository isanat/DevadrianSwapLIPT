'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from '@/context/dashboard-context';

export function ReferralProgram() {
  const { toast } = useToast();
  const { referrals, referralRewards } = useDashboard();
  const referralLink = "https://liptonswap.com/invite?ref=user123";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your referral link.",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Unilevel Referral Program
        </CardTitle>
        <CardDescription>Invite friends and earn rewards from their activities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex items-center space-x-2">
                <Input id="referral-link" value={referralLink} readOnly className="bg-background/50" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center pt-4">
            <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referrals}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Referral Rewards</p>
                <p className="text-2xl font-bold">{referralRewards.toLocaleString()} LIPT</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
