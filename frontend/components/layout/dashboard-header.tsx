'use client';

import { Rocket, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('status')}>
          <div className="flex items-center justify-center rounded-lg bg-primary/20 p-2">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground/90">
            Space Dashboard
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollToSection('status')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
            Статус
          </button>
          <button onClick={() => scrollToSection('iss')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
            ISS
          </button>
          <button onClick={() => scrollToSection('osdr')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
            OSDR
          </button>
          <button onClick={() => scrollToSection('nasa-spacex')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
            NASA / SpaceX
          </button>
           <button onClick={() => scrollToSection('jwst')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
            JWST
          </button>
        </nav>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary" onClick={() => window.location.reload()}>
             <RefreshCw className="h-4 w-4" />
             <span className="hidden sm:inline">Обновить</span>
           </Button>
        </div>
      </div>
    </header>
  );
}
