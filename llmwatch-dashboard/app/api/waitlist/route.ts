import { NextRequest } from 'next/server';

const backend  = () => process.env.BACKEND_URL      ?? 'http://localhost:3001';
const apiKey   = () => process.env.BACKEND_API_KEY  ?? '';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${backend()}/api/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  return Response.json(await res.json(), { status: res.status });
}

export async function GET() {
  const res = await fetch(`${backend()}/api/waitlist/count`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: 'no-store',
  });
  return Response.json(await res.json(), { status: res.status });
}
