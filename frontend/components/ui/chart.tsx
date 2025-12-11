'use client';

import * as React from 'react';
import type { TooltipProps } from 'recharts';
import { Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts';

import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

export function ChartContainer({ config, className, children, style, ...props }: ChartContainerProps) {
  const cssVars = React.useMemo(() => {
    const entries: [string, string][] = [];
    let i = 1;
    for (const [key, value] of Object.entries(config)) {
      entries.push([`--color-${key}`, value.color ?? `hsl(var(--chart-${i}))`]);
      i = i === 5 ? 1 : i + 1;
    }
    return Object.fromEntries(entries);
  }, [config]);

  return (
    <div
      style={{ ...cssVars, ...style } as React.CSSProperties}
      className={cn('relative w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChartTooltip(props: React.ComponentProps<typeof RechartsTooltip>) {
  return <RechartsTooltip wrapperStyle={{ outline: 'none' }} {...props} />;
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
  hideLabel?: boolean;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: number | string;
    dataKey?: string | number;
  }>;
  label?: string | number;
  active?: boolean;
};

export function ChartTooltipContent({ active, payload, label, hideLabel }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
      {!hideLabel ? <div className="font-medium text-foreground">{label}</div> : null}
      <div className="mt-1 space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey ?? item.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color ?? 'hsl(var(--foreground))' }}
            />
            <span className="font-semibold text-foreground">{item.value}</span>
            {item.name ? <span className="text-xs text-muted-foreground">{item.name}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend(props: React.ComponentProps<typeof RechartsLegend>) {
  return <RechartsLegend {...props} />;
}

type ChartLegendContentProps = {
  payload?: Array<{
    color?: string;
    value?: string;
  }>;
};

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color ?? 'hsl(var(--foreground))' }}
          />
          <span className="font-medium text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
