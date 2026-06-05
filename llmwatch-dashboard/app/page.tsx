import {
  Eye, Terminal, ScrollText, DollarSign, BarChart3,
  Check, ArrowRight, Zap,
} from 'lucide-react';
import { fetchWaitlistCount } from '@/lib/api';
import { WaitlistForm }      from '@/components/landing/waitlist-form';
import { AnalyticsTracker }  from '@/components/landing/analytics-tracker';
import { CopyButton }        from '@/components/landing/copy-button';

export const dynamic = 'force-dynamic';

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ScrollText,
    title: 'Real-time Logs',
    description:
      'Every prompt and completion captured in milliseconds. Search, filter by model or project, and inspect the full content of any request with a single click.',
    iconColor: 'text-indigo-400',
    iconBg:    'bg-indigo-500/10',
  },
  {
    icon: DollarSign,
    title: 'Cost Tracking',
    description:
      'See exactly what each call costs across every provider. Break down spend by model, project, and user. No more billing surprises at end of month.',
    iconColor: 'text-emerald-400',
    iconBg:    'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Model Analytics',
    description:
      'Compare latency, token usage, and cost across every model you use. Switch providers confidently with data, not guesswork.',
    iconColor: 'text-violet-400',
    iconBg:    'bg-violet-500/10',
  },
] as const;

const FREE_FEATURES = [
  '1,000 requests / month',
  '1 project',
  '7-day log retention',
  'All model support',
  'Community support',
];

const PRO_FEATURES = [
  'Unlimited requests',
  '3 projects',
  '30-day log retention',
  'All model support',
  'Email support',
];

const TEAM_FEATURES = [
  'Unlimited requests',
  'Unlimited projects',
  '90-day log retention',
  'Team access',
  'Custom cost alerts',
  'Priority support',
  'Evals — coming Q3 2026',
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const waitlistCount = await fetchWaitlistCount();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <AnalyticsTracker />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 font-semibold text-zinc-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/40">
              <Eye className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            LogLens
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {['#features', '#pricing', '#waitlist'].map((href) => (
              <a
                key={href}
                href={href}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
              </a>
            ))}
          </nav>

          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            Open Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-20 pt-24 text-center">
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(63 63 70 / 0.6) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-6">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_1px_rgb(16,185,129,0.5)]" />
            v0.4 · Now with streaming support
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-zinc-50 md:text-[3.75rem] md:leading-tight">
            See exactly what your
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              AI is doing
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            LogLens intercepts every LLM call and shows you prompts, completions,
            latency, cost and tokens in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition-colors hover:bg-indigo-500"
            >
              <Zap className="h-3.5 w-3.5" /> View Dashboard
            </a>
            <a
              href="#demo"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-700 px-5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              See it in action <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* npm install snippet */}
          <div className="mx-auto mt-10 flex max-w-xs items-center gap-3 rounded-lg border border-zinc-700/60 bg-zinc-900 px-4 py-3">
            <Terminal className="h-4 w-4 shrink-0 text-zinc-600" />
            <code className="flex-1 text-left font-mono text-sm text-zinc-200">
              npm install loglens
            </code>
            <CopyButton text="npm install loglens" />
          </div>

          <p className="mt-3 text-xs text-zinc-600">
            TypeScript · 5 kB · Works with Anthropic &amp; OpenAI
          </p>
        </div>
      </section>

      {/* ── Demo preview ─────────────────────────────────────────────────── */}
      <section id="demo" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">Your dashboard, live</h2>
            <p className="mt-2 text-zinc-500">The exact interface you get on day one — seeded with real data.</p>
          </div>

          {/* Browser chrome mockup */}
          <div className="overflow-hidden rounded-xl border border-zinc-700/60 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1">
                <div className="mx-auto max-w-xs rounded bg-zinc-800 px-3 py-1 text-center text-xs text-zinc-500">
                  app.loglens.io/dashboard
                </div>
              </div>
            </div>
            <div className="h-[560px]">
              <iframe
                src="/dashboard"
                className="h-full w-full border-0"
                title="LogLens Dashboard"
              />
            </div>
          </div>

          <p className="mt-4 text-center">
            <a
              href="/dashboard"
              className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Open full dashboard →
            </a>
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">
              Everything you need to observe your AI
            </h2>
            <p className="mt-3 text-zinc-500">
              Drop in two lines of code. Get full visibility instantly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, iconColor, iconBg }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-100">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">Simple, transparent pricing</h2>
            <p className="mt-3 text-zinc-500">Start free. Upgrade when you need more.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-7">
              <h3 className="text-base font-semibold text-zinc-200">Free</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-50">$0</span>
                <span className="text-zinc-500">/ mo</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">No credit card required</p>

              <ul className="mt-6 space-y-3">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/dashboard"
                className="mt-8 block w-full rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
              >
                Get started free
              </a>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-7">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                  Popular
                </span>
              </div>

              <h3 className="text-base font-semibold text-zinc-200">Pro</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-50">$5</span>
                <span className="text-zinc-500">/ mo</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">per workspace</p>

              <ul className="mt-6 space-y-3">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="mt-8 block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Join the waitlist
              </a>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-7">
              <h3 className="text-base font-semibold text-zinc-200">Team</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-50">$10</span>
                <span className="text-zinc-500">/ mo</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">per workspace</p>

              <ul className="mt-6 space-y-3">
                {TEAM_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <Check className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="mt-8 block w-full rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
              >
                Join the waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────────────────────────────── */}
      <section id="waitlist" className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Early access
          </div>
          <h2 className="text-3xl font-bold text-zinc-100">Join the waitlist</h2>
          <p className="mt-3 text-zinc-500">
            We&apos;re rolling out Pro access in waves. Drop your email and we&apos;ll notify you when your spot opens.
          </p>
          <p className="mt-2 text-sm">
            <span className="font-semibold text-indigo-400">
              {waitlistCount > 0 ? waitlistCount.toLocaleString() : '—'}
            </span>
            <span className="text-zinc-600"> developers already signed up</span>
          </p>

          <div className="mt-6 flex justify-center">
            <WaitlistForm initialCount={waitlistCount} />
          </div>
          <p className="mt-3 text-xs text-zinc-700">No spam. Unsubscribe any time.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600">
              <Eye className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span>LogLens</span>
            <span>·</span>
            <span>© 2026</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <a href="/dashboard" className="hover:text-zinc-400 transition-colors">Dashboard</a>
            <a href="/logs"      className="hover:text-zinc-400 transition-colors">Logs</a>
            <a href="/settings"  className="hover:text-zinc-400 transition-colors">Settings</a>
            <a href="/data"      className="hover:text-zinc-400 transition-colors">Data &amp; Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
