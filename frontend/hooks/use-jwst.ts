'use client';

import { useState, useCallback } from 'react';
import { getJWSTFeed, isApiError } from '@/lib/api';
import type { JWSTImage, JWSTFeedParams } from '@/lib/types';

interface UseJWSTResult {
  images: JWSTImage[];
  loading: boolean;
  error: string | null;
  refetch: (params?: JWSTFeedParams) => Promise<void>;
}

export function useJWST(): UseJWSTResult {
  const [images, setImages] = useState<JWSTImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: JWSTFeedParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getJWSTFeed(params);

      if (isApiError(result)) {
        setError(result.error.message);
        setImages([]);
      } else {
        setImages(result.data.body || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch JWST data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { images, loading, error, refetch };
}
