'use client';

import { useState } from 'react';
import { Key, Copy, Check, Eye, EyeOff, Terminal } from 'lucide-react';
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
import { wrapAnthropic } from 'llmwatch';

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
import { wrapOpenAI } from 'llmwatch';

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
                Use this key to authenticate the llmwatch SDK. Keep it secret — anyone with this key
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

        {/* SDK Setup */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-sm font-medium text-zinc-200">SDK Integration</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Drop llmwatch into an existing project in under a minute.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* Install */}
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">1. Install</p>
              <CodeBlock code="npm install llmwatch" language="bash" />
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
