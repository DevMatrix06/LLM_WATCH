import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const days = request.nextUrl.searchParams.get('days') ?? '30';
  const backendUrl = `${process.env.BACKEND_URL ?? 'http://localhost:3001'}/api/stats/overview?days=${days}`;

  const res = await fetch(backendUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}`,
      'X-Clerk-User-Id': userId,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
