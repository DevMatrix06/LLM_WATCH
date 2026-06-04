import { LogPayload, WatchOptions } from './types';

const DEFAULT_ENDPOINT = 'https://api.llmwatch.io/ingest';

// Printed once per process so dev mode is obvious but not spammy.
let devNoticePrinted = false;

function buildEnriched(payload: LogPayload, options: WatchOptions): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  if (options.projectId)    out.projectId = options.projectId;
  if (options.userId)       out.userId    = options.userId;
  if (options.sessionId)    out.sessionId = options.sessionId;
  if (options.tags?.length) out.tags      = options.tags;
  if (options.metadata)     Object.assign(out, options.metadata);
  return out;
}

function truncate(s: string, n = 120): string {
  return s.length > n ? `${s.slice(0, n)} …` : s;
}

function devLog(payload: LogPayload, options: WatchOptions): void {
  if (!devNoticePrinted) {
    console.log('[llmwatch] Dev mode — set apiKey to send logs to the dashboard.\n');
    devNoticePrinted = true;
  }

  const enriched = buildEnriched(payload, options);
  const cost = payload.cost_usd > 0 ? `$${payload.cost_usd.toFixed(6)}` : 'cost unknown';

  const meta = [
    payload.model,
    `${payload.latency_ms}ms`,
    `${payload.tokens_used} tokens`,
    cost,
    enriched.projectId && `project:${enriched.projectId}`,
    enriched.userId    && `user:${enriched.userId}`,
    enriched.sessionId && `session:${enriched.sessionId}`,
  ].filter(Boolean).join('  ·  ');

  console.log(`[llmwatch] ${meta}`);
  console.log(`  prompt:     ${truncate(payload.prompt)}`);
  console.log(`  completion: ${truncate(payload.completion)}`);
  if (Array.isArray(enriched.tags) && enriched.tags.length) {
    console.log(`  tags:       ${enriched.tags.join(', ')}`);
  }
  console.log('');
}

export function sendLog(payload: LogPayload, options: WatchOptions): void {
  if (!options.apiKey) {
    devLog(payload, options);
    return;
  }

  const body = JSON.stringify(buildEnriched(payload, options));

  // Intentionally fire-and-forget: ingest must never throw or block the caller.
  fetch(options.endpoint ?? DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`,
      'User-Agent': 'llmwatch-sdk/0.4.0',
    },
    body,
  }).then(res => {
    if (!res.ok) {
      options.onError?.(
        new Error(`LLMWatch ingest failed: HTTP ${res.status} ${res.statusText}`),
      );
    }
  }).catch(err => {
    options.onError?.(err instanceof Error ? err : new Error(String(err)));
  });
}
