'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Gift, Users, Award } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from '@/context/dashboard-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const referralLink = "https://liptonswap.com/invite?ref=user123";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your referral link.",
    });
  };

  const totalTeamMembers = mockReferrals.reduce((sum, ref) => sum + ref.members, 0);

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Unilevel Referral Program
          </CardTitle>
          <CardDescription>Invite friends and earn rewards from their activities across multiple levels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="referral-link">Your Unique Referral Link</Label>
              <div className="flex items-center space-x-2">
                  <Input id="referral-link" value={referralLink} readOnly className="bg-background/50" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                  </Button>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> Total Referrals</p>
                  <p className="text-2xl font-bold">{referrals}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Award size={16}/> Total Referral Rewards</p>
                  <p className="text-2xl font-bold">{referralRewards.toLocaleString('en-US', { minimumFractionDigits: 2 })} LIPT</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Users size={16}/> Total Team Members</p>
                  <p className="text-2xl font-bold">{totalTeamMembers}</p>
              </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Your Unilevel Network</CardTitle>
            <CardDescription>View the members and commissions earned from each level of your network.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead className="text-center">Members</TableHead>
                        <TableHead className="text-right">Commission (LIPT)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                            <TableCell className="font-medium">Level {referral.level}</TableCell>
                            <TableCell className="text-center">{referral.members}</TableCell>
                            <TableCell className="text-right">{referral.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
