
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type ReactNode, useState, useEffect } from 'react';

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
};

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    if (typeof value === 'number') {
      // 'en-US' locale is used to ensure consistency between server and client
      setDisplayValue(value.toLocaleString('en-US'));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
