import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'indigo';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        {
          default: 'bg-zinc-800 text-zinc-300 ring-zinc-700',
          success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
          warning: 'bg-amber-500/10  text-amber-400  ring-amber-500/20',
          danger:  'bg-red-500/10    text-red-400    ring-red-500/20',
          indigo:  'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
        }[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Model-specific badge — picks color by model family
const MODEL_STYLES: Record<string, string> = {
  claude: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
  gpt:    'bg-blue-500/10   text-blue-400   ring-blue-500/20',
  o1:     'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  o3:     'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
};

function modelStyle(model: string): string {
  for (const [prefix, style] of Object.entries(MODEL_STYLES)) {
    if (model.startsWith(prefix)) return style;
  }
  return 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20';
}

export function ModelBadge({ model, className }: { model: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
        modelStyle(model),
        className,
      )}
    >
      {model}
    </span>
  );
}

export function ErrorBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-red-500/10 text-red-400 ring-red-500/20 whitespace-nowrap">
      <span className="h-1 w-1 rounded-full bg-red-400" />
      {type}
    </span>
  );
}

export function LatencyBadge({ ms }: { ms: number }) {
  const color =
    ms < 500  ? 'text-emerald-400' :
    ms < 2000 ? 'text-amber-400'   :
                'text-red-400';
  return (
    <span className={cn('font-mono text-xs font-medium tabular-nums', color)}>
      {ms.toLocaleString()}ms
    </span>
  );
}
