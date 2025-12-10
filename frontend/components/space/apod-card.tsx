'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAPOD } from '@/hooks/use-space-cache';
import { ImageIcon } from 'lucide-react';

export function APODCard() {
  const { data, loading, error, refetch } = useAPOD();

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
          <Skeleton className="h-48 w-full rounded-xl bg-purple-900/20" />
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
            <h3 className="text-2xl font-bold text-white tracking-tight">APOD</h3>
            <ImageIcon className="text-purple-400 h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">{error || 'Нет данных'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">APOD</h3>
          <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20">
            Daily
          </div>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 group">
          {data.media_type === 'image' ? (
            <Image
              src={data.url}
              alt={data.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
           <h4 className="text-lg font-semibold text-white leading-tight line-clamp-1">{data.title}</h4>
           <p className="text-sm text-muted-foreground line-clamp-3">
             {data.explanation}
           </p>
           
           <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
              <span>{data.date}</span>
              <span>{data.copyright ? `© ${data.copyright}` : 'NASA'}</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
