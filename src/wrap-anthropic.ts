import type { Message } from '@anthropic-ai/sdk/resources/messages';
import type { RawMessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';
import { WatchOptions, LogPayload } from './types';
import { calcCost } from './cost';
import { sendLog } from './ingest';

function extractPrompt(params: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof params.system === 'string') {
    parts.push(`[system]: ${params.system}`);
  }
  for (const msg of (params.messages as any[]) ?? []) {
    const content =
      typeof msg.content === 'string'
        ? msg.content
        : (msg.content as any[]).map((c: any) => c.text ?? '').join('');
    parts.push(`[${msg.role}]: ${content}`);
  }
  return parts.join('\n');
}

function extractCompletion(response: Message): string {
  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');
}

function errorPayload(
  start: number,
  model: string,
  prompt: string,
  err: unknown,
): LogPayload {
  return {
    timestamp:     new Date(start).toISOString(),
    model,
    prompt,
    completion:    '',
    latency_ms:    Date.now() - start,
    tokens_used:   0,
    cost_usd:      0,
    error_type:    err instanceof Error ? err.constructor.name : 'UnknownError',
    error_message: err instanceof Error ? err.message : String(err),
  };
}

async function* interceptStream(
  stream: AsyncIterable<RawMessageStreamEvent>,
  start: number,
  params: Record<string, unknown>,
  options: WatchOptions,
): AsyncGenerator<RawMessageStreamEvent> {
  let completion = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let thrownError: unknown;

  try {
    for await (const event of stream) {
      yield event;
      const e = event as any;
      if (e.type === 'message_start') {
        inputTokens = e.message?.usage?.input_tokens ?? 0;
      } else if (e.type === 'content_block_delta' && e.delta?.type === 'text_delta') {
        completion += e.delta.text ?? '';
      } else if (e.type === 'message_delta') {
        outputTokens = e.usage?.output_tokens ?? 0;
      }
    }
  } catch (err) {
    thrownError = err;
    throw err;
  } finally {
    const model = params.model as string;
    if (thrownError !== undefined) {
      sendLog(errorPayload(start, model, extractPrompt(params), thrownError), options);
    } else {
      sendLog({
        timestamp:   new Date(start).toISOString(),
        model,
        prompt:      extractPrompt(params),
        completion,
        latency_ms:  Date.now() - start,
        tokens_used: inputTokens + outputTokens,
        cost_usd:    calcCost(model, inputTokens, outputTokens),
      }, options);
    }
  }
}

/**
 * Patches client.messages.create and client.messages.stream in-place.
 * Returns the same client so callers can chain: const ai = wrapAnthropic(new Anthropic(), opts)
 */
export function wrapAnthropic<T extends { messages: { create: (...args: any[]) => any } }>(
  client: T,
  options: WatchOptions,
): T {
  const orig = client.messages.create.bind(client.messages);

  (client.messages as any).create = async function (
    params: Record<string, unknown>,
    requestOptions?: unknown,
  ): Promise<unknown> {
    const start = Date.now();

    if (params.stream) {
      try {
        const stream = await orig(params, requestOptions);
        return interceptStream(stream, start, params, options);
      } catch (err) {
        sendLog(errorPayload(start, params.model as string, extractPrompt(params), err), options);
        throw err;
      }
    }

    try {
      const response: Message = await orig(params, requestOptions);
      const inputTokens  = response.usage?.input_tokens  ?? 0;
      const outputTokens = response.usage?.output_tokens ?? 0;

      sendLog({
        timestamp:   new Date(start).toISOString(),
        model:       response.model,
        prompt:      extractPrompt(params),
        completion:  extractCompletion(response),
        latency_ms:  Date.now() - start,
        tokens_used: inputTokens + outputTokens,
        cost_usd:    calcCost(response.model, inputTokens, outputTokens),
      }, options);

      return response;
    } catch (err) {
      sendLog(errorPayload(start, params.model as string, extractPrompt(params), err), options);
      throw err;
    }
  };

  // messages.stream() is the high-level streaming helper — it returns a MessageStream
  // (an EventEmitter + AsyncIterable) rather than a raw SSE stream.  We listen for the
  // 'finalMessage' event, which fires once with the fully-accumulated Message after the
  // stream ends, so we get exact token counts without touching the stream data flow.
  if (typeof (client.messages as any).stream === 'function') {
    const origStream = (client.messages as any).stream.bind(client.messages);

    (client.messages as any).stream = function (
      params: Record<string, unknown>,
      requestOptions?: unknown,
    ) {
      const start = Date.now();
      const messageStream = origStream(params, requestOptions);

      messageStream.on('finalMessage', (message: any) => {
        const inputTokens: number  = message.usage?.input_tokens  ?? 0;
        const outputTokens: number = message.usage?.output_tokens ?? 0;
        sendLog({
          timestamp:   new Date(start).toISOString(),
          model:       message.model as string,
          prompt:      extractPrompt(params),
          completion:  extractCompletion(message as Message),
          latency_ms:  Date.now() - start,
          tokens_used: inputTokens + outputTokens,
          cost_usd:    calcCost(message.model as string, inputTokens, outputTokens),
        }, options);
      });

      messageStream.on('error', (err: Error) => {
        sendLog(errorPayload(start, params.model as string, extractPrompt(params), err), options);
      });

      return messageStream;
    };
  }

  return client;
}
