'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { ApiLog, LogsResponse } from '@/lib/api';
import { ModelBadge, LatencyBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogDetail } from './log-detail';
import { formatRelativeTime, formatCost } from '@/lib/utils';

const LIMIT = 50;
const KNOWN_MODELS = [
  'claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-8',
  'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
  'o1', 'o3-mini',
];

export function LogTable() {
  const [search,    setSearch]    = useState('');
  const [model,     setModel]     = useState('');
  const [page,      setPage]      = useState(0);
  const [selected,  setSelected]  = useState<ApiLog | null>(null);
  const [response,  setResponse]  = useState<LogsResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Debounced search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 0 when filters change
  useEffect(() => { setPage(0); }, [debouncedSearch, model]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit:  String(LIMIT),
        offset: String(page * LIMIT),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(model           && { model }),
      });
      const res = await fetch(`/api/logs?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResponse(await res.json() as LogsResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, model, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const logs  = response?.data ?? [];
  const total = response?.total ?? 0;
  const pages = Math.ceil(total / LIMIT);

  // Collect distinct models seen in current results to add to the dropdown
  const seenModels = useMemo(
    () => Array.from(new Set([...KNOWN_MODELS, ...logs.map(l => l.model)])),
    [logs],
  );

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-6 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <Input
            className="w-72 pl-8"
            placeholder="Search prompts, IDs, projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-600" />
          <select
            className="h-8 bg-transparent text-sm text-zinc-300 focus:outline-none"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" className="bg-zinc-900">All models</option>
            {seenModels.map((m) => (
              <option key={m} value={m} className="bg-zinc-900">{m}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />}
          <span className="text-xs text-zinc-600">
            {total.toLocaleString()} {total === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800">
            <tr>
              {[
                { label: 'Time',    w: 'w-[90px]'  },
                { label: 'Model',   w: 'w-[180px]' },
                { label: 'Prompt',  w: ''          },
                { label: 'Latency', w: 'w-[90px]'  },
                { label: 'Tokens',  w: 'w-[80px]'  },
                { label: 'Cost',    w: 'w-[90px]'  },
                { label: 'Project', w: 'w-[110px]' },
              ].map(({ label, w }) => (
                <th
                  key={label}
                  className={`px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-600 first:pl-6 last:pr-6 ${w}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {error ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-red-400">
                  Could not load logs: {error}
                </td>
              </tr>
            ) : loading && !logs.length ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5 first:pl-6 last:pr-6">
                      <div className="h-3 rounded bg-zinc-800" style={{ width: j === 2 ? '80%' : '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : !logs.length ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-zinc-600">
                  {debouncedSearch || model
                    ? 'No results match your filters.'
                    : 'No logs yet. Instrument your app with the llmwatch SDK.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="group cursor-pointer transition-colors hover:bg-zinc-900/80"
                >
                  <td className="py-3 pl-6 pr-4 text-xs text-zinc-500">
                    {formatRelativeTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <ModelBadge model={log.model} />
                  </td>
                  <td className="py-3 px-4 max-w-0">
                    <p className="truncate text-xs text-zinc-400 transition-colors group-hover:text-zinc-300">
                      {log.prompt}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <LatencyBadge ms={log.latency_ms} />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs tabular-nums text-zinc-500">
                    {log.tokens_used.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs tabular-nums text-zinc-500">
                    {formatCost(log.cost_usd)}
                  </td>
                  <td className="py-3 pl-4 pr-6">
                    {log.project_id
                      ? <span className="font-mono text-[11px] text-zinc-600">{log.project_id}</span>
                      : <span className="text-[11px] text-zinc-700">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
          <span className="text-xs text-zinc-600">
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button variant="ghost" size="sm" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <LogDetail log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
