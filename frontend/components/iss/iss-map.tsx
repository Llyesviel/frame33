'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ISSPosition } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface ISSMapProps {
  position: ISSPosition | null;
  loading: boolean;
}

// Dynamic import for Leaflet components to avoid SSR issues
function ISSMapClient({ position }: { position: ISSPosition }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import('react-leaflet').MapContainer;
    TileLayer: typeof import('react-leaflet').TileLayer;
    Marker: typeof import('react-leaflet').Marker;
    Popup: typeof import('react-leaflet').Popup;
    useMap: typeof import('react-leaflet').useMap;
  } | null>(null);

  useEffect(() => {
    // Import react-leaflet components
    import('react-leaflet').then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Marker: mod.Marker,
        Popup: mod.Popup,
        useMap: mod.useMap,
      });
    });
  }, []);

  useEffect(() => {
    // Fix for default marker icons in Leaflet
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // @ts-expect-error - Leaflet icon fix
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      });
    }
  }, []);

  if (!MapComponents) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <MapContainer
      center={[position.latitude, position.longitude]}
      zoom={3}
      style={{ height: '400px', width: '100%' }}
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[position.latitude, position.longitude]}>
        <Popup>
          <div className="text-sm">
            <strong>Положение МКС</strong>
            <br />
            Широта: {position.latitude.toFixed(4)}
            <br />
            Долгота: {position.longitude.toFixed(4)}
            <br />
            Высота: {position.altitude_km.toFixed(1)} км
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

export function ISSMap({ position, loading }: ISSMapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Положение МКС</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!position) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Положение МКС</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Нет данных о положении</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Положение МКС</CardTitle>
      </CardHeader>
      <CardContent>
        <ISSMapClient position={position} />
      </CardContent>
    </Card>
  );
}
