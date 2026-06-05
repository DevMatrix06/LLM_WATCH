import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ page: '/' }));
  const res = await fetch(
    `${process.env.BACKEND_URL ?? 'http://localhost:3001'}/api/analytics/visit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}`,
      },
      body: JSON.stringify(body),
    },
  );
  return Response.json(await res.json(), { status: res.status });
}
