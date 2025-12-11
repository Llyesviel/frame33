'use client';

import { useState, useCallback } from 'react';
import { getCMSPage, isApiError } from '@/lib/api';
import type { CMSPage } from '@/lib/types';

interface UseCMSResult {
  page: CMSPage | null;
  loading: boolean;
  error: string | null;
  refetch: (slug: string) => Promise<void>;
}

export function useCMS(): UseCMSResult {
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCMSPage(slug);

      if (isApiError(result)) {
        setError(result.error.message);
        setPage(null);
      } else {
        setPage(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CMS page');
    } finally {
      setLoading(false);
    }
  }, []);

  return { page, loading, error, refetch };
}
