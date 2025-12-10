'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ISSPosition, ISSTrendResponse } from '@/lib/types';
import { useMemo } from 'react';
import { Heart } from 'lucide-react';

interface ISSMetricsProps {
  position: ISSPosition | null;
  trend: ISSTrendResponse | null;
  loading: boolean;
  error: string | null;
}

// Custom Progress Bar Component to match the "Skill Points" style
function SkillBar({ 
  label, 
  value, 
  max, 
  displayValue, 
  color = "bg-purple-500",
  min = 0 
}: { 
  label: string; 
  value: number; 
  max: number; 
  displayValue: string | React.ReactNode; 
  color?: string;
  min?: number;
}) {
  // Normalize value to 0-100 range
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">{label}</span>
      
      <div className="h-2 flex-1 bg-secondary/30 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="bg-secondary/50 px-3 py-1 rounded-full min-w-[80px] text-center">
        <span className="text-sm font-bold">{displayValue}</span>
      </div>
    </div>
  );
}

export function ISSMetrics({ position, trend, loading, error }: ISSMetricsProps) {
  const trendInfo = useMemo(() => {
    if (!trend?.positions || trend.positions.length < 2) return null;
    
    // Sort positions by timestamp desc
    const sorted = [...trend.positions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const latest = sorted[0];
    const previous = sorted[1];
    
    const latDiff = latest.latitude - previous.latitude;
    const lonDiff = latest.longitude - previous.longitude;
    const displacement = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; 
    
    const timeDiffSeconds = (new Date(latest.timestamp).getTime() - new Date(previous.timestamp).getTime()) / 1000;
    
    return {
      status: 'Движется',
      displacement: displacement,
      interval: timeDiffSeconds,
      avgSpeed: latest.velocity_kmh,
      from: previous,
      to: latest
    };
  }, [trend]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1a1625] border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-40 bg-purple-900/20" />
              <Skeleton className="h-8 w-24 rounded-full bg-purple-900/20" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 bg-purple-900/20" />
                <Skeleton className="h-2 flex-1 bg-purple-900/20" />
                <Skeleton className="h-6 w-16 rounded-full bg-purple-900/20" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-[#1a1625] border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-40 bg-purple-900/20" />
              <Skeleton className="h-8 w-8 rounded-full bg-purple-900/20" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 bg-purple-900/20" />
                <Skeleton className="h-2 flex-1 bg-purple-900/20" />
                <Skeleton className="h-6 w-16 rounded-full bg-purple-900/20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!position) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Нет данных по МКС</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Position Card */}
      <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Текущая позиция</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20">
                LIVE
              </span>
              <span className="px-3 py-1 bg-secondary/50 text-muted-foreground rounded-full text-xs font-medium">
                ISS
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <SkillBar 
              label="Широта" 
              value={Math.abs(position.latitude)} 
              max={90} 
              displayValue={`${position.latitude.toFixed(2)}°`}
            />
            <SkillBar 
              label="Долгота" 
              value={Math.abs(position.longitude)} 
              max={180} 
              displayValue={`${position.longitude.toFixed(2)}°`}
            />
            <SkillBar 
              label="Высота" 
              value={position.altitude_km} 
              min={400}
              max={430} 
              displayValue={`${position.altitude_km.toFixed(0)} км`}
            />
            <SkillBar 
              label="Скорость" 
              value={position.velocity_kmh} 
              min={27000}
              max={28000} 
              displayValue={`${(position.velocity_kmh / 1000).toFixed(1)}k`}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Местоположение</span>
              <span className="text-white font-medium">{position.country_code || 'Over Ocean'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Видимость</span>
              <span className="text-white font-medium">{position.visibility === 'daylight' ? 'Day' : 'Night'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Время</span>
              <span className="text-white font-medium font-mono">
                {new Date(position.timestamp).toLocaleTimeString('ru-RU')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Movement Card */}
      <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
        
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Тренд</h3>
          </div>

          {trendInfo ? (
            <div className="space-y-2">
               <SkillBar 
                label="Смещение" 
                value={trendInfo.displacement} 
                max={50} 
                displayValue={`${trendInfo.displacement.toFixed(1)} км`}
                color="bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"
              />
              <SkillBar 
                label="Интервал" 
                value={trendInfo.interval} 
                max={60} 
                displayValue={`${trendInfo.interval.toFixed(0)} с`}
                color="bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"
              />
              <SkillBar 
                label="Ср. Скор." 
                value={trendInfo.avgSpeed} 
                min={27000}
                max={28000} 
                displayValue={`${(trendInfo.avgSpeed / 1000).toFixed(1)}k`}
                color="bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"
              />
              
              <div className="mt-4 py-3 flex items-center justify-between gap-4">
                 <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">Статус</span>
                 <div className="h-2 flex-1 bg-secondary/30 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse rounded-full" />
                 </div>
                 <div className="bg-secondary/50 px-3 py-1 rounded-full min-w-[80px] text-center">
                    <span className="text-sm font-bold text-purple-400">OK</span>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Откуда</span>
                  <span className="text-white font-mono text-xs">
                    {trendInfo.from.latitude.toFixed(2)}°, {trendInfo.from.longitude.toFixed(2)}°
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Куда</span>
                  <span className="text-white font-mono text-xs">
                    {trendInfo.to.latitude.toFixed(2)}°, {trendInfo.to.longitude.toFixed(2)}°
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Загрузка тренда...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
