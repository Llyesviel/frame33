'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpaceX } from '@/hooks/use-space-cache';
import { Rocket, Calendar, ExternalLink } from 'lucide-react';

export function SpaceXCard() {
  const { data, loading, error, refetch } = useSpaceX();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <Card className="bg-[#1a1625] border-none shadow-xl h-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40 bg-purple-900/20" />
            <Skeleton className="h-8 w-8 rounded-full bg-purple-900/20" />
          </div>
          <div className="space-y-4">
             <Skeleton className="h-16 w-16 mx-auto rounded-full bg-purple-900/20" />
             <Skeleton className="h-4 w-full bg-purple-900/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative h-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">SpaceX</h3>
            <Rocket className="text-purple-400 h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">{error || 'Нет данных'}</p>
        </CardContent>
      </Card>
    );
  }

  const launchDate = new Date(data.date_utc);
  const isUpcoming = data.upcoming;

  return (
    <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">SpaceX</h3>
          <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20">
            {isUpcoming ? 'Soon' : 'Latest'}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 mb-4">
           {data.links?.patch?.small ? (
              <div className="relative w-24 h-24 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Image
                  src={data.links.patch.small}
                  alt={data.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center">
                 <Rocket className="h-10 w-10 text-purple-400" />
              </div>
            )}
        </div>

        <div className="mt-auto space-y-4 text-center">
           <h4 className="text-lg font-semibold text-white leading-tight">{data.name}</h4>
           
           <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
             <Calendar className="h-4 w-4" />
             {launchDate.toLocaleDateString('ru-RU', {
               day: 'numeric',
               month: 'long',
               year: 'numeric',
             })}
           </div>

           {data.links?.webcast && (
             <div className="pt-4 border-t border-white/5">
                <a
                  href={data.links.webcast}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
                >
                  <ExternalLink className="h-3 w-3" />
                  Смотреть трансляцию
                </a>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
