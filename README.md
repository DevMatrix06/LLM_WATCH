# LogLens

**See exactly what your AI is doing.**

LogLens is an LLM observability platform that intercepts every Anthropic and OpenAI call your app makes and shows you the prompt, completion, latency, token count, cost, and errors in a real-time dashboard. One line of code. <1ms overhead. No proxy, no framework lock-in.

[Website](https://llm-watch.vercel.app) · [npm](https://www.npmjs.com/package/loglens-sdk) · [PyPI](https://pypi.org/project/loglens-sdk) · [Product Hunt](https://www.producthunt.com/posts/loglens)

---

## Why LogLens

You're shipping an AI product. You have no idea which prompts are slow, which features are expensive, or why your app failed at 2am. Your AI layer is a black box.

LogLens fixes that. Wrap your existing client, deploy your app, and open the dashboard. Every call is there — what was asked, what the AI said, how long it took, and what it cost you.

---

## Quick start

### 1. Sign up

Go to [llm-watch.vercel.app](https://llm-watch.vercel.app) and create an account. No credit card needed.

### 2. Get your API key

Go to **Settings** in the dashboard and copy your personal key (`lw_live_...`).

### 3. Install the SDK

**TypeScript / JavaScript:**

```bash
npm install loglens-sdk
```

**Python:**

```bash
pip install loglens-sdk
```

### 4. Wrap your client

**TypeScript with Anthropic:**

```ts
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic } from "loglens-sdk";

const anthropic = wrapAnthropic(new Anthropic(), {
  apiKey: "lw_live_your_key",
  projectId: "my-app",
});

// Use exactly as before — every call is now logged
const msg = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});
```

**TypeScript with OpenAI:**

```ts
import OpenAI from "openai";
import { wrapOpenAI } from "loglens-sdk";

const openai = wrapOpenAI(new OpenAI(), {
  apiKey: "lw_live_your_key",
  projectId: "my-app",
});

const res = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
});
```

**Python with Anthropic:**

```python
import anthropic
from loglens_sdk import wrap_anthropic

client = wrap_anthropic(
    anthropic.Anthropic(),
    api_key="lw_live_your_key",
    project_id="my-app",
)

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
```

**Python with OpenAI:**

```python
import openai
from loglens_sdk import wrap_openai

client = wrap_openai(
    openai.OpenAI(),
    api_key="lw_live_your_key",
    project_id="my-app",
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

### 5. Open the dashboard

Go to [llm-watch.vercel.app/dashboard](https://llm-watch.vercel.app/dashboard) and watch your calls appear in real time.

---

## Features

### Real-time log explorer
Every LLM call in a searchable, filterable table. Search across prompts, completions, project IDs, user IDs, session IDs, and tags. Click any row to see the full prompt, completion, token breakdown, and metadata.

### Cost analytics
Total spend, per-model cost breakdown, and a daily spend chart over the last 30 days. Cost is calculated at ingest time using a built-in pricing table covering all current Claude and GPT models.

### Latency monitoring
Per-call latency captured at the SDK layer. Color-coded in the dashboard — green below 500ms, amber below 2s, red above 2s.

### Error tracking
Failed calls are logged with the error type (RateLimitError, AuthenticationError, etc.) and full error message. Error rows appear highlighted in red with an error badge in the dashboard.

### Cost alerts
Set a per-call cost threshold and your email in Settings. If any single call exceeds that threshold, you get an email alert instantly via Resend.

### Prompt masking
Enable `maskPrompts: true` in the SDK and prompt/completion text is replaced with `[masked]` before leaving your app. Only metadata (latency, tokens, cost) is sent. Full observability without sending sensitive data.

### Per-user isolation
Every user gets a unique API key on signup. All logs are scoped to your account. No user can access another user's data.

---

## SDK options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | `string` | — | Your LogLens API key (required) |
| `projectId` | `string` | — | Label calls by project for filtering |
| `userId` | `string` | — | Attribute calls to a specific end user |
| `sessionId` | `string` | — | Group calls by session |
| `tags` | `string[]` | — | Arbitrary labels like `["prod", "chat"]` |
| `maskPrompts` | `boolean` | `false` | Send only metadata, mask prompt/completion text |

---

## What gets logged

Each call sends this payload to the LogLens backend:

```json
{
  "timestamp": "2026-06-05T12:00:00.000Z",
  "model": "claude-sonnet-4-6",
  "prompt": "[user]: Hello",
  "completion": "Hi there!",
  "latency_ms": 843,
  "tokens_used": 42,
  "input_tokens": 12,
  "output_tokens": 30,
  "cost_usd": 0.000126,
  "project_id": "my-app",
  "user_id": "user-123",
  "session_id": "sess-abc",
  "tags": ["prod"],
  "error_type": null,
  "error_message": null
}
```

---

## Architecture

```
Your app → loglens-sdk → LogLens backend (Railway) → PostgreSQL
                                  ↓
                          LogLens dashboard (Vercel)
```

| Component | Tech | Role |
| --- | --- | --- |
| SDK (TypeScript) | npm: loglens-sdk | Wraps Anthropic/OpenAI clients, captures telemetry |
| SDK (Python) | PyPI: loglens-sdk | Same for Python apps |
| Backend | Express + Prisma + PostgreSQL | Validates keys, stores logs, triggers alerts |
| Dashboard | Next.js + Tailwind + Recharts | Real-time log explorer and analytics |
| Auth | Clerk | User accounts and per-user API key isolation |
| Email alerts | Resend | Cost threshold notifications |

---

## How it works under the hood

The SDK wraps your client in place by patching the relevant method (e.g. `messages.create` for Anthropic, `chat.completions.create` for OpenAI). Your TypeScript types and method signatures are unchanged.

**Streaming:** For Anthropic's `messages.stream()`, the SDK attaches a listener to the `finalMessage` event which fires after stream completion with exact token counts. No wrapping of the stream object, no breaking the API surface. For OpenAI streaming, pass `stream_options: { include_usage: true }` for accurate token counts.

**Fire-and-forget:** The ingest POST is fully asynchronous and never awaited on the critical path. A broken or unreachable LogLens endpoint will never block or crash your app. <1ms overhead per call.

**Error capture:** Both success and failure paths are instrumented. Failed calls log `error_type` (the SDK exception class name) and `error_message` alongside standard telemetry.

---

## Pricing

| | Free | Pro ($9/mo) | Team ($29/mo) |
| --- | --- | --- | --- |
| Requests/month | 1,000 | Unlimited | Unlimited |
| Projects | 1 | 3 | Unlimited |
| Log retention | 7 days | 30 days | 90 days |
| Cost alerts | Yes | Yes | Yes |
| Error tracking | Yes | Yes | Yes |
| Team members | 1 | 1 | Unlimited |
| Credit card required | No | Yes | Yes |

---

## Roadmap

- **Cost breakdown per project** — visual spend attribution across projects
- **Go SDK** — for Go-based microservices
- **Logs query API** — programmatic access to your log data
- **Prompt version history** — track and diff prompt changes over time
- **Multi-step trace correlation** — group agent workflow calls into a single trace
- **Data export** — CSV and JSON export of all your logs
- **Proxy mode** — point your API base URL at LogLens instead of wrapping the client
- **Evals engine** — define quality criteria and run them across historical logs
- **Self-hosted deployment** — Docker Compose for on-premises

---

## Privacy and security

- All endpoints require Bearer token authentication with SHA-256 timing-safe comparison
- Per-user data isolation at the database level via `owner_id` scoping
- No secrets committed to the repository
- `maskPrompts: true` sends only metadata, no prompt/completion text leaves your app
- HTTPS everywhere, 5MB request body limit
- Configurable log retention (7/30/90 days)
- Full details at [llm-watch.vercel.app/data](https://llm-watch.vercel.app/data)

---

## Local development

```bash
# Clone the repo
git clone https://github.com/DevMatrix06/LLM_WATCH.git
cd LLM_WATCH

# SDK
npm install

# Backend
cd backend
cp .env.example .env
# Fill in DATABASE_URL, API_KEY, RESEND_API_KEY
npm install
npm run db:push
npm run dev          # runs on :3001

# Dashboard
cd ../llmwatch-dashboard
cp .env.local.example .env.local
# Fill in BACKEND_URL, BACKEND_API_KEY, Clerk keys
npm install
npm run dev          # runs on :3000

# Seed test data
cd ../backend
npm run seed
```

---

## Contributing

LogLens is early stage. If you have feedback, feature requests, or want to contribute, open an issue or reach out directly.

---

## License

MIT

---

Built with [Claude Code](https://claude.ai) in 48 hours.
