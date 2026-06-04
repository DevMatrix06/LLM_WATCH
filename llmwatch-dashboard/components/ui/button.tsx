import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-40',
        {
          default: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
          ghost:   'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
          outline: 'border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100',
        }[variant],
        {
          sm: 'h-7 px-2.5 text-xs',
          md: 'h-8 px-3 text-sm',
        }[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
