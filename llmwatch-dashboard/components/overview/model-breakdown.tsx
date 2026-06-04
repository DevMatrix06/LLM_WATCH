import type { ModelStat } from '@/lib/api';
import { formatTokens } from '@/lib/utils';

const MODEL_COLORS: Record<string, { bar: string; dot: string }> = {
  'claude-sonnet-4-6': { bar: 'bg-violet-500', dot: 'bg-violet-400' },
  'gpt-4o':            { bar: 'bg-blue-500',   dot: 'bg-blue-400'   },
  'claude-haiku-4-5':  { bar: 'bg-purple-500', dot: 'bg-purple-400' },
  'gpt-4o-mini':       { bar: 'bg-sky-500',    dot: 'bg-sky-400'    },
};

const FALLBACKS = [
  { bar: 'bg-indigo-500',  dot: 'bg-indigo-400'  },
  { bar: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { bar: 'bg-amber-500',   dot: 'bg-amber-400'   },
  { bar: 'bg-pink-500',    dot: 'bg-pink-400'    },
];

function getColors(model: string, index: number) {
  return MODEL_COLORS[model] ?? FALLBACKS[index % FALLBACKS.length];
}

export function ModelBreakdown({ stats }: { stats: ModelStat[] }) {
  if (!stats.length) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-zinc-600">No data yet</p>
      </div>
    );
  }

  const total = stats.reduce((s, m) => s + m.requests, 0);

  return (
    <div className="space-y-4">
      {stats.map((m, i) => {
        const pct = total > 0 ? (m.requests / total) * 100 : 0;
        const colors = getColors(m.model, i);
        return (
          <div key={m.model}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                <span className="text-sm font-medium text-zinc-300">{m.model}</span>
              </div>
              <span className="text-xs tabular-nums text-zinc-500">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-600">
              <span>{m.requests.toLocaleString()} req</span>
              <span>{formatTokens(m.tokens)} tok · ${m.cost.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
