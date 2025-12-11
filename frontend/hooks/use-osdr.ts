'use client';

import { useState, useCallback } from 'react';
import { getOSDRList, isApiError } from '@/lib/api';
import type { OSDRDataset, OSDRListResponse } from '@/lib/types';

interface UseOSDRResult {
  datasets: OSDRDataset[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (limit?: number, offset?: number) => Promise<void>;
}

export function useOSDR(): UseOSDRResult {
  const [datasets, setDatasets] = useState<OSDRDataset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getOSDRList(limit, offset);

      if (isApiError(result)) {
        setError(result.error.message);
        setDatasets([]);
        setTotal(0);
      } else {
        setDatasets(result.data.items);
        setTotal(result.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OSDR data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { datasets, total, loading, error, refetch };
}
