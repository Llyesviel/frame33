'use client';

import { DashboardHeader } from '@/components/layout/dashboard-header';
import { OSDRList } from '@/components/osdr/osdr-list';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function OSDRPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleExport = () => {
    window.open(`${API_URL}/api/osdr/export/csv`, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <DashboardHeader />

      <main className="flex w-full flex-1 flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl space-y-6">
           <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">OSDR Datasets</h1>
                <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Скачать все (CSV)
                </Button>
           </div>
           <OSDRList />
        </div>
      </main>
    </div>
  );
}
