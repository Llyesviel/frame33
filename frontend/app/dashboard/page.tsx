'use client';

import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ISSSection } from '@/components/iss';
import { SpaceSection } from '@/components/space';
import { JWSTGallery } from '@/components/jwst/jwst-gallery';
import { OSDRList } from '@/components/osdr/osdr-list';
import { AstroEvents } from '@/components/astro/astro-events';
import { useISS, type UseISSResult } from '@/hooks/use-iss';

export default function DashboardPage() {
  const iss = useISS();
  const [activeTab, setActiveTab] = useState('dashboard');

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl space-y-6">
          <TabsList className="flex w-full justify-center">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="iss">МКС</TabsTrigger>
            <TabsTrigger value="osdr">OSDR</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 w-full">
            {activeTab === 'dashboard' ? <DashboardTabContent iss={iss} /> : null}
          </TabsContent>

          <TabsContent value="iss" className="space-y-6 w-full">
            {activeTab === 'iss' ? <ISSSection {...iss} title="Трекинг МКС" /> : null}
          </TabsContent>

          <TabsContent value="osdr" className="space-y-6 w-full">
            {activeTab === 'osdr' ? <OSDRList /> : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DashboardTabContent({ iss }: { iss: UseISSResult }) {
  return (
    <div className="space-y-6 w-full">
      {/* ISS Quick View */}
      <section className="w-full">
        <ISSSection {...iss} title="Положение МКС" />
      </section>

      {/* Space Data Cards */}
      <section className="w-full">
        <SpaceSection />
      </section>

      {/* JWST Gallery */}
      <section className="w-full">
        <JWSTGallery />
      </section>

      {/* Astronomy Events */}
      <section className="w-full">
        <AstroEvents />
      </section>
    </div>
  );
}
