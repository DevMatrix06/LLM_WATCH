import { auth } from '@clerk/nextjs/server';

const backend    = () => process.env.BACKEND_URL      ?? 'http://localhost:3001';
const authHeader = () => ({ Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}` });

// GET — returns current user's API key (creates record on first call).
export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${backend()}/api/user/init`, {
    method: 'POST',
    headers: { ...authHeader(), 'X-Clerk-User-Id': userId },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
