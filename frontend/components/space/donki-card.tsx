'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDONKIFLR, useDONKICME } from '@/hooks/use-space-cache';
import { Sun, Zap } from 'lucide-react';

export function DONKICard() {
  const { data: flrData, loading: flrLoading, error: flrError, refetch: refetchFLR } = useDONKIFLR();
  const { data: cmeData, loading: cmeLoading, error: cmeError, refetch: refetchCME } = useDONKICME();

  useEffect(() => {
    refetchFLR();
    refetchCME();
  }, [refetchFLR, refetchCME]);

  const loading = flrLoading || cmeLoading;

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

  const flrCount = Array.isArray(flrData) ? flrData.length : 0;
  const cmeCount = Array.isArray(cmeData) ? cmeData.length : 0;
  const hasData = flrCount > 0 || cmeCount > 0;
  const hasError = (flrError && cmeError) || (!hasData && !flrError && !cmeError);

  if (hasError && !hasData) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Солнечная активность
          </CardTitle>
          <CardDescription>
            {flrError || cmeError || 'Нет свежих событий'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sun className="h-4 w-4" />
            Солнечная активность
        </CardTitle>
          <CardDescription>Последние 30 дней</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Солнечные вспышки</span>
          </div>
          <span className="font-bold">{flrCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-orange-500" />
              <span className="text-sm">События CME</span>
          </div>
          <span className="font-bold">{cmeCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
