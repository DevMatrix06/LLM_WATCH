import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ApiLog } from '@/lib/api';
import { ModelBadge, LatencyBadge } from '@/components/ui/badge';
import { formatRelativeTime, formatCost } from '@/lib/utils';

export function RecentTable({ logs }: { logs: ApiLog[] }) {
  if (!logs.length) {
    return (
      <div className="flex h-24 items-center justify-center">
        <p className="text-sm text-zinc-600">No requests yet — start by instrumenting your app.</p>
      </div>
    );
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            {['Time', 'Model', 'Prompt', 'Latency', 'Cost'].map((h) => (
              <th
                key={h}
                className="pb-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {logs.map((log) => (
            <tr key={log.id} className="transition-colors hover:bg-zinc-800/20">
              <td className="py-3 pr-4 text-xs text-zinc-500">
                {formatRelativeTime(log.timestamp)}
              </td>
              <td className="py-3 pr-4">
                <ModelBadge model={log.model} />
              </td>
              <td className="py-3 pr-4 max-w-[320px]">
                <p className="truncate text-xs text-zinc-400">{log.prompt}</p>
              </td>
              <td className="py-3 pr-4">
                <LatencyBadge ms={log.latency_ms} />
              </td>
              <td className="py-3 font-mono text-xs text-zinc-500">
                {formatCost(log.cost_usd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 border-t border-zinc-800/50 pt-3">
        <Link
          href="/logs"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View all logs <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
