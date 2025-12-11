'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOSDR } from '@/hooks/use-osdr';
import { Database, ExternalLink } from 'lucide-react';

export function OSDRList() {
  const { datasets, total, loading, error, refetch } = useOSDR();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            NASA OSDR наборы данных
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            NASA OSDR наборы данных
          </CardTitle>
          <Badge variant="secondary">{total} всего</Badge>
        </div>
        <CardDescription>Репозиторий открытых данных</CardDescription>
      </CardHeader>
      <CardContent>
        {datasets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Нет доступных наборов данных</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {datasets.map((dataset) => (
                <OSDRItem key={dataset.dataset_id} dataset={dataset} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function OSDRItem({ dataset }: { dataset: { dataset_id: string; title: string; status: string; updated_at: string } }) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="space-y-1 min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{dataset.title || dataset.dataset_id}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dataset.dataset_id}
          </Badge>
          {dataset.status && (
            <Badge variant="secondary" className="text-xs">
              {dataset.status}
            </Badge>
          )}
        </div>
      </div>
      <a
        href={`https://osdr.nasa.gov/bio/repo/data/studies/${dataset.dataset_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors ml-2"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export { OSDRList as default };
