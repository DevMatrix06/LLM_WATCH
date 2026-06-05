// Shared types that match the backend's JSON responses.
// Server components import fetchOverviewStats() directly.
// Client components call the /api/* Next.js proxy routes.

export interface ApiLog {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  completion: string;
  latency_ms: number;
  tokens_used: number;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number;
  project_id: string | null;
  user_id: string | null;
  session_id: string | null;
  tags: string[];
  created_at: string;
}

export interface DailyStat {
  date: string;
  requests: number;
  cost: number;
  tokens: number;
  avg_latency: number;
}

export interface ModelStat {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  avg_latency: number;
}

export interface OverviewStats {
  total_requests: number;
  total_cost: number;
  avg_latency_ms: number;
  total_tokens: number;
  request_change_pct: number;
  cost_change_pct: number;
  latency_change_pct: number;
  token_change_pct: number;
  daily_stats: DailyStat[];
  model_stats: ModelStat[];
  recent_logs: ApiLog[];
}

export interface LogsResponse {
  data: ApiLog[];
  total: number;
  limit: number;
  offset: number;
}

// ── Server-side fetchers (safe: reads env vars only on the server) ──────────

const backend = () => process.env.BACKEND_URL ?? 'http://localhost:3001';
const authHeader = () => ({ Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}` });

export interface AdminData {
  totalVisits: number;
  totalSignups: number;
  signups: Array<{ id: string; email: string; created_at: string }>;
}

export async function fetchWaitlistCount(): Promise<number> {
  try {
    const res = await fetch(`${backend()}/api/waitlist/count`, {
      headers: authHeader(),
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json() as { count: number };
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function fetchAdminData(): Promise<AdminData | null> {
  try {
    const res = await fetch(`${backend()}/api/admin/overview`, {
      headers: authHeader(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<AdminData>;
  } catch {
    return null;
  }
}

export async function fetchOverviewStats(days = 30): Promise<OverviewStats | null> {
  try {
    const res = await fetch(`${backend()}/api/stats/overview?days=${days}`, {
      headers: authHeader(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<OverviewStats>;
  } catch {
    return null;
  }
}
