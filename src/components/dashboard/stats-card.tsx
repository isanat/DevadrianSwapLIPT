'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
  chartData?: any[];
  chartKey?: string;
};

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function StatsCard({ title, value, icon, description, className, chartData, chartKey }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    // This effect runs only on the client-side after hydration.
    // It's a safe place to format values that might differ between server and client.
    if (typeof value === 'number') {
      setDisplayValue(value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm transition-all hover:bg-card/90 hover:scale-[1.02] cursor-pointer flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold">{displayValue}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {chartData && chartKey && (
          <div className="h-16 -ml-6 -mr-2 -mb-7 mt-4">
             <ChartContainer config={chartConfig} className="h-full w-full">
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
                  <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-price)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-price)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey={chartKey}
                  type="natural"
                  fill="url(#fillPrice)"
                  fillOpacity={0.4}
                  stroke="var(--color-price)"
                  stackId="a"
                />
                 <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel hideIndicator />}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
