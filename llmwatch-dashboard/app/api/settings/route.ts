import { NextRequest } from 'next/server';

const backend = () => process.env.BACKEND_URL ?? 'http://localhost:3001';
const authHeader = () => ({ Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ''}` });

export async function GET() {
  const res = await fetch(`${backend()}/api/settings`, {
    headers: authHeader(),
    cache: 'no-store',
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${backend()}/api/settings`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
