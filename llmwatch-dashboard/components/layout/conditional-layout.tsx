'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';

// These routes render their own full-page layout — no sidebar.
const NO_SIDEBAR = new Set(['/', '/admin', '/data']);

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_SIDEBAR.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
