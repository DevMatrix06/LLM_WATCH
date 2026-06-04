import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-8 rounded-md border border-zinc-700 bg-zinc-800/60 px-3 text-sm text-zinc-200 placeholder:text-zinc-600',
        'focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40',
        'transition-colors',
        className,
      )}
      {...props}
    />
  );
}
