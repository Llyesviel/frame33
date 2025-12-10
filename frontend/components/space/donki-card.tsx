'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDONKIFLR, useDONKICME } from '@/hooks/use-space-cache';
import { Sun, Zap } from 'lucide-react';

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

      <div className="bg-secondary/50 px-3 py-1 rounded-full min-w-[60px] text-center">
        <span className="text-sm font-bold">{displayValue}</span>
      </div>
    </div>
  );
}

export function DONKICard() {
  const { data: flrData, loading: flrLoading, error: flrError, refetch: refetchFLR } = useDONKIFLR();
  const { data: cmeData, loading: cmeLoading, error: cmeError, refetch: refetchCME } = useDONKICME();

  useEffect(() => {
    refetchFLR();
    refetchCME();
  }, [refetchFLR, refetchCME]);

  const loading = flrLoading || cmeLoading;

  if (loading) {
    return (
      <Card className="bg-[#1a1625] border-none shadow-xl h-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40 bg-purple-900/20" />
            <Skeleton className="h-8 w-8 rounded-full bg-purple-900/20" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-purple-900/20" />
            <Skeleton className="h-4 w-full bg-purple-900/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const flrCount = Array.isArray(flrData) ? flrData.length : 0;
  const cmeCount = Array.isArray(cmeData) ? cmeData.length : 0;
  const hasData = flrCount > 0 || cmeCount > 0;
  const hasError = (flrError && cmeError) || (!hasData && !flrError && !cmeError);

  if (hasError && !hasData) {
    return (
      <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative h-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Solar</h3>
            <Sun className="text-purple-400 h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">{flrError || cmeError || 'Нет свежих событий'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent backdrop-blur-md border-none shadow-2xl rounded-3xl overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-tight">Solar</h3>
          <div className="flex gap-2">
             <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20">
               Active
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <SkillBar 
            label="Вспышки" 
            value={flrCount} 
            max={50} 
            displayValue={flrCount}
            color="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
          />
          <SkillBar 
            label="CME" 
            value={cmeCount} 
            max={30} 
            displayValue={cmeCount}
            color="bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
          />
        </div>
        
        <div className="mt-auto pt-6 border-t border-white/5 text-xs text-muted-foreground">
          Данные за последние 30 дней
        </div>
      </CardContent>
    </Card>
  );
}
