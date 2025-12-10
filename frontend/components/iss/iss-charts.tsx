'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import type { ISSTrendResponse } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ISSChartsProps {
  trend: ISSTrendResponse | null;
  loading: boolean;
}

export function ISSCharts({ trend, loading }: ISSChartsProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px]" />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!trend || !trend.positions || trend.positions.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Card className="bg-muted/50 w-full">
          <CardContent className="pt-6 h-[260px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Нет данных тренда</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data - reverse to show oldest first
  const chartData = [...trend.positions].reverse().map((pos) => ({
    time: new Date(pos.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    velocity: Math.round(pos.velocity_kmh),
    altitude: Math.round(pos.altitude_km),
  }));

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="w-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Тренд скорости</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              velocity: { label: 'Скорость', color: 'var(--chart-1)' },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} accessibilityLayer margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-velocity)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-velocity)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)' }}
                    dy={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: 'var(--muted-foreground)' }}
                  width={60}
                />
                <ChartTooltip
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="velocity"
                  name="км/ч"
                  stroke="var(--color-velocity)"
                  strokeWidth={3}
                  fill="url(#fillVelocity)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-velocity)' }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Тренд высоты</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              altitude: { label: 'Высота', color: 'var(--chart-2)' },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} accessibilityLayer margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAltitude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-altitude)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-altitude)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)' }}
                    dy={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: 'var(--muted-foreground)' }}
                  width={40}
                />
                <ChartTooltip
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="altitude"
                  name="км"
                  stroke="var(--color-altitude)"
                  strokeWidth={3}
                  fill="url(#fillAltitude)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-altitude)' }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
