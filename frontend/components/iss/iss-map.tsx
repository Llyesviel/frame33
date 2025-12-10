'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ISSPosition, ISSTrendResponse } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface ISSMapProps {
  position: ISSPosition | null;
  trend: ISSTrendResponse | null;
  loading: boolean;
}

// Custom ISS Icon SVG
const ISS_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="10" y="8" width="4" height="8" rx="1" />
  <path d="M2 12h20" />
  <path d="M4 9v6" />
  <path d="M7 9v6" />
  <path d="M17 9v6" />
  <path d="M20 9v6" />
</svg>
`;

// Dynamic import for Leaflet components to avoid SSR issues
function ISSMapClient({ position, trend }: { position: ISSPosition; trend: ISSTrendResponse | null }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import('react-leaflet').MapContainer;
    TileLayer: typeof import('react-leaflet').TileLayer;
    Marker: typeof import('react-leaflet').Marker;
    Popup: typeof import('react-leaflet').Popup;
    Polyline: typeof import('react-leaflet').Polyline;
    useMap: typeof import('react-leaflet').useMap;
    L: typeof import('leaflet');
  } | null>(null);

  useEffect(() => {
    // Import react-leaflet components
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([reactLeaflet, leaflet]) => {
      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Polyline: reactLeaflet.Polyline,
        useMap: reactLeaflet.useMap,
        L: leaflet,
      });
    });
  }, []);

  // Create custom ISS icon
  const issIcon = useMemo(() => {
    if (!MapComponents) return null;
    const { L } = MapComponents;
    return L.divIcon({
      className: 'custom-iss-icon',
      html: `<div class="relative flex items-center justify-center w-12 h-12 bg-background/80 backdrop-blur-md rounded-full border-2 border-primary shadow-[0_0_20px_rgba(168,85,247,0.5)]">
               <div class="w-8 h-8 text-primary animate-pulse">
                 ${ISS_ICON_SVG}
               </div>
             </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }, [MapComponents]);

  // Calculate path segments to handle date line crossing
  const pathSegments = useMemo(() => {
    if (!trend?.positions) return [];

    // Sort by timestamp
    const sortedPositions = [...trend.positions].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const segments: [number, number][][] = [];
    let currentSegment: [number, number][] = [];

    sortedPositions.forEach((pos, index) => {
      const point: [number, number] = [pos.latitude, pos.longitude];

      if (index === 0) {
        currentSegment.push(point);
      } else {
        const prevPoint = currentSegment[currentSegment.length - 1];
        // Check for date line crossing (longitude jump > 180)
        if (Math.abs(point[1] - prevPoint[1]) > 180) {
          segments.push(currentSegment);
          currentSegment = [point];
        } else {
          currentSegment.push(point);
        }
      }
    });

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    // Add current position to the last segment
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const lastPoint = lastSegment[lastSegment.length - 1];
      if (Math.abs(position.longitude - lastPoint[1]) <= 180) {
          lastSegment.push([position.latitude, position.longitude]);
      } else {
          segments.push([[position.latitude, position.longitude]]);
      }
    } else {
        segments.push([[position.latitude, position.longitude]]);
    }

    return segments;
  }, [trend, position]);


  if (!MapComponents || !issIcon) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline } = MapComponents;

  return (
    <MapContainer
      center={[position.latitude, position.longitude]}
      zoom={3}
      style={{ height: '400px', width: '100%' }}
      className="rounded-xl overflow-hidden border border-white/10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {pathSegments.map((segment, i) => (
        <Polyline
          key={i}
          positions={segment}
          pathOptions={{
            color: '#a855f7',
            weight: 2,
            opacity: 0.6,
            dashArray: '4 8',
            lineCap: 'round'
          }}
        />
      ))}

      <Marker position={[position.latitude, position.longitude]} icon={issIcon}>
        <Popup className="glass-popup">
          <div className="text-sm p-1">
            <strong className="text-primary block mb-1">МКС (Zarya)</strong>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Широта:</span>
              <span className="text-foreground text-right">{position.latitude.toFixed(4)}°</span>
              <span>Долгота:</span>
              <span className="text-foreground text-right">{position.longitude.toFixed(4)}°</span>
              <span>Высота:</span>
              <span className="text-foreground text-right">{position.altitude_km.toFixed(1)} км</span>
              <span>Скорость:</span>
              <span className="text-foreground text-right">{Math.round(position.velocity_kmh).toLocaleString()} км/ч</span>
            </div>
          </div>
        </Popup>
      </Marker>
      <MapUpdater position={position} useMap={MapComponents.useMap} />
    </MapContainer>
  );
}

function MapUpdater({
  position,
  useMap
}: {
  position: ISSPosition;
  useMap: typeof import('react-leaflet').useMap;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.latitude, position.longitude], map.getZoom());
  }, [map, position.latitude, position.longitude]);

  return null;
}

export function ISSMap({ position, trend, loading }: ISSMapProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Карта полета</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!position) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Карта полета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground">Нет данных о положении</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Карта полета</CardTitle>
      </CardHeader>
      <CardContent>
        <ISSMapClient position={position} trend={trend} />
      </CardContent>
    </Card>
  );
}
