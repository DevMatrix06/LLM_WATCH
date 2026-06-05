'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ScrollText,
  FlaskConical,
  Settings,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/logs',     label: 'Logs',     icon: ScrollText       },
  { href: '/evals',    label: 'Evals',    icon: FlaskConical     },
  { href: '/settings', label: 'Settings', icon: Settings         },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/60 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/40">
          <Eye className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">LLMWatch</span>
        <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-zinc-800">
          v0.4
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-100',
                active
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400',
                )}
              />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 text-zinc-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_1px_rgb(16,185,129,0.5)]" />
          <span className="text-[11px] text-zinc-600">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
