'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    <div className="flex flex-col gap-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Тренд скорости</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              velocity: { label: 'Скорость', color: 'hsl(var(--chart-1))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="velocity"
                  name="км/ч"
                  stroke="var(--color-velocity)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Тренд высоты</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              altitude: { label: 'Высота', color: 'hsl(var(--chart-2))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  name="км"
                  stroke="var(--color-altitude)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
