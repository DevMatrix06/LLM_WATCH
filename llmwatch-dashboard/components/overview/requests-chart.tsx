'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { DailyStat } from '@/lib/api';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100">
        {payload[0].value.toLocaleString()} requests
      </p>
    </div>
  );
}

export function RequestsChart({ data }: { data: DailyStat[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-zinc-600">No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false} axisLine={false}
          tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickFormatter={(v: string) => v.slice(5)}
          interval={Math.max(1, Math.floor(data.length / 7))}
        />
        <YAxis
          tickLine={false} axisLine={false}
          tick={{ fill: '#52525b', fontSize: 10 }}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
        <Area
          type="monotone" dataKey="requests"
          stroke="#6366f1" strokeWidth={1.5}
          fill="url(#reqGrad)" dot={false}
          activeDot={{ r: 3, fill: '#6366f1', stroke: '#a5b4fc', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
