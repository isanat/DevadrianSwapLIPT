'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, Users, Activity, Wallet, TrendingUp } from 'lucide-react';

const stats = [
    { title: 'Total Value Locked (TVL)', value: '$1,234,567.89', icon: <Wallet className="h-6 w-6 text-muted-foreground" />, change: '+2.5%' },
    { title: 'Total Trading Volume', value: '$5,678,910.11', icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, change: '+5.2%' },
    { title: 'Total Users', value: '1,432', icon: <Users className="h-6 w-6 text-muted-foreground" />, change: '+15' },
    { title: 'Protocol Revenue', value: '$12,345.67', icon: <Banknote className="h-6 w-6 text-muted-foreground" />, change: '+8.1%' },
];

const recentActivities = [
    { id: 'TXN12345', type: 'Stake', user: '0x1a2b...c3d4', amount: '5,000 LIPT', status: 'Completed', time: '2 minutes ago' },
    { id: 'TXN12346', type: 'Swap', user: '0x5e6f...a7b8', amount: '1.2 ETH <> 1,500 LIPT', status: 'Completed', time: '5 minutes ago' },
    { id: 'TXN12347', type: 'Unstake', user: '0x9c8d...e7f6', amount: '2,500 LIPT', status: 'Pending', time: '8 minutes ago' },
    { id: 'TXN12348', type: 'Add Liquidity', user: '0x3a4b...c5d6', amount: '1,000 LIPT / 1,250 USDT', status: 'Completed', time: '12 minutes ago' },
    { id: 'TXN12349', type: 'Spin Wheel', user: '0x7e8f...b9a0', amount: 'Bet 100 LIPT, Won 150', status: 'Completed', time: '15 minutes ago' },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Completed': return <Badge variant="secondary" className='text-green-400 border-green-400'>Completed</Badge>;
        case 'Pending': return <Badge variant="secondary" className='text-yellow-400 border-yellow-400'>Pending</Badge>;
        case 'Failed': return <Badge variant="destructive">Failed</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-green-400">{stat.change} from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity /> Recent Platform Activity</CardTitle>
                        <CardDescription>A log of the most recent user transactions and activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount / Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivities.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell>
                                            <div className="font-mono text-xs">{activity.user}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{activity.type}</div>
                                        </TableCell>
                                        <TableCell>{activity.amount}</TableCell>
                                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
