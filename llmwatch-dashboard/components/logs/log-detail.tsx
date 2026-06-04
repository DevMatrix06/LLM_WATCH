'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { ApiLog } from '@/lib/api';
import { ModelBadge, LatencyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCost } from '@/lib/utils';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </span>
      <span className="text-sm text-zinc-300">{value}</span>
    </div>
  );
}

interface LogDetailProps {
  log: ApiLog | null;
  onClose: () => void;
}

export function LogDetail({ log, onClose }: LogDetailProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          log ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-[520px] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-200 ease-out ${
          log ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {!log ? null : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-zinc-500">{log.id}</span>
                <ModelBadge model={log.model} />
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Metadata */}
              <div className="border-b border-zinc-800/60 px-5 py-4 space-y-2.5">
                <MetaRow
                  label="Time"
                  value={new Date(log.timestamp).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                />
                {log.project_id && (
                  <MetaRow
                    label="Project"
                    value={
                      <span className="font-mono text-xs text-indigo-400">{log.project_id}</span>
                    }
                  />
                )}
                {log.user_id && (
                  <MetaRow
                    label="User"
                    value={<span className="font-mono text-xs text-zinc-400">{log.user_id}</span>}
                  />
                )}
                {log.session_id && (
                  <MetaRow
                    label="Session"
                    value={<span className="font-mono text-xs text-zinc-400">{log.session_id}</span>}
                  />
                )}
                {log.tags.length > 0 && (
                  <MetaRow
                    label="Tags"
                    value={
                      <div className="flex flex-wrap gap-1">
                        {log.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 divide-x divide-zinc-800/60 border-b border-zinc-800/60">
                {[
                  { label: 'Latency',    value: <LatencyBadge ms={log.latency_ms} /> },
                  {
                    label: 'Tokens',
                    value: (
                      <span className="font-mono text-sm text-zinc-300">
                        {log.tokens_used.toLocaleString()}
                        {log.input_tokens != null && (
                          <span className="ml-1 text-[11px] text-zinc-600">
                            ({log.input_tokens}↑ {log.output_tokens}↓)
                          </span>
                        )}
                      </span>
                    ),
                  },
                  {
                    label: 'Cost',
                    value: (
                      <span className="font-mono text-sm text-zinc-300">
                        {formatCost(log.cost_usd)}
                      </span>
                    ),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="px-5 py-3.5">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                      {label}
                    </p>
                    {value}
                  </div>
                ))}
              </div>

              {/* Prompt */}
              <div className="px-5 py-4 border-b border-zinc-800/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Prompt
                  </span>
                  <CopyButton text={log.prompt} />
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-300">
                  {log.prompt}
                </pre>
              </div>

              {/* Completion */}
              <div className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Completion
                  </span>
                  <CopyButton text={log.completion} />
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-300">
                  {log.completion}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
