'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { ISSSection } from '@/components/iss';
import { useISS } from '@/hooks/use-iss';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ISSPage() {
  const iss = useISS();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    iss.refetch();
    const interval = setInterval(() => {
      iss.refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [iss.refetch]);

  const handleExport = () => {
    window.open(`${API_URL}/api/iss/export/csv?hours=24`, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <DashboardHeader />

      <main className="flex w-full flex-1 flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Трекинг МКС</h1>
            <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Скачать CSV (24ч)
            </Button>
          </div>

          <ISSSection {...iss} title="" />
        </div>
      </main>
    </div>
  );
}
