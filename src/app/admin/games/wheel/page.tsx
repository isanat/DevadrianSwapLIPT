'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';

const initialSegments = [
    { value: 1.5, weight: 8, color: '#6366f1' },
    { value: 0,   weight: 25, color: '#ef4444' },
    { value: 1,   weight: 10, color: '#22c55e' },
    { value: 3,   weight: 2, color: '#8b5cf6' },
    { value: 0.5, weight: 20, color: '#f97316' },
    { value: 2,   weight: 5, color: '#3b82f6' },
    { value: 0,   weight: 20, color: '#ef4444' },
    { value: 1,   weight: 10, color: '#16a34a' },
];

type Segment = typeof initialSegments[0];

export default function AdminWheelPage() {
    const [segments, setSegments] = useState<Segment[]>(initialSegments);

    const handleSegmentChange = (index: number, field: keyof Segment, newValue: number) => {
        const newSegments = [...segments];
        newSegments[index] = { ...newSegments[index], [field]: newValue };
        setSegments(newSegments);
    };

    const handleAddSegment = () => {
        setSegments([...segments, { value: 1, weight: 5, color: '#cccccc' }]);
    }

    const handleDeleteSegment = (index: number) => {
        setSegments(segments.filter((_, i) => i !== index));
    }

    const totalWeight = segments.reduce((acc, seg) => acc + seg.weight, 0);

    return (
        <div className="flex flex-1 flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Wheel of Fortune Management</h1>
                <p className="text-muted-foreground">Adjust game parameters and view play history.</p>
            </header>
            <main>
                <Card>
                    <CardHeader>
                        <CardTitle>Wheel Configuration</CardTitle>
                        <CardDescription>
                            Modify segment multipliers and weights to control the game's economy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Multiplier (e.g., 1.5x)</TableHead>
                                    <TableHead>Weight (Probability)</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {segments.map((seg, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input type="number" value={seg.value} onChange={(e) => handleSegmentChange(index, 'value', parseFloat(e.target.value))} className='w-24' />
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Input type="number" value={seg.weight} onChange={(e) => handleSegmentChange(index, 'weight', parseInt(e.target.value))} className='w-24' />
                                                <span className='text-xs text-muted-foreground'>({((seg.weight / totalWeight) * 100).toFixed(2)}%)</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                             <Input type="color" value={seg.color} onChange={(e) => handleSegmentChange(index, 'color', e.target.value as any)} className='p-0 w-12 h-10' />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                                                <Trash2 className='h-4 w-4 text-destructive' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className='flex justify-between items-center mt-4'>
                            <div>
                                <Button variant="outline" onClick={handleAddSegment}><Plus className='mr-2 h-4 w-4'/> Add Segment</Button>
                            </div>
                            <div className='flex items-center gap-4'>
                                <p className='text-sm font-medium'>Total Weight: {totalWeight}</p>
                                <Button><Save className='mr-2 h-4 w-4'/> Save Configuration</Button>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
