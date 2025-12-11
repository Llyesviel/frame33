'use client';

import { useState, useCallback } from 'react';
import { getISSLast, getISSTrend, isApiError } from '@/lib/api';
import type { ISSPosition, ISSTrendResponse } from '@/lib/types';

export interface UseISSResult {
  position: ISSPosition | null;
  trend: ISSTrendResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useISS(): UseISSResult {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [trend, setTrend] = useState<ISSTrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [positionResult, trendResult] = await Promise.all([
        getISSLast(),
        getISSTrend(24, 30),
      ]);

      if (isApiError(positionResult)) {
        setError(positionResult.error.message);
        setPosition(null);
      } else {
        setPosition(positionResult.data);
      }

      if (!isApiError(trendResult)) {
        setTrend(trendResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ISS data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { position, trend, loading, error, refetch };
}
