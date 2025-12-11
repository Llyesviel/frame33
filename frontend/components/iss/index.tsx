'use client';

import type { UseISSResult } from '@/hooks/use-iss';
import { ISSMetrics } from './iss-metrics';
import { ISSMap } from './iss-map';
import { ISSCharts } from './iss-charts';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type ISSSectionProps = UseISSResult & {
  title?: string;
};

export function ISSSection({
  title = 'Положение МКС',
  position,
  trend,
  loading,
  error,
  refetch,
}: ISSSectionProps) {

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      <ISSMetrics position={position} loading={loading} error={error} />
      <ISSMap position={position} loading={loading} />
      <ISSCharts trend={trend} loading={loading} />
    </div>
  );
}

// Re-export individual components
export { ISSMetrics } from './iss-metrics';
export { ISSMap } from './iss-map';
export { ISSCharts } from './iss-charts';
