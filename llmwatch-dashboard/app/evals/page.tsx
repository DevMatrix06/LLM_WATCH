import { FlaskConical, Sparkles, GitCompare, Scale, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PREVIEW_FEATURES = [
  {
    icon: Scale,
    title: 'LLM Judge',
    description:
      'Use a separate model to score your outputs on custom criteria — factuality, tone, completeness, or anything you define.',
    tags: ['Automated', 'Custom rubrics'],
  },
  {
    icon: GitCompare,
    title: 'A/B Evaluation',
    description:
      'Run two prompt variants side-by-side across real traffic. See which wins on your metrics, with statistical significance.',
    tags: ['Head-to-head', 'Live traffic'],
  },
  {
    icon: Zap,
    title: 'Regression Suite',
    description:
      'Curate a golden dataset from your logs, then run it automatically on every deploy to catch quality regressions early.',
    tags: ['CI integration', 'Alerts'],
  },
];

export default function EvalsPage() {
  return (
    <div className="min-h-full">
      <div className="border-b border-zinc-800/60 px-8 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-zinc-100">Evaluations</h1>
          <Badge variant="warning">Coming soon</Badge>
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">
          Measure and improve the quality of your LLM outputs
        </p>
      </div>

      <div className="p-8">
        {/* Hero */}
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <FlaskConical className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">
            Evals are in development
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            We&apos;re building a first-class evaluation platform directly into LogLens.
            No stitching together notebooks and spreadsheets — everything in one place,
            tied to your real production logs.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              Expected Q3 2026
            </span>
          </div>
        </div>

        {/* Preview cards */}
        <div className="mx-auto mt-12 max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
            What&apos;s coming
          </p>
          <div className="grid grid-cols-3 gap-4">
            {PREVIEW_FEATURES.map(({ icon: Icon, title, description, tags }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-5 opacity-60 select-none"
              >
                {/* Subtle "locked" overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/30" />

                <div className="relative">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">{description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-600 ring-1 ring-zinc-700/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist */}
        <div className="mx-auto mt-10 max-w-sm">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
            <p className="text-sm font-medium text-zinc-300">Get early access</p>
            <p className="mt-1 text-xs text-zinc-600">
              We&apos;re onboarding teams in waves. Drop your email and we&apos;ll notify you.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                disabled
                placeholder="you@company.com"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 placeholder:text-zinc-700 focus:outline-none"
              />
              <button
                disabled
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white opacity-50 cursor-not-allowed"
              >
                Notify me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
