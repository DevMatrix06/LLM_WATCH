'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Check, Eye, EyeOff, Terminal, Bell, BellOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOCK_API_KEY = 'lw_live_sk_k2m8n7p4q9r1s6t3u8v5w2x7y4z1a9b6c3';

function CodeBlock({ code, language = 'ts' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative rounded-lg bg-zinc-950 ring-1 ring-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-[11px] font-medium text-zinc-600">{language}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
        {code}
      </pre>
    </div>
  );
}

const ANTHROPIC_SNIPPET = `import Anthropic from '@anthropic-ai/sdk';
import { wrapAnthropic } from 'loglens';

const client = wrapAnthropic(new Anthropic(), {
  apiKey: '${MOCK_API_KEY}',
  projectId: 'my-app',
});

// Use client exactly as before — every call is logged
const msg = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});`;

const OPENAI_SNIPPET = `import OpenAI from 'openai';
import { wrapOpenAI } from 'loglens';

const client = wrapOpenAI(new OpenAI(), {
  apiKey: '${MOCK_API_KEY}',
  projectId: 'my-app',
});

const completion = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});`;

export default function SettingsPage() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'anthropic' | 'openai'>('anthropic');

  // Cost alert state
  const [alertEmail, setAlertEmail]       = useState('');
  const [threshold, setThreshold]         = useState('');
  const [alertSaving, setAlertSaving]     = useState(false);
  const [alertSaved, setAlertSaved]       = useState(false);
  const [alertError, setAlertError]       = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then((d: { alert_email?: string | null; cost_alert_usd?: number | null } | null) => {
        if (!d) return;
        setAlertEmail(d.alert_email ?? '');
        setThreshold(d.cost_alert_usd != null ? String(d.cost_alert_usd) : '');
      })
      .catch(() => {});
  }, []);

  async function saveAlertSettings() {
    setAlertSaving(true);
    setAlertError('');
    try {
      const thresholdNum = threshold === '' ? null : parseFloat(threshold);
      if (thresholdNum !== null && (isNaN(thresholdNum) || thresholdNum <= 0)) {
        setAlertError('Threshold must be a positive number.');
        return;
      }
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_email:    alertEmail || null,
          cost_alert_usd: thresholdNum,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setAlertSaved(true);
      setTimeout(() => setAlertSaved(false), 2000);
    } catch {
      setAlertError('Could not save settings. Try again.');
    } finally {
      setAlertSaving(false);
    }
  }

  const displayKey = revealed
    ? MOCK_API_KEY
    : MOCK_API_KEY.slice(0, 10) + '•'.repeat(28);

  return (
    <div className="min-h-full">
      <div className="border-b border-zinc-800/60 px-8 py-5">
        <h1 className="text-base font-semibold text-zinc-100">Settings</h1>
        <p className="mt-0.5 text-sm text-zinc-500">API keys and SDK configuration</p>
      </div>

      <div className="space-y-6 p-8">
        {/* API Key section */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-start gap-3 border-b border-zinc-800 p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
              <Key className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-200">API Key</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Use this key to authenticate the LogLens SDK. Keep it secret — anyone with this key
                can write to your project.
              </p>
            </div>
            <Badge variant="success" className="ml-auto shrink-0">
              Active
            </Badge>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              <code className="flex-1 font-mono text-xs text-zinc-300 select-all">
                {displayKey}
              </code>
              <button
                onClick={() => setRevealed((v) => !v)}
                className="rounded p-1 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400 transition-colors"
              >
                {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(MOCK_API_KEY);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="rounded p-1 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400 transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-600">
              Created June 1, 2026 · Last used 2 minutes ago
            </p>
          </div>
        </div>

        {/* Cost Alerts */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-start gap-3 border-b border-zinc-800 p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Bell className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-200">Cost Alerts</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Get an email when a single LLM call exceeds your cost threshold.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Alert email
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Cost threshold per call (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
                <input
                  type="number"
                  min="0.0001"
                  step="0.001"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  placeholder="0.01"
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 pl-6 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-600">
                Leave blank to disable alerts.
              </p>
            </div>

            {alertError && (
              <p className="text-xs text-red-400">{alertError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={saveAlertSettings}
                disabled={alertSaving}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {alertSaved ? (
                  <><Check className="h-3.5 w-3.5" /> Saved</>
                ) : alertSaving ? (
                  'Saving…'
                ) : (
                  'Save alert settings'
                )}
              </button>
              {(alertEmail || threshold) && (
                <button
                  onClick={() => { setAlertEmail(''); setThreshold(''); }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-700 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                >
                  <BellOff className="h-3.5 w-3.5" /> Disable
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SDK Setup */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-sm font-medium text-zinc-200">SDK Integration</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Drop loglens into an existing project in under a minute.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* Install */}
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">1. Install</p>
              <CodeBlock code="npm install loglens" language="bash" />
            </div>

            {/* Tabs */}
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">2. Wrap your client</p>
              <div className="mb-2 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1 w-fit">
                {(['anthropic', 'openai'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      activeTab === tab
                        ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-400',
                    )}
                  >
                    {tab === 'anthropic' ? 'Anthropic' : 'OpenAI'}
                  </button>
                ))}
              </div>
              <CodeBlock
                code={activeTab === 'anthropic' ? ANTHROPIC_SNIPPET : OPENAI_SNIPPET}
                language="typescript"
              />
            </div>
          </div>
        </div>

        {/* Danger zone placeholder */}
        <div className="rounded-xl border border-red-900/30 bg-red-950/10">
          <div className="p-5">
            <h2 className="text-sm font-medium text-red-400">Danger zone</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Irreversible actions. Proceed with caution.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-red-900/20 bg-zinc-900 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-300">Regenerate API key</p>
                <p className="text-xs text-zinc-600">
                  Current key will stop working immediately.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-red-900/40 text-red-400 hover:border-red-800 hover:text-red-300">
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
