'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Check } from 'lucide-react';

export function WaitlistForm({ initialCount }: { initialCount: number }) {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [count,   setCount]   = useState(initialCount);
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string; count?: number };

      if (res.status === 409) {
        setMessage("You're already on the list — we'll be in touch soon.");
        setStatus('success');
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      if (data.count) setCount(data.count);
      setStatus('success');
      setMessage("You're on the list! We'll reach out when your spot opens.");
    } catch {
      setMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <p className="text-xs text-zinc-600">{count.toLocaleString()} developers signed up</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {status === 'loading'
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <><span>Join</span><ArrowRight className="h-3.5 w-3.5" /></>}
      </button>
    </form>
  );
}
