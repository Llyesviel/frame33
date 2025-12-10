'use client';

import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AstroEvents } from '@/components/astro/astro-events';

export default function AstroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <DashboardHeader />

      <main className="flex w-full flex-1 flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl space-y-6">
           <h1 className="text-3xl font-bold tracking-tight">Астрономические события</h1>
           <AstroEvents />
        </div>
      </main>
    </div>
  );
}
