from dataclasses import dataclass, field
from typing import Callable, List, Optional


@dataclass
class WatchOptions:
    api_key: str = ''
    endpoint: str = ''
    project_id: str = ''
    user_id: str = ''
    session_id: str = ''
    tags: List[str] = field(default_factory=list)
    on_error: Optional[Callable[[Exception], None]] = None


@dataclass
class LogPayload:
    timestamp: str
    model: str
    prompt: str
    completion: str
    latency_ms: int
    tokens_used: int
    cost_usd: float
    error_type: Optional[str] = None
    error_message: Optional[str] = None
