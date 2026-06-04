import { NextRequest } from 'next/server';

// Thin proxy: forwards query params to the backend, injects the API key server-side.
export async function GET(request: NextRequest) {
  const backendUrl = new URL(
    `${process.env.BACKEND_URL ?? 'http://localhost:3001'}/api/logs`,
  );

  // Forward every query param from the dashboard request
  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const res = await fetch(backendUrl.toString(), {
    headers: { Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
