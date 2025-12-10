'use client';

import { useState, useCallback } from 'react';
import { getAstroEvents, isApiError } from '@/lib/api';
import type { AstroData, AstroEventsParams } from '@/lib/types';

interface UseAstroResult {
  data: AstroData | null;
  loading: boolean;
  error: string | null;
  refetch: (params: AstroEventsParams) => Promise<void>;
}

export function useAstro(): UseAstroResult {
  const [data, setData] = useState<AstroData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params: AstroEventsParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAstroEvents(params);

      if (isApiError(result)) {
        if (result.error.message.includes('403')) {
          setError('Ошибка доступа (403). Проверьте ASTRONOMY_API_ID и SECRET в .env файле.');
        } else {
          setError(result.error.message);
        }
        setData(null);
      } else {
        // Cast result.data to unknown then to AstroData to bypass strict type checking if needed
        // The mock backend returns the full structure now
        setData(result.data as unknown as AstroData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch astronomy events');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
}
