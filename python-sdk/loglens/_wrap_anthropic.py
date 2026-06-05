import datetime
import time
from typing import Any, Iterator

from ._cost import calc_cost
from ._ingest import send_log
from ._types import LogPayload, WatchOptions


def _extract_prompt(kwargs: dict) -> str:
    parts = []
    for msg in kwargs.get('messages', []):
        content = msg.get('content', '')
        if isinstance(content, str):
            parts.append(content)
        elif isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get('type') == 'text':
                    parts.append(block.get('text', ''))
    return ' '.join(parts)[:2000]


def _now() -> str:
    return datetime.datetime.utcnow().isoformat() + 'Z'


def _error_payload(start: float, model: str, prompt: str, exc: Exception) -> LogPayload:
    return LogPayload(
        timestamp=_now(),
        model=model,
        prompt=prompt,
        completion='',
        latency_ms=int((time.time() - start) * 1000),
        tokens_used=0,
        cost_usd=0.0,
        error_type=type(exc).__name__,
        error_message=str(exc),
    )


class _AnthropicStreamWrapper:
    """Wraps a Stream[MessageStreamEvent] to collect and log after exhaustion."""

    def __init__(self, stream: Any, start: float, model: str, prompt: str, opts: WatchOptions):
        self._stream = stream
        self._start = start
        self._model = model
        self._prompt = prompt
        self._opts = opts

    def __iter__(self) -> Iterator:
        completion_parts = []
        input_tokens = 0
        output_tokens = 0
        thrown = None

        try:
            for event in self._stream:
                event_type = getattr(event, 'type', None)
                if event_type == 'content_block_delta':
                    delta = getattr(event, 'delta', None)
                    if getattr(delta, 'type', None) == 'text_delta':
                        completion_parts.append(getattr(delta, 'text', ''))
                elif event_type == 'message_start':
                    usage = getattr(getattr(event, 'message', None), 'usage', None)
                    if usage:
                        input_tokens = getattr(usage, 'input_tokens', 0)
                elif event_type == 'message_delta':
                    usage = getattr(event, 'usage', None)
                    if usage:
                        output_tokens = getattr(usage, 'output_tokens', 0)
                yield event
        except Exception as exc:
            thrown = exc
            raise
        finally:
            latency = int((time.time() - self._start) * 1000)
            if thrown:
                payload = _error_payload(self._start, self._model, self._prompt, thrown)
                payload.latency_ms = latency
            else:
                total = input_tokens + output_tokens
                payload = LogPayload(
                    timestamp=_now(),
                    model=self._model,
                    prompt=self._prompt,
                    completion=''.join(completion_parts),
                    latency_ms=latency,
                    tokens_used=total,
                    cost_usd=calc_cost(self._model, input_tokens, output_tokens),
                )
            send_log(payload, self._opts)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        if hasattr(self._stream, '__exit__'):
            return self._stream.__exit__(*args)
        return False

    def __getattr__(self, name: str):
        return getattr(self._stream, name)


class _WrappedMessages:
    def __init__(self, messages: Any, opts: WatchOptions):
        self._messages = messages
        self._opts = opts

    def create(self, **kwargs):
        start = time.time()
        model: str = kwargs.get('model', 'unknown')
        prompt = _extract_prompt(kwargs)

        if kwargs.get('stream'):
            raw = self._messages.create(**kwargs)
            return _AnthropicStreamWrapper(raw, start, model, prompt, self._opts)

        try:
            resp = self._messages.create(**kwargs)
            latency = int((time.time() - start) * 1000)

            completion = ''.join(
                getattr(block, 'text', '')
                for block in getattr(resp, 'content', [])
                if getattr(block, 'type', None) == 'text'
            )
            usage = getattr(resp, 'usage', None)
            input_tokens = getattr(usage, 'input_tokens', 0) if usage else 0
            output_tokens = getattr(usage, 'output_tokens', 0) if usage else 0

            payload = LogPayload(
                timestamp=_now(),
                model=model,
                prompt=prompt,
                completion=completion,
                latency_ms=latency,
                tokens_used=input_tokens + output_tokens,
                cost_usd=calc_cost(model, input_tokens, output_tokens),
            )
            send_log(payload, self._opts)
            return resp
        except Exception as exc:
            send_log(_error_payload(start, model, prompt, exc), self._opts)
            raise

    def __getattr__(self, name: str):
        return getattr(self._messages, name)


class WrappedAnthropic:
    def __init__(self, client: Any, opts: WatchOptions):
        self._client = client
        self.messages = _WrappedMessages(client.messages, opts)

    def __getattr__(self, name: str):
        return getattr(self._client, name)


def wrap_anthropic(client: Any, options: WatchOptions) -> WrappedAnthropic:
    return WrappedAnthropic(client, options)
