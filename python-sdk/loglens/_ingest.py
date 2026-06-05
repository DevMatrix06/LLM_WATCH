import json
import threading
import urllib.request
import urllib.error
from dataclasses import asdict

DEFAULT_ENDPOINT = 'https://llmwatch-production.up.railway.app/ingest'
_dev_notice_printed = False


def _do_send(body: bytes, endpoint: str, api_key: str, on_error) -> None:
    try:
        req = urllib.request.Request(
            endpoint,
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
                'User-Agent': 'loglens-sdk-python/0.1.1',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status >= 400 and on_error:
                on_error(Exception(f'LogLens ingest failed: HTTP {resp.status}'))
    except Exception as e:
        if on_error:
            on_error(e)


def _truncate(s: str, n: int = 120) -> str:
    return s[:n] + ' …' if len(s) > n else s


def _dev_log(payload, options) -> None:
    global _dev_notice_printed
    if not _dev_notice_printed:
        print('[loglens] Dev mode — set api_key to send logs to the dashboard.\n')
        _dev_notice_printed = True

    if payload.error_type:
        print(f'[loglens] {payload.model}  ·  {payload.latency_ms}ms  ·  ERROR: {payload.error_type}')
        print(f'  prompt:  {_truncate(payload.prompt)}')
        print(f'  error:   {payload.error_message or ""}')
        print()
        return

    cost_str = f'${payload.cost_usd:.6f}' if payload.cost_usd > 0 else 'cost unknown'
    parts = [payload.model, f'{payload.latency_ms}ms', f'{payload.tokens_used} tokens', cost_str]
    if options.project_id:
        parts.append(f'project:{options.project_id}')
    print(f'[loglens] {"  ·  ".join(parts)}')
    print(f'  prompt:     {_truncate(payload.prompt)}')
    print(f'  completion: {_truncate(payload.completion)}')
    if options.tags:
        print(f'  tags:       {", ".join(options.tags)}')
    print()


def send_log(payload, options) -> None:
    if not options.api_key:
        _dev_log(payload, options)
        return

    endpoint = options.endpoint or DEFAULT_ENDPOINT
    body_dict = asdict(payload)

    # remove None values and add enrichment fields
    body_dict = {k: v for k, v in body_dict.items() if v is not None}
    if options.mask_prompts:
        body_dict['prompt']     = '[masked]'
        body_dict['completion'] = '[masked]'
    if options.project_id:
        body_dict['projectId'] = options.project_id
    if options.user_id:
        body_dict['userId'] = options.user_id
    if options.session_id:
        body_dict['sessionId'] = options.session_id
    if options.tags:
        body_dict['tags'] = options.tags

    body = json.dumps(body_dict).encode('utf-8')

    t = threading.Thread(
        target=_do_send,
        args=(body, endpoint, options.api_key, options.on_error),
        daemon=True,
    )
    t.start()
