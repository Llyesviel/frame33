const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  ok: true;
  data: T;
  trace_id: string;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  trace_id: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return !result.ok;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data as ApiResult<T>;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred',
      },
      trace_id: 'client-error',
    };
  }
}

// ISS API
export async function getISSLast() {
  return fetchApi<ISSPosition>('/api/iss/last');
}

export async function getISSTrend(hours = 24, limit = 100) {
  return fetchApi<ISSTrendResponse>(`/api/iss/trend?hours=${hours}&limit=${limit}`);
}

// Space Cache API
export async function getSpaceCache(source: SpaceCacheSource) {
  return fetchApi<SpaceCacheData>(`/api/space/${source}/latest`);
}

// OSDR API
export async function getOSDRList(limit = 50, offset = 0) {
  return fetchApi<OSDRListResponse>(`/api/osdr/list?limit=${limit}&offset=${offset}`);
}

export async function getOSDRDetails(datasetId: string) {
  return fetchApi<OSDRDataset>(`/api/osdr/${datasetId}`);
}

// JWST API
export async function getJWSTFeed(params?: JWSTFeedParams) {
  const searchParams = new URLSearchParams();
  // Note: New JWSTFeedParams uses fileType instead of suffix/instrument for now, 
  // or we need to update params interface if backend supports more.
  // Assuming simple pagination for now based on previous errors.
  
  if (params?.perPage) searchParams.set('per_page', params.perPage.toString());
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.fileType) params.fileType.forEach(ft => searchParams.append('file_type', ft));

  const query = searchParams.toString();
  return fetchApi<JWSTFeedResponse>(`/api/jwst/feed${query ? `?${query}` : ''}`);
}

// Astronomy API
export async function getAstroEvents(params: AstroEventsParams) {
  const searchParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
  });
  if (params.elevation) searchParams.set('elevation', params.elevation.toString());
  if (params.from_date) searchParams.set('from_date', params.from_date);
  if (params.to_date) searchParams.set('to_date', params.to_date);
  if (params.body) searchParams.set('body', params.body);

  return fetchApi<AstroEventsResponse>(`/api/astro/events?${searchParams.toString()}`);
}

// CMS API
export async function getCMSPage(slug: string) {
  return fetchApi<CMSPage>(`/api/cms/${slug}`);
}

// Health API
export async function getHealth() {
  return fetchApi<HealthResponse>('/api/health');
}

// Type imports from types.ts
import type {
  ISSPosition,
  ISSTrendResponse,
  SpaceCacheSource,
  SpaceCacheData,
  OSDRListResponse,
  OSDRDataset,
  JWSTFeedParams,
  JWSTFeedResponse,
  AstroEventsParams,
  AstroEventsResponse,
  CMSPage,
  HealthResponse,
} from './types';
