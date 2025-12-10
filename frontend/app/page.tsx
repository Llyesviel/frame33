'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SpaceHero } from '@/components/space/space-hero';
import { useISS } from '@/hooks/use-iss';
import { useJWST } from '@/hooks/use-jwst';
import { useOSDR } from '@/hooks/use-osdr';
import { useSpaceX, useAPOD } from '@/hooks/use-space-cache';
import { useAstro } from '@/hooks/use-astro';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Database, Rocket, Calendar } from 'lucide-react';

export default function HomePage() {
  const { position: issData, refetch: refetchISS } = useISS();
  const { images: jwstImages, refetch: refetchJWST } = useJWST();
  const { datasets: osdrDatasets, refetch: refetchOSDR } = useOSDR();
  const { data: spacexData, refetch: refetchSpaceX } = useSpaceX();
  const { data: apodData, refetch: refetchAPOD } = useAPOD();
  const { data: astroData, refetch: refetchAstro } = useAstro();

  useEffect(() => {
    refetchISS();
    refetchJWST({ page: 1, perPage: 1 });
    refetchOSDR(5, 0);
    refetchSpaceX();
    refetchAPOD();
    refetchAstro({ latitude: 0, longitude: 0 }); // Default location for events count
  }, [refetchISS, refetchJWST, refetchOSDR, refetchSpaceX, refetchAPOD, refetchAstro]);

  return (
    <div className="flex min-h-screen flex-col items-center">
      <DashboardHeader />

      <main className="flex w-full flex-1 flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl space-y-12">
          {/* Hero Section */}
          <section className="w-full">
            <SpaceHero />
          </section>

          {/* ISS Summary */}
          <section className="w-full">
            <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-semibold tracking-tight">Текущий статус МКС</h2>
                 <Link href="/iss" className="text-sm text-primary hover:underline flex items-center gap-1">
                   Подробнее <ArrowRight className="h-4 w-4" />
                 </Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Высота</span>
                        <span className="text-2xl font-bold">
                            {issData ? `${issData.altitude_km.toFixed(2)} км` : '...'}
                        </span>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Скорость</span>
                        <span className="text-2xl font-bold">
                            {issData ? `${issData.velocity_kmh.toFixed(0)} км/ч` : '...'}
                        </span>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Координаты</span>
                        <div className="flex flex-col">
                            <span className="font-mono text-sm">Lat: {issData?.latitude.toFixed(4)}</span>
                            <span className="font-mono text-sm">Lon: {issData?.longitude.toFixed(4)}</span>
                        </div>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Видимость</span>
                        <Badge variant={issData?.visibility === 'daylight' ? 'default' : 'secondary'}>
                            {issData?.visibility || '...'}
                        </Badge>
                    </CardContent>
                  </Card>
               </div>
            </div>
          </section>

          {/* Widgets Grid */}
          <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* JWST Widget */}
            <Card className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-muted">
                 {jwstImages && jwstImages.length > 0 && jwstImages[0]?.location ? (
                    <Image 
                      src={jwstImages[0].location} 
                      alt="JWST Latest" 
                      fill 
                      className="object-cover"
                    />
                 ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">Загрузка...</div>
                 )}
              </div>
              <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
                 <div>
                    <h3 className="font-semibold text-lg mb-2">JWST Изображения</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        Последние снимки с телескопа Джеймса Уэбба.
                    </p>
                 </div>
                 <Link href="/jwst" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                        Галерея <ArrowRight className="h-4 w-4" />
                    </Button>
                 </Link>
              </CardContent>
            </Card>

            {/* OSDR Widget */}
            <Card className="flex flex-col">
               <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                            <Database className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-lg">NASA OSDR</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {osdrDatasets.slice(0, 3).map(ds => (
                            <div key={ds.dataset_id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                                <div className="font-medium truncate">{ds.title}</div>
                                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                    <span>{ds.mission || 'N/A'}</span>
                                    <span>{ds.platform || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                        {osdrDatasets.length === 0 && <div className="text-sm text-muted-foreground">Загрузка данных...</div>}
                    </div>
                 </div>
                 <Link href="/osdr" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                        Все датасеты <ArrowRight className="h-4 w-4" />
                    </Button>
                 </Link>
               </CardContent>
            </Card>

             {/* Space & Astro Widget */}
             <div className="flex flex-col gap-6">
                {/* SpaceX / Space Data */}
                <Card className="flex-1">
                   <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                     <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500">
                            <Rocket className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-lg">SpaceX Launch</h3>
                     </div>
                     <div className="text-sm">
                        {spacexData ? (
                            <>
                                <div className="font-medium text-base mb-1">{spacexData.name}</div>
                                <div className="text-muted-foreground">
                                    {new Date(spacexData.date_utc).toLocaleDateString()}
                                </div>
                            </>
                        ) : (
                            <div className="text-muted-foreground">Загрузка...</div>
                        )}
                     </div>
                      <Link href="/space" className="w-full mt-auto">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            Космос <ArrowRight className="h-4 w-4" />
                        </Button>
                     </Link>
                   </CardContent>
                </Card>

                 {/* Astro Events */}
                <Card className="flex-1">
                   <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                     <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-purple-500/10 text-purple-500">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Astro Events</h3>
                     </div>
                     <div className="text-sm">
                        {astroData ? (
                            <div className="flex justify-between items-center">
                                <span>Событий сегодня:</span>
                                <Badge>{astroData.phenomena?.length || 0}</Badge>
                            </div>
                        ) : (
                            <div className="text-muted-foreground">Загрузка...</div>
                        )}
                     </div>
                      <Link href="/astro" className="w-full mt-auto">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            События <ArrowRight className="h-4 w-4" />
                        </Button>
                     </Link>
                   </CardContent>
                </Card>
             </div>

          </section>
        </div>
      </main>
    </div>
  );
}
