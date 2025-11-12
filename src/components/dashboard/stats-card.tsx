'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart } from 'recharts';
import { Skeleton } from '../ui/skeleton';

type StatsCardProps = {
  title: string;
  value?: number;
  icon: ReactNode;
  change?: string;
  isLoading: boolean;
  prefix?: string;
  suffix?: string;
};

export function StatsCard({ title, value, icon, change, isLoading, prefix, suffix }: StatsCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (isLoading || !isClient) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-3/4 mb-2" />
                {change && <Skeleton className="h-4 w-1/2" />}
            </CardContent>
        </Card>
    )
  }

  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', {maximumFractionDigits: 2}) : '0';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
          <div className="text-2xl font-bold">{prefix}{formattedValue}{suffix}</div>
          {change && <p className="text-xs text-green-400">{change} from last month</p>}
      </CardContent>
    </Card>
  );
}
