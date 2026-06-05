import { Eye, Users, BarChart3, Mail } from 'lucide-react';
import { fetchAdminData } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ password?: string }> };

function PasswordForm({ failed }: { failed: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Eye className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-zinc-100">LogLens Admin</span>
        </div>

        {failed && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Incorrect password — try again.
          </div>
        )}

        <form method="GET">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">
            Admin password
          </label>
          <input
            type="password"
            name="password"
            autoFocus
            className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            className="mt-3 h-9 w-full rounded-md bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminPage({ searchParams }: Props) {
  const { password } = await searchParams;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authed = !!adminPassword && password === adminPassword;

  if (!authed) {
    return <PasswordForm failed={!!password && !authed} />;
  }

  const data = await fetchAdminData();

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Eye className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100">LogLens Admin</h1>
            <p className="text-xs text-zinc-500">Internal metrics — keep this URL private</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2 text-zinc-500 mb-3">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Page Visits</span>
            </div>
            <p className="text-3xl font-bold text-zinc-50">
              {(data?.totalVisits ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Total visits to the landing page</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2 text-zinc-500 mb-3">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Waitlist Signups</span>
            </div>
            <p className="text-3xl font-bold text-zinc-50">
              {(data?.totalSignups ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Total email addresses collected</p>
          </div>
        </div>

        {/* Emails table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5">
            <Mail className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-300">Waitlist Emails</h2>
            <span className="ml-auto text-xs text-zinc-600">
              {data?.signups.length ?? 0} entries
            </span>
          </div>

          {!data?.signups.length ? (
            <div className="py-12 text-center text-sm text-zinc-600">No signups yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Email
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {data.signups.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-zinc-300">{s.email}</td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">
                      {new Date(s.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
