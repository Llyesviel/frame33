'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gauge, Mountain } from 'lucide-react';
import type { ISSPosition } from '@/lib/types';

interface ISSMetricsProps {
  position: ISSPosition | null;
  loading: boolean;
  error: string | null;
}

export function ISSMetrics({ position, loading, error }: ISSMetricsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Нет данных по МКС</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Скорость МКС</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {position.velocity_kmh.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground">км/ч</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Высота МКС</CardTitle>
          <Mountain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {position.altitude_km.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground">км</p>
        </CardContent>
      </Card>
    </div>
  );
}
