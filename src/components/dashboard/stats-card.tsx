'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, AreaProps } from 'recharts';
import { Skeleton } from '../ui/skeleton';

type StatsCardProps = {
  title: string;
  value?: number | string;
  icon: ReactNode;
  change?: string;
  isLoading: boolean;
  prefix?: string;
  suffix?: string;
  description?: string;
  chartData?: any[];
  chartKey?: string;
  className?: string;
};

export function StatsCard({ title, value, icon, change, isLoading, prefix, suffix, description, chartData, chartKey, className }: StatsCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (isLoading || !isClient) {
    return (
        <Card className={className}>
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

  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', {maximumFractionDigits: 2}) : value;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
          <div className="text-2xl font-bold">{prefix}{formattedValue}{suffix}</div>
          {change && <p className="text-xs text-green-400">{change} from last month</p>}
          {description && !chartData && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
          {chartData && chartKey && (
            <div className="h-16 -ml-6 -mr-2 -mb-6">
                <ChartContainer config={{ [chartKey]: { color: 'hsl(var(--primary))' } }}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id={`fill-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey={chartKey}
                            type="natural"
                            fill={`url(#fill-${chartKey})`}
                            stroke="var(--color-primary)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
