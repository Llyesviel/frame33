'use client';

import { useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SpaceHero } from '@/components/space/space-hero';
import { ISSSection } from '@/components/iss';
import { SpaceSection } from '@/components/space';
import { JWSTGallery } from '@/components/jwst/jwst-gallery';
import { OSDRList } from '@/components/osdr/osdr-list';
import { AstroEvents } from '@/components/astro/astro-events';
import { useISS } from '@/hooks/use-iss';

export default function DashboardPage() {
  const iss = useISS();

  useEffect(() => {
    iss.refetch();
    const interval = setInterval(() => {
      iss.refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [iss.refetch]);

  return (
    <div className="flex min-h-screen flex-col items-center">
      <DashboardHeader />

      <main className="flex w-full flex-1 flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl space-y-12">
          {/* Hero Section */}
          <section id="status" className="w-full scroll-mt-20">
            <SpaceHero />
          </section>

          {/* ISS Section */}
          <section id="iss" className="w-full scroll-mt-20">
            <ISSSection {...iss} title="Трекинг МКС" />
          </section>

           {/* OSDR Section */}
          <section id="osdr" className="w-full scroll-mt-20">
             <div className="flex flex-col gap-6">
                 <h2 className="text-2xl font-semibold tracking-tight">OSDR Datasets</h2>
                 <OSDRList />
             </div>
          </section>

          {/* NASA / SpaceX Section */}
          <section id="nasa-spacex" className="w-full scroll-mt-20">
             <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold tracking-tight">Космические данные</h2>
                <SpaceSection />
             </div>
          </section>

          {/* JWST Gallery */}
          <section id="jwst" className="w-full scroll-mt-20">
             <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold tracking-tight">Галерея JWST</h2>
                <JWSTGallery />
             </div>
          </section>

          {/* Astronomy Events */}
          <section id="astro" className="w-full scroll-mt-20">
             <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold tracking-tight">Астрономические события</h2>
                <AstroEvents />
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}
