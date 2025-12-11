'use client';

import { Rocket } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-center">
          <Rocket className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Космический дашборд</h1>
        </div>
      </div>
    </header>
  );
}
