'use client';

import { useState, useCallback } from 'react';
import { getSpaceCache, isApiError } from '@/lib/api';
import type { SpaceCacheSource, SpaceCacheData, APODData, NEOData, SpaceXData } from '@/lib/types';

interface UseSpaceCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useSpaceCache<T>(source: SpaceCacheSource): UseSpaceCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSpaceCache(source);

      if (isApiError(result)) {
        setError(result.error.message);
        setData(null);
      } else {
        setData(result.data.payload as T);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [source]);

  return { data, loading, error, refetch };
}

export function useAPOD() {
  return useSpaceCache<APODData>('apod');
}

export function useNEO() {
  return useSpaceCache<NEOData>('neo');
}

export function useDONKIFLR() {
  return useSpaceCache<Array<Record<string, unknown>>>('donki_flr');
}

export function useDONKICME() {
  return useSpaceCache<Array<Record<string, unknown>>>('donki_cme');
}

export function useSpaceX() {
  return useSpaceCache<SpaceXData>('spacex');
}
