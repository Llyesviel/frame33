'use client';

import { Rocket, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-primary font-semibold"
      : "hover:text-primary transition-colors text-muted-foreground";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="flex items-center justify-center rounded-lg bg-primary/20 p-2">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground/90">
            Space Dashboard
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className={getLinkClass('/')}>
            Главная
          </Link>
          <Link href="/iss" className={getLinkClass('/iss')}>
            ISS
          </Link>
          <Link href="/osdr" className={getLinkClass('/osdr')}>
            OSDR
          </Link>
          <Link href="/space" className={getLinkClass('/space')}>
            NASA / SpaceX
          </Link>
           <Link href="/jwst" className={getLinkClass('/jwst')}>
            JWST
          </Link>
           <Link href="/astro" className={getLinkClass('/astro')}>
            Astro
          </Link>
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
