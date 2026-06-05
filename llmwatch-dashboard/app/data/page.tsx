import { Eye } from 'lucide-react';

export const metadata = {
  title: 'Data & Privacy — LogLens',
  description: 'What LogLens collects, where it lives, and how long we keep it.',
};

const SECTIONS = [
  {
    id: 'collect',
    title: 'What we collect',
    rows: [
      { label: 'Prompt text',      desc: 'The full message(s) you send to the model. Can be masked with maskPrompts: true in the SDK.' },
      { label: 'Completion text',  desc: 'The full response returned by the model. Also masked when maskPrompts is enabled.' },
      { label: 'Latency',          desc: 'Time from request start to first byte of response, in milliseconds.' },
      { label: 'Token counts',     desc: 'Input and output tokens as reported by the provider.' },
      { label: 'Cost',             desc: 'Estimated USD cost calculated from token counts and published model pricing.' },
      { label: 'Model & provider', desc: 'The model identifier passed to the provider (e.g. claude-sonnet-4-6, gpt-4o).' },
      { label: 'Metadata',         desc: 'Optional fields you attach: projectId, userId, sessionId, tags. All optional, all under your control.' },
      { label: 'Error info',       desc: 'If a call fails, the error type and message are logged instead of prompt/completion.' },
    ],
  },
];

export default function DataPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 font-semibold text-zinc-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/40">
              <Eye className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            LogLens
          </a>
          <a
            href="/dashboard"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Dashboard →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-50">Data &amp; Privacy</h1>
          <p className="mt-3 text-zinc-500">
            Plain-English answers to where your data goes, who can see it, and how to delete it.
            Last updated June 2026.
          </p>
        </div>

        <div className="space-y-10">
          {/* What we collect */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">What we collect</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              {SECTIONS[0].rows.map(({ label, desc }, i) => (
                <div
                  key={label}
                  className={`flex gap-6 px-5 py-4 ${i !== 0 ? 'border-t border-zinc-800/60' : ''}`}
                >
                  <span className="w-36 shrink-0 text-sm font-medium text-zinc-300">{label}</span>
                  <span className="text-sm leading-relaxed text-zinc-500">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Where it's stored */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">Where it&apos;s stored</h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-5 space-y-3">
              <p className="text-sm leading-relaxed text-zinc-400">
                All log data is stored in a <span className="text-zinc-200 font-medium">PostgreSQL database hosted on Railway</span>, in the{' '}
                <span className="text-zinc-200 font-medium">US West (Oregon)</span> region.
              </p>
              <p className="text-sm leading-relaxed text-zinc-400">
                Data is transmitted over HTTPS from the SDK to our ingest endpoint. It is never written to disk on your machine — the SDK sends it directly in-memory, fire-and-forget, on a background thread.
              </p>
              <p className="text-sm leading-relaxed text-zinc-400">
                We do not use third-party analytics pipelines, data lakes, or ML training infrastructure. Your prompts are not used to train any model.
              </p>
            </div>
          </section>

          {/* Who can access */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">Who can access it</h2>
            <div className="space-y-3">
              <div className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">You</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Your logs are scoped to your account via your API key. No other user can read, search, or export your data through the dashboard or API.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">LogLens team</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    We have infrastructure-level access to the database for maintenance, debugging, and incident response. We do not read your prompts unless you explicitly ask us to help debug an issue.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Retention */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">How long we retain it</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              {[
                { plan: 'Free',    retention: '7 days',  color: 'text-zinc-400' },
                { plan: 'Pro',     retention: '30 days', color: 'text-indigo-400' },
                { plan: 'Team',    retention: '90 days', color: 'text-violet-400' },
              ].map(({ plan, retention, color }, i) => (
                <div
                  key={plan}
                  className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? 'border-t border-zinc-800/60' : ''}`}
                >
                  <span className={`text-sm font-medium ${color}`}>{plan}</span>
                  <span className="text-sm text-zinc-400">{retention}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              Retention is configurable in Settings → Data Retention. Logs older than your window are purged automatically every 24 hours. Set to Forever to keep logs indefinitely (Pro and Team plans).
            </p>
          </section>

          {/* How to delete */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">How to delete your data</h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-5 space-y-3">
              <p className="text-sm leading-relaxed text-zinc-400">
                You can request full data deletion at any time using either of these methods:
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <span>
                    <span className="font-medium text-zinc-300">Delete your account</span> in{' '}
                    <a href="/settings" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
                      Settings → Danger zone
                    </a>
                    . This immediately deletes all your logs, your API key, and your account record.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <span>
                    <span className="font-medium text-zinc-300">Email us</span> at{' '}
                    <a href="mailto:deepakprasad181@gmail.com" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
                      deepakprasad181@gmail.com
                    </a>{' '}
                    and we&apos;ll manually purge all data associated with your account within 48 hours.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Questions */}
          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-5 py-5">
            <p className="text-sm text-zinc-500">
              Questions about your data?{' '}
              <a
                href="mailto:deepakprasad181@gmail.com"
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                deepakprasad181@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-6 py-8 mt-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600">
              <Eye className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span>LogLens · © 2026</span>
          </div>
          <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Back to home
          </a>
        </div>
      </footer>
    </div>
  );
}
