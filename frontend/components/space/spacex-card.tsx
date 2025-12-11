'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpaceX } from '@/hooks/use-space-cache';
import { Rocket, Calendar, ExternalLink } from 'lucide-react';

export function SpaceXCard() {
  const { data, loading, error, refetch } = useSpaceX();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
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
            <Rocket className="h-4 w-4" />
            Запуск SpaceX
          </CardTitle>
          <CardDescription>
            {error || 'Нет данных'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const launchDate = new Date(data.date_utc);
  const isUpcoming = data.upcoming;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            SpaceX
          </CardTitle>
          {isUpcoming && (
            <Badge variant="secondary">Скоро</Badge>
          )}
        </div>
        <CardDescription className="line-clamp-1">{data.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.links?.patch?.small && (
          <div className="flex justify-center">
            <Image
              src={data.links.patch.small}
              alt={data.name}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {launchDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
        {data.links?.webcast && (
          <a
            href={data.links.webcast}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Смотреть трансляцию
          </a>
        )}
      </CardContent>
    </Card>
  );
}
