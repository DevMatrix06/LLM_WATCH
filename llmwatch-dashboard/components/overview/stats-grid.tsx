import { Activity, DollarSign, Timer, Hash, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { OverviewStats } from '@/lib/api';
import { formatTokens } from '@/lib/utils';

function StatCard({
  label, value, change, icon: Icon, iconColor,
}: {
  label: string;
  value: string;
  change: number | null;
  icon: React.ElementType;
  iconColor: string;
}) {
  const TrendIcon =
    change === null  ? Minus :
    change >= 0      ? TrendingUp : TrendingDown;
  const trendColor =
    change === null  ? 'text-zinc-600' :
    change >= 0      ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <div className={`rounded-md p-1.5 ${iconColor}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
      <div className="mt-1.5 flex items-center gap-1">
        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
        <span className={`text-xs font-medium ${trendColor}`}>
          {change === null ? '—' : `${change >= 0 ? '+' : ''}${change}%`}
        </span>
        {change !== null && <span className="text-xs text-zinc-600">vs prev period</span>}
      </div>
    </div>
  );
}

function empty(): OverviewStats {
  return {
    total_requests: 0, total_cost: 0, avg_latency_ms: 0, total_tokens: 0,
    request_change_pct: 0, cost_change_pct: 0, latency_change_pct: 0, token_change_pct: 0,
    daily_stats: [], model_stats: [], recent_logs: [],
  };
}

export function StatsGrid({ stats }: { stats: OverviewStats | null }) {
  const s = stats ?? empty();
  const noData = !stats;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Requests"
        value={noData ? '—' : s.total_requests.toLocaleString()}
        change={noData ? null : s.request_change_pct}
        icon={Activity} iconColor="bg-indigo-500/10 text-indigo-400" />
      <StatCard label="Total Cost"
        value={noData ? '—' : `$${s.total_cost.toFixed(2)}`}
        change={noData ? null : s.cost_change_pct}
        icon={DollarSign} iconColor="bg-emerald-500/10 text-emerald-400" />
      <StatCard label="Avg Latency"
        value={noData ? '—' : `${s.avg_latency_ms.toLocaleString()}ms`}
        change={noData ? null : s.latency_change_pct}
        icon={Timer} iconColor="bg-amber-500/10 text-amber-400" />
      <StatCard label="Tokens Used"
        value={noData ? '—' : formatTokens(s.total_tokens)}
        change={noData ? null : s.token_change_pct}
        icon={Hash} iconColor="bg-violet-500/10 text-violet-400" />
    </div>
  );
}
