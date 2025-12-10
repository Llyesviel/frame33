'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAstro } from '@/hooks/use-astro';
import { Star, Search, MapPin, Globe, Clock, Orbit, Eye } from 'lucide-react';

export function AstroEvents() {
  const { data, loading, error, refetch } = useAstro();
  // Default coordinates (Moscow) - could be dynamic or from context
  const latitude = 55.7558;
  const longitude = 37.6176;
  const elevation = 0;

  useEffect(() => {
    // Initial fetch on mount
    refetch({
      latitude,
      longitude,
      elevation,
    });

    // Auto-refresh every hour
    const interval = setInterval(() => {
      refetch({
        latitude,
        longitude,
        elevation,
      });
    }, 3600000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-purple-400" />
              Астрономические данные
            </CardTitle>
            <CardDescription className="text-purple-200/60">
              Положения небесных тел и события в реальном времени
            </CardDescription>
          </div>
          <div className="flex gap-2 text-xs font-mono bg-black/20 p-2 rounded-lg border border-white/5">
             <div className="flex items-center gap-1 text-purple-300">
               <Clock className="h-3 w-3" />
               {data?.time?.local_time || '--:--:--'}
             </div>
             <span className="text-white/20">|</span>
             <div className="text-muted-foreground">JD {data?.time?.julian_date.toFixed(2) || '---'}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-purple-900/20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 bg-red-900/10 rounded-xl border border-red-900/20">
            <p>{error}</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Нет данных</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Celestial Bodies */}
            <div>
              <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Позиции небесных тел
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.bodies.map((body, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{body.name}</span>
                      {body.phase && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                          {body.phase}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground font-mono">
                      <span>Alt: <span className="text-white">{body.altitude}</span></span>
                      <span>Az: <span className="text-white">{body.azimuth}</span></span>
                      <span>RA: {body.ra}</span>
                      <span>Dec: {body.dec}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">↑ {body.rise}</span>
                      <span className="flex items-center gap-1">↓ {body.set}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              
              {/* 2. Events & Phenomena */}
              <div>
                <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  События и явления
                </h3>
                <ScrollArea className="h-[200px] rounded-xl bg-white/5 border border-white/5 p-4">
                  <div className="space-y-3">
                    {data.phenomena.map((event, i) => (
                      <div key={i} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-white">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-purple-200">{event.time || event.date}</p>
                          {event.status && <p className="text-[10px] text-muted-foreground">{event.status}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* 5. Configurations */}
              <div>
                <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                  <Orbit className="h-4 w-4" />
                  Конфигурации планет
                </h3>
                <div className="space-y-2">
                  {data.configurations.map((config, i) => (
                    <div key={i} className="p-3 bg-gradient-to-r from-purple-900/20 to-transparent rounded-xl border border-purple-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{config.type}</span>
                        <p className="text-sm text-white mt-0.5">
                          {config.body || `${config.body1} & ${config.body2}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-mono bg-black/20 px-2 py-1 rounded">
                          {config.date}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Time Data Summary */}
                  <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Звездное время</span>
                      <span className="font-mono text-white">{data.time.sidereal_time}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Временная зона</span>
                      <span className="font-mono text-white">{data.time.timezone}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { AstroEvents as default };
