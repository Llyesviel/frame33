import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle } from "lucide-react";

export function SpaceHero() {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-900/20 via-background/50 to-background/50 backdrop-blur-md">
      {/* Abstract Background Glows */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl" />

      <CardContent className="relative z-10 p-8 sm:p-10">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Space Dashboard</span>
            <span className="text-primary">•</span>
            <span>PRD</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            Космическая витрина наблюдений
          </h2>

          <div className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            <p className="mb-2">Источники данных:</p>
            <ul className="grid grid-cols-2 gap-2 text-base">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />ISS (WhereTheISS)</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />NASA OSDR</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />NASA APOD & NeoWs</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />NASA DONKI (Solar)</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />SpaceX API</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />JWST API</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />AstronomyAPI</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
