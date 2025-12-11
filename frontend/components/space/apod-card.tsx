'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAPOD } from '@/hooks/use-space-cache';
import { ImageIcon } from 'lucide-react';

export function APODCard() {
  const { data, loading, error, refetch } = useAPOD();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full mt-2" />
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            APOD
          </CardTitle>
          <CardDescription>
            {error || 'Нет данных'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {data.media_type === 'image' ? (
        <div className="relative h-48 w-full">
          <Image
            src={data.url}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-muted flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-sm line-clamp-1">{data.title}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {data.explanation}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
