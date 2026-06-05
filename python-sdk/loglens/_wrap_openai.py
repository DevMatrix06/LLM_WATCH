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


class _OpenAIStreamWrapper:
    """Wraps a Stream[ChatCompletionChunk] to collect and log after exhaustion."""

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
            for chunk in self._stream:
                choices = getattr(chunk, 'choices', [])
                if choices:
                    delta = getattr(choices[0], 'delta', None)
                    content = getattr(delta, 'content', None) if delta else None
                    if content:
                        completion_parts.append(content)

                # usage is sent in the final chunk when stream_options.include_usage=True
                usage = getattr(chunk, 'usage', None)
                if usage:
                    input_tokens = getattr(usage, 'prompt_tokens', 0)
                    output_tokens = getattr(usage, 'completion_tokens', 0)

                yield chunk
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


class _WrappedCompletions:
    def __init__(self, completions: Any, opts: WatchOptions):
        self._completions = completions
        self._opts = opts

    def create(self, **kwargs):
        start = time.time()
        model: str = kwargs.get('model', 'unknown')
        prompt = _extract_prompt(kwargs)

        if kwargs.get('stream'):
            raw = self._completions.create(**kwargs)
            return _OpenAIStreamWrapper(raw, start, model, prompt, self._opts)

        try:
            resp = self._completions.create(**kwargs)
            latency = int((time.time() - start) * 1000)

            choices = getattr(resp, 'choices', [])
            completion = ''
            if choices:
                msg = getattr(choices[0], 'message', None)
                completion = getattr(msg, 'content', '') or ''

            usage = getattr(resp, 'usage', None)
            input_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
            output_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0

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
        return getattr(self._completions, name)


class _WrappedChat:
    def __init__(self, chat: Any, opts: WatchOptions):
        self._chat = chat
        self.completions = _WrappedCompletions(chat.completions, opts)

    def __getattr__(self, name: str):
        return getattr(self._chat, name)


class WrappedOpenAI:
    def __init__(self, client: Any, opts: WatchOptions):
        self._client = client
        self.chat = _WrappedChat(client.chat, opts)

    def __getattr__(self, name: str):
        return getattr(self._client, name)


def wrap_openai(client: Any, options: WatchOptions) -> WrappedOpenAI:
    return WrappedOpenAI(client, options)
