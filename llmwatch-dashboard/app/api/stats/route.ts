import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const days = request.nextUrl.searchParams.get('days') ?? '30';
  const backendUrl = `${process.env.BACKEND_URL ?? 'http://localhost:3001'}/api/stats/overview?days=${days}`;

  const res = await fetch(backendUrl, {
    headers: { Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
