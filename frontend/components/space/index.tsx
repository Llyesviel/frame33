'use client';

import { APODCard } from './apod-card';
import { NEOCard } from './neo-card';
import { DONKICard } from './donki-card';
import { SpaceXCard } from './spacex-card';

export function SpaceSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Данные космоса</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <APODCard />
        <NEOCard />
        <DONKICard />
        <SpaceXCard />
      </div>
    </div>
  );
}

export { APODCard } from './apod-card';
export { NEOCard } from './neo-card';
export { DONKICard } from './donki-card';
export { SpaceXCard } from './spacex-card';
