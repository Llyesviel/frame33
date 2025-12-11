'use client';

import { useState, useCallback } from 'react';
import { getAstroEvents, isApiError } from '@/lib/api';
import type { AstroEvent, AstroEventsParams } from '@/lib/types';

interface UseAstroResult {
  events: AstroEvent[];
  loading: boolean;
  error: string | null;
  refetch: (params: AstroEventsParams) => Promise<void>;
}

export function useAstro(): UseAstroResult {
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params: AstroEventsParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAstroEvents(params);

      if (isApiError(result)) {
        setError(result.error.message);
        setEvents([]);
      } else {
        setEvents(result.data.data?.rows || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch astronomy events');
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, error, refetch };
}
