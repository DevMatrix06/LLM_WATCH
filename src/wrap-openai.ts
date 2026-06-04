import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources/chat/completions';
import { WatchOptions, LogPayload } from './types';
import { calcCost } from './cost';
import { sendLog } from './ingest';

function extractPrompt(params: Record<string, unknown>): string {
  return ((params.messages as any[]) ?? [])
    .map((m: any) => {
      const content =
        typeof m.content === 'string'
          ? m.content
          : Array.isArray(m.content)
          ? m.content.map((c: any) => c.text ?? '').join('')
          : '';
      return `[${m.role}]: ${content}`;
    })
    .join('\n');
}

async function* interceptStream(
  stream: AsyncIterable<ChatCompletionChunk>,
  start: number,
  params: Record<string, unknown>,
  options: WatchOptions,
): AsyncGenerator<ChatCompletionChunk> {
  let completion = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let model = params.model as string;

  try {
    for await (const chunk of stream) {
      yield chunk;
      if (chunk.model) model = chunk.model;
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) completion += delta;
      // stream_options: { include_usage: true } makes usage appear on the final chunk
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens ?? 0;
        outputTokens = chunk.usage.completion_tokens ?? 0;
      }
    }
  } finally {
    const payload: LogPayload = {
      timestamp: new Date(start).toISOString(),
      model,
      prompt: extractPrompt(params),
      completion,
      latency_ms: Date.now() - start,
      tokens_used: inputTokens + outputTokens,
      cost_usd: calcCost(model, inputTokens, outputTokens),
    };
    sendLog(payload, options);
  }
}

/**
 * Patches client.chat.completions.create in-place to intercept every call.
 * Returns the same client so callers can chain: const ai = wrapOpenAI(new OpenAI(), opts)
 */
export function wrapOpenAI<T extends { chat: { completions: { create: (...args: any[]) => any } } }>(
  client: T,
  options: WatchOptions,
): T {
  const orig = client.chat.completions.create.bind(client.chat.completions);

  (client.chat.completions as any).create = async function (
    params: Record<string, unknown>,
    requestOptions?: unknown,
  ): Promise<unknown> {
    const start = Date.now();

    if (params.stream) {
      const stream = await orig(params, requestOptions);
      return interceptStream(stream, start, params, options);
    }

    const response: ChatCompletion = await orig(params, requestOptions);
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const model = response.model ?? (params.model as string);

    const payload: LogPayload = {
      timestamp: new Date(start).toISOString(),
      model,
      prompt: extractPrompt(params),
      completion: response.choices?.[0]?.message?.content ?? '',
      latency_ms: Date.now() - start,
      tokens_used: inputTokens + outputTokens,
      cost_usd: calcCost(model, inputTokens, outputTokens),
    };
    sendLog(payload, options);

    return response;
  };

  return client;
}
