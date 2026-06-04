// Inserts 10 fake log entries directly into the database via Prisma.
// Reads DATABASE_URL from backend/.env automatically.
// Run: npx tsx seed.ts

import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

// Import from the backend's generated Prisma client (no extra install needed)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const LOGS = [
  {
    timestamp:     new Date('2026-06-04T14:30:00Z'),
    model:         'claude-sonnet-4-6',
    prompt:        'Review this TypeScript function for bugs:\n\nasync function fetchData(url: string) {\n  const res = await fetch(url);\n  return res.json();\n}',
    completion:    'Two issues found:\n\n1. **No error handling** — non-OK responses silently return error bodies. Add an `if (!res.ok) throw new Error(...)` check.\n\n2. **No timeout** — requests can hang indefinitely. Wrap with `AbortController` and `setTimeout`.',
    latency_ms:    1456,
    input_tokens:  89,
    output_tokens: 198,
    tokens_used:   287,
    cost_usd:      0.003234,
    project_id:    'proj-web',
    user_id:       'user-1',
    session_id:    'sess-a1',
    tags:          ['code-review'],
  },
  {
    timestamp:     new Date('2026-06-04T13:45:00Z'),
    model:         'gpt-4o',
    prompt:        'Write a SQL query to find the top 5 customers by total order value in the last 90 days.',
    completion:    "SELECT c.id, c.name, SUM(o.total) AS total_spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.created_at >= NOW() - INTERVAL '90 days'\n  AND o.status = 'completed'\nGROUP BY c.id, c.name\nORDER BY total_spend DESC\nLIMIT 5;",
    latency_ms:    923,
    input_tokens:  45,
    output_tokens: 112,
    tokens_used:   157,
    cost_usd:      0.001233,
    project_id:    'proj-api',
    user_id:       'user-2',
    session_id:    'sess-b2',
    tags:          ['sql'],
  },
  {
    timestamp:     new Date('2026-06-04T13:00:00Z'),
    model:         'claude-haiku-4-5',
    prompt:        "Classify the sentiment as positive, negative, or neutral: 'The product works as advertised but shipping took 2 weeks longer than expected.'",
    completion:    'neutral',
    latency_ms:    287,
    input_tokens:  58,
    output_tokens: 3,
    tokens_used:   61,
    cost_usd:      0.000058,
    project_id:    'proj-web',
    user_id:       'user-1',
    session_id:    'sess-a2',
    tags:          ['sentiment', 'classification'],
  },
  {
    timestamp:     new Date('2026-06-04T12:15:00Z'),
    model:         'gpt-4o-mini',
    prompt:        'What does HTTP status code 429 mean?',
    completion:    '**429 Too Many Requests** — the client has exceeded the rate limit. The server may include a `Retry-After` header indicating when the client can retry.',
    latency_ms:    312,
    input_tokens:  16,
    output_tokens: 48,
    tokens_used:   64,
    cost_usd:      0.000031,
    project_id:    'proj-api',
    user_id:       'user-2',
    session_id:    'sess-b3',
    tags:          ['docs'],
  },
  {
    timestamp:     new Date('2026-06-04T11:30:00Z'),
    model:         'claude-sonnet-4-6',
    prompt:        'Generate OpenAPI 3.0 docs for DELETE /users/{id} — requires admin auth, returns 204 on success.',
    completion:    "paths:\n  /users/{id}:\n    delete:\n      summary: Delete a user\n      security:\n        - bearerAuth: []\n      parameters:\n        - name: id\n          in: path\n          required: true\n          schema:\n            type: string\n      responses:\n        '204': { description: User deleted }\n        '401': { description: Unauthenticated }\n        '403': { description: Forbidden }\n        '404': { description: Not found }",
    latency_ms:    2134,
    input_tokens:  67,
    output_tokens: 167,
    tokens_used:   234,
    cost_usd:      0.002706,
    project_id:    'proj-api',
    user_id:       'user-2',
    session_id:    'sess-b4',
    tags:          ['docs', 'openapi'],
  },
  {
    timestamp:     new Date('2026-06-04T10:45:00Z'),
    model:         'gpt-4o',
    prompt:        "Translate to French, Spanish, and Japanese: 'Your session has expired. Please log in again.'",
    completion:    '**French:** Votre session a expiré. Veuillez vous reconnecter.\n**Spanish:** Tu sesión ha expirado. Por favor, inicia sesión de nuevo.\n**Japanese:** セッションの有効期限が切れました。再度ログインしてください。',
    latency_ms:    876,
    input_tokens:  38,
    output_tokens: 89,
    tokens_used:   127,
    cost_usd:      0.000985,
    project_id:    'proj-mobile',
    user_id:       'user-1',
    session_id:    'sess-c1',
    tags:          ['translation', 'i18n'],
  },
  {
    timestamp:     new Date('2026-06-04T10:00:00Z'),
    model:         'claude-haiku-4-5',
    prompt:        "Summarize in one sentence: Q1 2026 revenue was $4.2M (+34% YoY), operating expenses $3.1M (+18%), operating income $1.1M — the company's third consecutive profitable quarter.",
    completion:    "Q1 2026 marked the company's third straight profitable quarter, with revenue up 34% to $4.2M and $1.1M operating income as subscription growth outpaced an 18% rise in expenses.",
    latency_ms:    634,
    input_tokens:  98,
    output_tokens: 52,
    tokens_used:   150,
    cost_usd:      0.000286,
    project_id:    'proj-web',
    user_id:       'user-1',
    session_id:    'sess-a3',
    tags:          ['summarization'],
  },
  {
    timestamp:     new Date('2026-06-04T09:15:00Z'),
    model:         'gpt-4o',
    prompt:        'Write a 3-sentence professional bio for a software engineer specialising in distributed systems.',
    completion:    'Alex Chen is a software engineer with 8 years of experience building fault-tolerant distributed systems at scale. At his current company he leads the platform team responsible for a microservices architecture serving 50M daily users. He holds an MS in Computer Science from Carnegie Mellon and writes about consensus protocols and observability on his blog.',
    latency_ms:    1234,
    input_tokens:  29,
    output_tokens: 98,
    tokens_used:   127,
    cost_usd:      0.001053,
    project_id:    null,
    user_id:       null,
    session_id:    null,
    tags:          ['copywriting'],
  },
  {
    timestamp:     new Date('2026-06-03T22:30:00Z'),
    model:         'claude-sonnet-4-6',
    prompt:        "Find security vulnerabilities:\n\napp.get('/admin', (req, res) => {\n  const q = `SELECT * FROM users WHERE role = '${req.query.role}'`;\n  db.query(q, (err, rows) => res.json(rows));\n});",
    completion:    '**Critical — SQL injection:** `req.query.role` is interpolated directly into the query. Fix: use parameterized queries.\n\n**Critical — no authentication:** the `/admin` route is publicly accessible. Fix: add auth middleware.\n\n**High — data over-exposure:** `SELECT *` returns all columns including sensitive fields. Fix: select only required columns.',
    latency_ms:    2891,
    input_tokens:  112,
    output_tokens: 201,
    tokens_used:   313,
    cost_usd:      0.003351,
    project_id:    'proj-web',
    user_id:       'user-1',
    session_id:    'sess-a4',
    tags:          ['security', 'code-review'],
  },
  {
    timestamp:     new Date('2026-06-03T21:45:00Z'),
    model:         'gpt-4o-mini',
    prompt:        'Convert 1500 metres to miles.',
    completion:    '1500 metres = **0.932 miles**\n(1 metre ≈ 0.000621371 miles)',
    latency_ms:    198,
    input_tokens:  13,
    output_tokens: 28,
    tokens_used:   41,
    cost_usd:      0.000019,
    project_id:    'proj-mobile',
    user_id:       'user-2',
    session_id:    'sess-d1',
    tags:          ['conversion'],
  },
];

async function main() {
  console.log(`Seeding ${LOGS.length} log entries…`);
  const { count } = await prisma.log.createMany({ data: LOGS });
  console.log(`✓ Inserted ${count} rows`);
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
