'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAstro } from '@/hooks/use-astro';
import { Star, Search, MapPin } from 'lucide-react';

export function AstroEvents() {
  const { events, loading, error, refetch } = useAstro();
  const [latitude, setLatitude] = useState('55.7558');
  const [longitude, setLongitude] = useState('37.6176');
  const [elevation, setElevation] = useState('0');

  const handleSearch = () => {
    refetch({
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      elevation: parseInt(elevation) || 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5" />
          Астрономические события
        </CardTitle>
        <CardDescription>Укажите координаты, чтобы найти события</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Широта"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-28"
              step="0.0001"
            />
            <Input
              type="number"
              placeholder="Долгота"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-28"
              step="0.0001"
            />
            <Input
              type="number"
              placeholder="Высота"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              className="w-24"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Искать
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Событий не найдено. Попробуйте другие координаты.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{event.body}</p>
                    <p className="text-xs text-muted-foreground">{event.event}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{event.date}</p>
                    {event.time && (
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export { AstroEvents as default };
