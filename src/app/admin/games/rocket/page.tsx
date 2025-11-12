'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminRocketPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">LIPT Rocket Management</h1>
                <p className="text-muted-foreground">Configure crash game settings and monitor rounds.</p>
            </header>
            <main className='grid gap-4 md:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Game Configuration</CardTitle>
                        <CardDescription>
                            Adjust house edge and other core game parameters.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor="house-edge">House Edge (%)</Label>
                            <Input id="house-edge" type="number" defaultValue="2.5" step="0.1" />
                            <p className="text-xs text-muted-foreground">The percentage of each bet the protocol keeps on average.</p>
                        </div>
                        <Button className='w-full'>Save Configuration</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Round History</CardTitle>
                        <CardDescription>
                            Analytics on recent game rounds.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>A list of recent crash points, total wagered, and outcomes will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
