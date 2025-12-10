// ISS Types
export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  visibility?: string;
  timestamp: string;
  country_code?: string;
  timezone_id?: string;
}

export interface ISSTrendResponse {
  positions: ISSPosition[];
  count: number;
  hours: number;
}

// Space Cache Types
export type SpaceCacheSource = 'apod' | 'neo' | 'donki_flr' | 'donki_cme' | 'spacex';

export interface SpaceCacheData {
  source: string;
  fetched_at: string;
  ttl_hours?: number;
  data?: APODData | NEOData | DONKIData | SpaceXData;
  payload: APODData | NEOData | DONKIData | SpaceXData;
  is_stale?: boolean;
}

export interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export interface NEOData {
  element_count: number;
  near_earth_objects: Record<string, NEOObject[]>;
}

export interface NEOObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }[];
}

export interface DONKIData {
  flrID?: string;
  activityID?: string;
  beginTime: string;
  endTime?: string;
  peakTime?: string;
  classType?: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  note?: string;
  instruments?: { displayName: string }[];
  linkedEvents?: { activityID: string }[];
}

export interface SpaceXData {
  id: string;
  name: string;
  date_utc: string;
  date_local: string;
  date_precision: string;
  upcoming: boolean;
  details?: string;
  rocket?: string;
  launchpad?: string;
  links?: {
    patch?: {
      small?: string;
      large?: string;
    };
    webcast?: string;
    wikipedia?: string;
  };
}

// OSDR Types
export interface OSDRDataset {
  dataset_id: string;
  title: string;
  name?: string;
  status: string;
  mission?: string;
  platform?: string;
  updated_at: string;
  raw?: Record<string, unknown>;
}

export interface OSDRListResponse {
  items: OSDRDataset[];
  count: number;
  total: number;
  limit: number;
  offset: number;
}

// JWST Types
export interface JWSTImage {
  id: string;
  observation_id?: string;
  program?: number;
  details?: {
    mission?: string;
    instruments?: { instrument: string }[] | string[];
    suffix?: string;
    description?: string;
  };
  file_type?: string;
  thumbnail?: string;
  location?: string;
}

export interface JWSTFeedParams {
  page?: number;
  perPage?: number;
  fileType?: string[];
}

export interface JWSTFeedResponse {
  body: JWSTImage[];
  statusCode?: number;
}

// Astronomy Types
export interface AstroEventsParams {
  latitude: number;
  longitude: number;
  elevation?: number;
  from_date?: string;
  to_date?: string;
  body?: string;
}

export interface AstroEvent {
  type: string;
  body: string;
  event: string;
  date: string;
  time?: string;
}

export interface AstroData {
  bodies: Array<{
    name: string;
    azimuth: string;
    altitude: string;
    ra: string;
    dec: string;
    rise: string;
    set: string;
    culmination: string;
    phase?: string;
  }>;
  phenomena: Array<{
    category: string;
    name: string;
    time?: string;
    date?: string;
    status?: string;
  }>;
  time: {
    sidereal_time: string;
    julian_date: number;
    timezone: string;
    local_time: string;
  };
  observer: {
    latitude: number;
    longitude: number;
    location: string;
  };
  configurations: Array<{
    type: string;
    body1?: string;
    body2?: string;
    body?: string;
    date: string;
  }>;
  events: AstroEvent[];
}

export interface AstroEventsResponse {
  coordinates: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  filters: {
    from_date?: string;
    to_date?: string;
    body?: string;
  };
  events: AstroEvent[];
}

// CMS Types
export interface CMSPage {
  slug: string;
  title: string;
  html_body: string;
  created_at: string;
  updated_at: string;
}

// Health Types
export interface HealthResponse {
  status: string;
  database: string;
  timestamp?: string;
}
