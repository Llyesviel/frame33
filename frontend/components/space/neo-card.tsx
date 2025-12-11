'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNEO } from '@/hooks/use-space-cache';
import { CircleAlert, Orbit } from 'lucide-react';

export function NEOCard() {
  const { data, loading, error, refetch } = useNEO();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Orbit className="h-4 w-4" />
            Объекты, сближающиеся с Землёй
          </CardTitle>
          <CardDescription>
            {error || 'Нет данных'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get today's asteroids
  const dates = Object.keys(data.near_earth_objects || {});
  const todayObjects = dates.length > 0 ? data.near_earth_objects[dates[0]] : [];
  const hazardousCount = todayObjects.filter(obj => obj.is_potentially_hazardous_asteroid).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Orbit className="h-4 w-4" />
          Объекты, сближающиеся с Землёй
        </CardTitle>
        <CardDescription>Близкие сближения сегодня</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{data.element_count}</span>
          <span className="text-xs text-muted-foreground">астероидов</span>
        </div>
        {hazardousCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <CircleAlert className="h-3 w-3" />
            {hazardousCount} потенциально опасны
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
